export default function InvoicesPage() {
  const invoices = [
    { id: "INV-001", date: "Dec 1, 2024", amount: "$49.00", status: "paid" },
    { id: "INV-002", date: "Nov 1, 2024", amount: "$49.00", status: "paid" },
    { id: "INV-003", date: "Oct 1, 2024", amount: "$49.00", status: "paid" },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pages / Invoices</p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">Invoices</h1>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">$147.00</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">Researcher</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Next Billing</p>
            <p className="text-2xl font-bold text-gray-900">Jan 1, 2025</p>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Billing History</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Download
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

