"use client";

import { useState } from "react";

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

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("https://github.com/vercel/next.js");
  const [response, setResponse] = useState<SummarizerResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

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
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pages / API Playground</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">GitHub Summarizer Playground</h1>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Request</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="blingo-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Your API key from the API Keys page</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Full GitHub repository URL to summarize</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Request Preview</p>
                <pre className="text-xs text-gray-700 font-mono overflow-x-auto">
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
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
                  "Send Request"
                )}
              </button>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Response</h3>
              {statusCode && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  statusCode >= 200 && statusCode < 300 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "bg-red-50 text-red-700"
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
                    <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-emerald-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p>Fetching repo info and generating summary...</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Send a request to see the response</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formatted Results */}
        {response && response.success && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
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
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
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
                        <span className="text-emerald-500 mt-1">✦</span>
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
                      className="h-full bg-emerald-500 rounded-full transition-all"
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
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
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
    </>
  );
}
