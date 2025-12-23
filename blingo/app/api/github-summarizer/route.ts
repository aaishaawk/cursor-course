import { NextRequest, NextResponse } from "next/server";
import { summarizeGithubRepo } from "@/lib/chain";
import { supabase } from "@/lib/supabase";

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
// Set DEV_BYPASS_AUTH=true in .env.local for corporate networks with SSL interception
const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === "true";

// Validate API key against Supabase
async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey) {
    return { valid: false, error: "API key is required" };
  }

  // DEV MODE: Skip database check if bypass is enabled
  if (DEV_BYPASS_AUTH && apiKey.startsWith("blingo-")) {
    console.log("⚠️ DEV MODE: Bypassing database validation");
    return { valid: true };
  }

  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, key")
      .eq("key", apiKey)
      .maybeSingle();

    if (error) {
      console.error("Supabase error details:", error);
      return { valid: false, error: `Database error: ${error.message}` };
    }

    if (!data) {
      return { valid: false, error: "Invalid API key" };
    }

    return { valid: true };
  } catch (err: unknown) {
    console.error("Full validation error:", err);
    // Network errors in Node.js - might be proxy/firewall issue
    if (err instanceof Error && err.message.includes("fetch failed")) {
      return { 
        valid: false, 
        error: "Network error connecting to database. This might be a firewall/proxy issue in your environment." 
      };
    }
    return { valid: false, error: `Validation error: ${err instanceof Error ? err.message : "Unknown error"}` };
  }
}

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
    // Extract owner and repo from URL (e.g., https://github.com/owner/repo)
    const match = githubUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/.*)?$/);
    if (!match) return { content: null, error: "Invalid GitHub URL format" };

    const owner = match[1];
    const repo = match[2];

    // Try main branch first, then master
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
      error: `Network error fetching README (likely corporate proxy blocking): ${err instanceof Error ? err.message : "Unknown"}` 
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
  const { valid, error } = await validateApiKey(apiKey || "");

  if (!valid) {
    return jsonResponse({ error: error || "Unauthorized" }, 401);
  }

  return jsonResponse({
    success: true,
    message: "GitHub Summarizer API is ready. Use POST with a githubUrl in the body.",
  });
}

// POST - Summarize GitHub repo
export async function POST(request: NextRequest) {
  const apiKey = getApiKeyFromRequest(request);
  const { valid, error } = await validateApiKey(apiKey || "");

  if (!valid) {
    return jsonResponse({ error: error || "Unauthorized" }, 401);
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { githubUrl, readmeContent: providedReadme } = body;

  // Allow direct README content for testing (bypasses GitHub fetch)
  let readmeContent: string | null = null;
  let fetchError: string | undefined;

  if (providedReadme) {
    // Use provided README content directly (DEV MODE)
    console.log("📄 Using provided README content (bypassing GitHub fetch)");
    readmeContent = providedReadme;
  } else if (githubUrl) {
    // Validate GitHub URL format
    const isValidGithubUrl = /^https:\/\/github\.com\/[^\/]+\/[^\/]+/.test(githubUrl);
    if (!isValidGithubUrl) {
      return jsonResponse({ error: "Invalid GitHub URL format. Expected: https://github.com/owner/repo" }, 400);
    }

    // Fetch README content from GitHub
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

  // Use LangChain to summarize the README
  const summaryResult = await summarizeGithubRepo(readmeContent);

  return jsonResponse({
    success: summaryResult.success,
    githubUrl: githubUrl || null,
    hasReadme: true,
    readmePreview: readmeContent.slice(0, 500) + (readmeContent.length > 500 ? "..." : ""),
    summary: summaryResult.summary,
    cool_facts: summaryResult.cool_facts,
    ...(summaryResult.mock && { mock: true }),
    ...(summaryResult.error && { error: summaryResult.error }),
  });
}
