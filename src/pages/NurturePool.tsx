
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function NurturePool() {
  const { leads, setSelectedLeadId } = useApp();
  const navigate = useNavigate();

  // Mock nurture leads
  const nurtureLeads = leads
    .filter(l => !['Converted', 'Lost', 'Unqualified'].includes(l.crmStage) && l.temperature === 'Cold')
    .map(l => ({
      ...l,
      nurtureReason: 'Timing / No Urgency',
      returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      nurtureInterval: '30 Days',
    }));

  const handleView = (id: string) => {
    setSelectedLeadId(id);
    navigate('/profile');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🌱</span> Nurture Engine
        </h1>
        <p className="text-sm text-gray-500 mt-1">Leads that are interested but not ready yet. They will automatically surface when their nurture period ends.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-500 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4">Lead</th>
              <th className="p-4">Previous Stage</th>
              <th className="p-4">Nurture Reason</th>
              <th className="p-4">Interval</th>
              <th className="p-4">Return Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {nurtureLeads.length > 0 ? (
              nurtureLeads.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 text-gray-800 dark:text-gray-200">
                  <td className="p-4 font-bold">{l.fullName}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">{l.crmStage}</span></td>
                  <td className="p-4 text-gray-500">{l.nurtureReason}</td>
                  <td className="p-4 font-bold text-blue-600">{l.nurtureInterval}</td>
                  <td className="p-4 font-bold text-emerald-600">{l.returnDate}</td>
                  <td className="p-4">
                    <button onClick={() => handleView(l.id)} className="text-primary-600 hover:underline font-bold text-xs">View Profile</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No leads currently in the Nurture Pool.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
