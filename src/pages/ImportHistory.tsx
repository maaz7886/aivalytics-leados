

export default function ImportHistory() {
  const dummyHistory = [
    { id: 'batch-001', date: '2023-10-25 14:30', filename: 'meta_leads_oct.csv', total: 450, imported: 410, updated: 20, skipped: 20, errors: 0, by: 'Admin' },
    { id: 'batch-002', date: '2023-10-24 09:15', filename: 'google_search_leads.csv', total: 120, imported: 120, updated: 0, skipped: 0, errors: 0, by: 'Admin' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🕒</span> Import History
        </h1>
        <p className="text-sm text-gray-500 mt-1">Audit log of all bulk lead import batches.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">Date & Time</th>
              <th className="p-4">File Name</th>
              <th className="p-4">Imported By</th>
              <th className="p-4">Total Rows</th>
              <th className="p-4 text-emerald-600">Imported</th>
              <th className="p-4 text-blue-600">Updated</th>
              <th className="p-4 text-amber-600">Skipped (Dupes)</th>
              <th className="p-4 text-red-600">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {dummyHistory.map(h => (
              <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 text-gray-800 dark:text-gray-200">
                <td className="p-4 font-medium">{h.date}</td>
                <td className="p-4 font-mono text-xs">{h.filename}</td>
                <td className="p-4">{h.by}</td>
                <td className="p-4 font-bold">{h.total}</td>
                <td className="p-4 text-emerald-600 font-bold">{h.imported}</td>
                <td className="p-4 text-blue-600 font-bold">{h.updated}</td>
                <td className="p-4 text-amber-600 font-bold">{h.skipped}</td>
                <td className="p-4 text-red-600 font-bold">{h.errors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
