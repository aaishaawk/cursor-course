/**
 * GitHub API utilities for fetching repository information
 */

// Parse GitHub URL to extract owner and repo
export function parseGithubUrl(githubUrl: string): { owner: string; repo: string } | null {
  const match = githubUrl.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/.*)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// Repository info from GitHub API
export interface RepoInfo {
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  language: string | null;
  description: string | null;
  homepage: string | null;
  license: string | null;
  error?: string;
}

// Release info from GitHub API
export interface ReleaseInfo {
  latestVersion: string | null;
  releaseName: string | null;
  releaseDate: string | null;
  releaseUrl: string | null;
  error?: string;
}

// README content result
export interface ReadmeResult {
  content: string | null;
  error?: string;
}

/**
 * Fetch repository info (stars, forks, etc.) from GitHub API
 */
export async function getRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    console.log(`Fetching repo info from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Blingo-GitHub-Summarizer",
      },
    });

    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return { 
        stars: null, 
        forks: null, 
        openIssues: null, 
        language: null, 
        description: null,
        homepage: null,
        license: null,
        error: `GitHub API error: ${response.status}` 
      };
    }

    const data = await response.json();
    return {
      stars: data.stargazers_count ?? null,
      forks: data.forks_count ?? null,
      openIssues: data.open_issues_count ?? null,
      language: data.language ?? null,
      description: data.description ?? null,
      homepage: data.homepage || null,
      license: data.license?.name ?? null,
    };
  } catch (err) {
    console.error("Error fetching repo info:", err);
    return { 
      stars: null, 
      forks: null, 
      openIssues: null, 
      language: null, 
      description: null,
      homepage: null,
      license: null,
      error: `Network error: ${err instanceof Error ? err.message : "Unknown"}` 
    };
  }
}

/**
 * Fetch latest release/version from GitHub API
 */
export async function getLatestRelease(owner: string, repo: string): Promise<ReleaseInfo> {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
    console.log(`Fetching latest release from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Blingo-GitHub-Summarizer",
      },
    });

    if (!response.ok) {
      // Try tags if no releases
      if (response.status === 404) {
        return await getLatestTag(owner, repo);
      }
      console.error(`GitHub API error: ${response.status}`);
      return { 
        latestVersion: null, 
        releaseName: null, 
        releaseDate: null, 
        releaseUrl: null,
        error: `No releases found` 
      };
    }

    const data = await response.json();
    return {
      latestVersion: data.tag_name ?? null,
      releaseName: data.name ?? null,
      releaseDate: data.published_at ?? null,
      releaseUrl: data.html_url ?? null,
    };
  } catch (err) {
    console.error("Error fetching latest release:", err);
    return { 
      latestVersion: null, 
      releaseName: null, 
      releaseDate: null, 
      releaseUrl: null,
      error: `Network error: ${err instanceof Error ? err.message : "Unknown"}` 
    };
  }
}

/**
 * Fallback: Fetch latest tag if no releases exist
 */
export async function getLatestTag(owner: string, repo: string): Promise<ReleaseInfo> {
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/tags`;
    
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Blingo-GitHub-Summarizer",
      },
    });

    if (!response.ok || response.status === 404) {
      return { 
        latestVersion: null, 
        releaseName: null, 
        releaseDate: null, 
        releaseUrl: null,
        error: "No releases or tags found" 
      };
    }

    const tags = await response.json();
    if (tags.length === 0) {
      return { 
        latestVersion: null, 
        releaseName: null, 
        releaseDate: null, 
        releaseUrl: null,
        error: "No tags found" 
      };
    }

    const latestTag = tags[0];
    return {
      latestVersion: latestTag.name ?? null,
      releaseName: `Tag: ${latestTag.name}`,
      releaseDate: null,
      releaseUrl: `https://github.com/${owner}/${repo}/releases/tag/${latestTag.name}`,
    };
  } catch (err) {
    console.error("Error fetching tags:", err);
    return { 
      latestVersion: null, 
      releaseName: null, 
      releaseDate: null, 
      releaseUrl: null,
      error: `Network error: ${err instanceof Error ? err.message : "Unknown"}` 
    };
  }
}

/**
 * Fetch README content from GitHub repo
 */
export async function getReadmeContent(githubUrl: string): Promise<ReadmeResult> {
  try {
    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) return { content: null, error: "Invalid GitHub URL format" };

    const { owner, repo } = parsed;

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

/**
 * Fetch all GitHub repo data in parallel
 */
export async function getFullRepoData(githubUrl: string): Promise<{
  repoInfo: RepoInfo;
  releaseInfo: ReleaseInfo;
  readme: ReadmeResult;
}> {
  const parsed = parseGithubUrl(githubUrl);
  
  if (!parsed) {
    return {
      repoInfo: { stars: null, forks: null, openIssues: null, language: null, description: null, homepage: null, license: null, error: "Invalid URL" },
      releaseInfo: { latestVersion: null, releaseName: null, releaseDate: null, releaseUrl: null, error: "Invalid URL" },
      readme: { content: null, error: "Invalid GitHub URL format" },
    };
  }

  const { owner, repo } = parsed;

  // Fetch all data in parallel for better performance
  const [repoInfo, releaseInfo, readme] = await Promise.all([
    getRepoInfo(owner, repo),
    getLatestRelease(owner, repo),
    getReadmeContent(githubUrl),
  ]);

  return { repoInfo, releaseInfo, readme };
}

