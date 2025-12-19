import Link from "next/link";

export default function DocsPage() {
  const docs = [
    { title: "Getting Started", description: "Learn how to set up and use the API", icon: "rocket" },
    { title: "Authentication", description: "How to authenticate your API requests", icon: "key" },
    { title: "Endpoints", description: "Complete reference of all API endpoints", icon: "code" },
    { title: "Rate Limits", description: "Understanding API rate limits and quotas", icon: "clock" },
    { title: "Error Handling", description: "How to handle errors and edge cases", icon: "alert" },
    { title: "Examples", description: "Code examples in multiple languages", icon: "terminal" },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pages / Documentation</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Documentation</h1>
          </div>
          <Link 
            href="https://docs.example.com" 
            target="_blank"
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            Open Full Docs
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <div 
              key={doc.title}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                doc.icon === "rocket" ? "bg-violet-100" :
                doc.icon === "key" ? "bg-amber-100" :
                doc.icon === "code" ? "bg-blue-100" :
                doc.icon === "clock" ? "bg-rose-100" :
                doc.icon === "alert" ? "bg-orange-100" :
                "bg-emerald-100"
              }`}>
                {doc.icon === "rocket" && (
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {doc.icon === "key" && (
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                )}
                {doc.icon === "code" && (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                )}
                {doc.icon === "clock" && (
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {doc.icon === "alert" && (
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {doc.icon === "terminal" && (
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">{doc.title}</h3>
              <p className="text-sm text-gray-500">{doc.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

