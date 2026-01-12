import { NextRequest, NextResponse } from "next/server";
import { summarizeGithubRepo } from "@/lib/chain";
import { 
  validateApiKeyWithRateLimit, 
  incrementUsage, 
  DEFAULT_RATE_LIMIT 
} from "@/lib/rate-limit";
import {
  parseGithubUrl,
  getRepoInfo,
  getLatestRelease,
  getReadmeContent,
  RepoInfo,
  ReleaseInfo,
} from "@/lib/github";

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
  let parsedRepo: { owner: string; repo: string } | null = null;
  let repoInfo: RepoInfo = { stars: null, forks: null, openIssues: null, language: null, description: null, homepage: null, license: null };
  let releaseInfo: ReleaseInfo = { latestVersion: null, releaseName: null, releaseDate: null, releaseUrl: null };

  // Parse GitHub URL if provided (for fetching stars, version, etc.)
  if (githubUrl) {
    const isValidGithubUrl = /^https:\/\/github\.com\/[^\/]+\/[^\/]+/.test(githubUrl);
    if (!isValidGithubUrl) {
      return jsonResponse({ error: "Invalid GitHub URL format. Expected: https://github.com/owner/repo" }, 400);
    }
    parsedRepo = parseGithubUrl(githubUrl);
  }

  if (providedReadme) {
    // README provided directly - only fetch repo info and release in parallel
    console.log("📄 Using provided README content");
    readmeContent = providedReadme;
    
    if (parsedRepo) {
      const [repoResult, releaseResult] = await Promise.all([
        getRepoInfo(parsedRepo.owner, parsedRepo.repo),
        getLatestRelease(parsedRepo.owner, parsedRepo.repo),
      ]);
      repoInfo = repoResult;
      releaseInfo = releaseResult;
    }
  } else if (githubUrl && parsedRepo) {
    // No README provided - fetch ALL THREE in parallel for maximum speed
    console.log("🚀 Fetching README, repo info, and release in parallel");
    const [readmeResult, repoResult, releaseResult] = await Promise.all([
      getReadmeContent(githubUrl),
      getRepoInfo(parsedRepo.owner, parsedRepo.repo),
      getLatestRelease(parsedRepo.owner, parsedRepo.repo),
    ]);
    readmeContent = readmeResult.content;
    fetchError = readmeResult.error;
    repoInfo = repoResult;
    releaseInfo = releaseResult;
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
      stars: repoInfo.stars,
      forks: repoInfo.forks,
      language: repoInfo.language,
      homepage: repoInfo.homepage,
      license: repoInfo.license,
      latestVersion: releaseInfo.latestVersion,
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
    // Repository stats
    stars: repoInfo.stars,
    forks: repoInfo.forks,
    openIssues: repoInfo.openIssues,
    language: repoInfo.language,
    description: repoInfo.description,
    homepage: repoInfo.homepage,
    license: repoInfo.license,
    // Version info
    latestVersion: releaseInfo.latestVersion,
    releaseName: releaseInfo.releaseName,
    releaseDate: releaseInfo.releaseDate,
    releaseUrl: releaseInfo.releaseUrl,
    // Usage stats
    usage: currentUsage,
    limit: DEFAULT_RATE_LIMIT,
    remaining: DEFAULT_RATE_LIMIT - currentUsage,
    ...(summaryResult.mock && { mock: true }),
    ...(summaryResult.error && { error: summaryResult.error }),
  });
}
