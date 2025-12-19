export default function ReportsPage() {
  const reports = [
    { id: 1, name: "Q4 Market Analysis", date: "Dec 15, 2024", status: "completed" },
    { id: 2, name: "Competitor Research", date: "Dec 10, 2024", status: "completed" },
    { id: 3, name: "User Survey Results", date: "Dec 5, 2024", status: "in_progress" },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pages / Research Reports</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Research Reports</h1>
          </div>
          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Report
          </button>
        </div>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900">{report.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{report.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === "completed" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        report.status === "completed" ? "bg-emerald-500" : "bg-amber-500"
                      }`}></span>
                      {report.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

