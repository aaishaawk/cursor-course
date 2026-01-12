import { NextRequest, NextResponse } from "next/server";
import { summarizeGithubRepo } from "@/lib/chain";
import { 
  validateApiKeyWithRateLimit, 
  incrementUsage, 
  DEFAULT_RATE_LIMIT 
} from "@/lib/rate-limit";

// CORS headers helper
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
};

// Helper to create JSON response with CORS
function jsonResponse(data: object, status: number = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

// DEV MODE: Use environment variable to control auth bypass
const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "true";

// Extract API key from request headers
function getApiKeyFromRequest(request: NextRequest): string | null {
  return (
    request.headers.get("x-api-key") ||
    request.headers.get("Authorization")?.replace("Bearer ", "") ||
    null
  );
}

// Fetch README content from GitHub repo
async function getReadmeContent(githubUrl: string): Promise<{ content: string | null; error?: string }> {
  try {
    const match = githubUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/.*)?$/);
    if (!match) return { content: null, error: "Invalid GitHub URL format" };

    const owner = match[1];
    const repo = match[2];

    for (const branch of ["main", "master"]) {
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
      console.log(`Fetching README from: ${readmeUrl}`);
      
      const response = await fetch(readmeUrl);
      console.log(`Response status: ${response.status}`);
      
      if (response.ok) {
        return { content: await response.text() };
      }
    }
    return { content: null, error: "README not found in main or master branch" };
  } catch (err) {
    console.error("GitHub fetch error:", err);
    return { 
      content: null, 
      error: `Network error fetching README: ${err instanceof Error ? err.message : "Unknown"}` 
    };
  }
}

// CORS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET - Check API status
export async function GET(request: NextRequest) {
  const apiKey = getApiKeyFromRequest(request);
  
  // DEV MODE bypass
  if (DEV_BYPASS_AUTH && apiKey?.startsWith("blingo-")) {
    return jsonResponse({
      success: true,
      message: "GitHub Summarizer API is ready (DEV MODE).",
      usage: 0,
      limit: DEFAULT_RATE_LIMIT,
      remaining: DEFAULT_RATE_LIMIT,
    });
  }

  const { valid, error, rateLimited, keyData } = await validateApiKeyWithRateLimit(apiKey || "");

  if (rateLimited) {
    return jsonResponse({ 
      error: error || "Rate limit exceeded",
      usage: keyData?.usage,
      limit: DEFAULT_RATE_LIMIT
    }, 429);
  }

  if (!valid) {
    return jsonResponse({ error: error || "Unauthorized" }, 401);
  }

  return jsonResponse({
    success: true,
    message: "GitHub Summarizer API is ready. Use POST with a githubUrl in the body.",
    usage: keyData?.usage || 0,
    limit: DEFAULT_RATE_LIMIT,
    remaining: DEFAULT_RATE_LIMIT - (keyData?.usage || 0),
  });
}

// POST - Summarize GitHub repo
export async function POST(request: NextRequest) {
  const apiKey = getApiKeyFromRequest(request);
  
  // DEV MODE bypass
  if (DEV_BYPASS_AUTH && apiKey?.startsWith("blingo-")) {
    console.log("⚠️ DEV MODE: Bypassing rate limit check");
  } else {
    const { valid, error, rateLimited, keyData } = await validateApiKeyWithRateLimit(apiKey || "");

    if (rateLimited) {
      return jsonResponse({ 
        error: error || "Rate limit exceeded. Please upgrade your plan or contact support.",
        usage: keyData?.usage,
        limit: DEFAULT_RATE_LIMIT
      }, 429);
    }

    if (!valid) {
      return jsonResponse({ error: error || "Unauthorized" }, 401);
    }

    // Store keyData for later use
    (request as NextRequest & { keyData?: typeof keyData }).keyData = keyData;
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { githubUrl, readmeContent: providedReadme } = body;

  // Allow direct README content for testing
  let readmeContent: string | null = null;
  let fetchError: string | undefined;

  if (providedReadme) {
    console.log("📄 Using provided README content");
    readmeContent = providedReadme;
  } else if (githubUrl) {
    const isValidGithubUrl = /^https:\/\/github\.com\/[^\/]+\/[^\/]+/.test(githubUrl);
    if (!isValidGithubUrl) {
      return jsonResponse({ error: "Invalid GitHub URL format. Expected: https://github.com/owner/repo" }, 400);
    }

    const result = await getReadmeContent(githubUrl);
    readmeContent = result.content;
    fetchError = result.error;
  } else {
    return jsonResponse({ error: "Either githubUrl or readmeContent is required" }, 400);
  }

  if (!readmeContent) {
    return jsonResponse({
      success: false,
      githubUrl: githubUrl || null,
      hasReadme: false,
      summary: null,
      cool_facts: [],
      error: fetchError || "No README found in this repository.",
    });
  }

  // Get keyData from request or re-validate
  let keyData = (request as NextRequest & { keyData?: { id: string; usage: number } }).keyData;
  if (!keyData && !DEV_BYPASS_AUTH) {
    const validation = await validateApiKeyWithRateLimit(apiKey || "");
    keyData = validation.keyData;
  }

  // Increment usage BEFORE making the expensive LLM call
  if (keyData?.id) {
    await incrementUsage(keyData.id);
  }

  // Use LangChain to summarize the README
  const summaryResult = await summarizeGithubRepo(readmeContent);

  const currentUsage = (keyData?.usage || 0) + 1;

  return jsonResponse({
    success: summaryResult.success,
    githubUrl: githubUrl || null,
    hasReadme: true,
    readmePreview: readmeContent.slice(0, 500) + (readmeContent.length > 500 ? "..." : ""),
    summary: summaryResult.summary,
    cool_facts: summaryResult.cool_facts,
    usage: currentUsage,
    limit: DEFAULT_RATE_LIMIT,
    remaining: DEFAULT_RATE_LIMIT - currentUsage,
    ...(summaryResult.mock && { mock: true }),
    ...(summaryResult.error && { error: summaryResult.error }),
  });
}
