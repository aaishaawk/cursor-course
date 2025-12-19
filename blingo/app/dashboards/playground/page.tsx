"use client";

import { useState } from "react";

export default function PlaygroundPage() {
  const [endpoint, setEndpoint] = useState("/api/search");
  const [response, setResponse] = useState<string | null>(null);

  const handleTest = () => {
    setResponse(JSON.stringify({
      success: true,
      data: {
        results: [
          { id: 1, title: "Sample Result 1", score: 0.95 },
          { id: 2, title: "Sample Result 2", score: 0.87 },
        ],
        meta: {
          total: 2,
          time_ms: 42
        }
      }
    }, null, 2));
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pages / API Playground</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">API Playground</h1>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
                <select 
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="/api/search">GET /api/search</option>
                  <option value="/api/analyze">POST /api/analyze</option>
                  <option value="/api/summarize">POST /api/summarize</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Request Body</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-40"
                  defaultValue={`{
  "query": "artificial intelligence",
  "limit": 10
}`}
                />
              </div>
              <button 
                onClick={handleTest}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Response</h3>
              {response && (
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded">
                  200 OK
                </span>
              )}
            </div>
            <div className="p-6">
              {response ? (
                <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto text-sm font-mono h-64">
                  {response}
                </pre>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Send a request to see the response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

