export default function AssistantPage() {
  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pages / Research Assistant</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Research Assistant</h1>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">AI Research Assistant</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Leverage AI to help you research topics, analyze data, and generate insights from your documents.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors">
              Start New Research
            </button>
            <button className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
              View History
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

