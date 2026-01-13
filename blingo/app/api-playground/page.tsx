"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SummarizerResponse {
  success: boolean;
  githubUrl?: string;
  hasReadme?: boolean;
  summary?: string;
  cool_facts?: string[];
  stars?: number;
  forks?: number;
  language?: string;
  description?: string;
  homepage?: string;
  license?: string;
  latestVersion?: string;
  releaseName?: string;
  releaseDate?: string;
  usage?: number;
  limit?: number;
  remaining?: number;
  error?: string;
}

export default function ApiPlaygroundPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("https://github.com/vercel/next.js");
  const [response, setResponse] = useState<SummarizerResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Redirect to login if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    router.push("/api/auth/signin");
    return null;
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setStatusCode(400);
      setRawResponse(JSON.stringify({ error: "Please enter your API key" }, null, 2));
      setResponse({ success: false, error: "Please enter your API key" });
      return;
    }

    if (!githubUrl.trim()) {
      setStatusCode(400);
      setRawResponse(JSON.stringify({ error: "Please enter a GitHub URL" }, null, 2));
      setResponse({ success: false, error: "Please enter a GitHub URL" });
      return;
    }

    setLoading(true);
    setResponse(null);
    setRawResponse(null);
    setStatusCode(null);

    try {
      const res = await fetch("/api/github-summarizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ githubUrl }),
      });

      setStatusCode(res.status);
      const data = await res.json();
      setResponse(data);
      setRawResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Request failed";
      setStatusCode(500);
      setRawResponse(JSON.stringify({ error: errorMsg }, null, 2));
      setResponse({ success: false, error: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-amber-600 hover:text-amber-700 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <p className="text-sm text-amber-600 font-medium">API Playground</p>
              <h1 className="text-xl font-bold text-gray-900">GitHub Summarizer</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Signed in as <span className="font-medium text-gray-900">{session.user?.name || session.user?.email}</span>
            </span>
            <Link 
              href="/dashboards" 
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-xs font-bold rounded">POST</span>
                Request
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="blingo-xxxxxxxx..."
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-amber-400 font-mono text-sm transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from the{" "}
                  <Link href="/dashboards" className="text-amber-600 hover:underline">Dashboard</Link>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-900 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-xs font-medium text-gray-400 mb-2">Request Preview</p>
                <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
{`POST /api/github-summarizer
Headers:
  x-api-key: ${apiKey ? "••••••••" + apiKey.slice(-8) : "<your-api-key>"}
  Content-Type: application/json

Body:
${JSON.stringify({ githubUrl: githubUrl || "<github-url>" }, null, 2)}`}
                </pre>
              </div>

              <button
                onClick={handleTest}
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Summarizing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Response</h3>
              {statusCode && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  statusCode >= 200 && statusCode < 300 
                    ? "bg-green-100 text-green-700" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {statusCode} {statusCode >= 200 && statusCode < 300 ? "OK" : "Error"}
                </span>
              )}
            </div>
            <div className="p-6">
              {rawResponse ? (
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto text-sm font-mono max-h-[400px]">
                  {rawResponse}
                </pre>
              ) : loading ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-amber-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p>Fetching repo info and generating summary...</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Send a request to see the response</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formatted Results */}
        {response && response.success && (
          <div className="mt-6 bg-white rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 bg-amber-50">
              <h3 className="font-semibold text-gray-900">Summary Results</h3>
            </div>
            <div className="p-6">
              {/* Repo Stats */}
              <div className="flex flex-wrap gap-3 mb-6">
                {response.language && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {response.language}
                  </span>
                )}
                {response.stars !== undefined && response.stars !== null && (
                  <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {response.stars.toLocaleString()} stars
                  </span>
                )}
                {response.forks !== undefined && response.forks !== null && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {response.forks.toLocaleString()} forks
                  </span>
                )}
                {response.latestVersion && (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    v{response.latestVersion}
                  </span>
                )}
                {response.license && (
                  <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                    {response.license}
                  </span>
                )}
              </div>

              {/* Description */}
              {response.description && (
                <p className="text-gray-600 mb-6">{response.description}</p>
              )}

              {/* Summary */}
              {response.summary && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-700 leading-relaxed">{response.summary}</p>
                </div>
              )}

              {/* Cool Facts */}
              {response.cool_facts && response.cool_facts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Cool Facts</h4>
                  <ul className="space-y-2">
                    {response.cool_facts.map((fact, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-1">✦</span>
                        <span className="text-gray-700">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Usage Stats */}
              {response.usage !== undefined && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">API Usage</span>
                    <span className="text-gray-700 font-medium">
                      {response.usage} / {response.limit} requests ({response.remaining} remaining)
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${((response.usage || 0) / (response.limit || 100)) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {response && !response.success && response.error && (
          <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-red-700 mt-1">{response.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

