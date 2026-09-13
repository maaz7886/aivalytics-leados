// src/pages/Dashboard.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import KpiCard from '../components/KpiCard';
import MetaLeadSimulatorModal from '../components/MetaLeadSimulatorModal';
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { leads, setSelectedLeadId } = useApp();
  const navigate = useNavigate();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedProgramFilter] = useState<'all' | 'ai-pm' | 'ai-gtm' | 'ai-fellowship'>('all');

  const filteredLeads = leads.filter((l) => {
    if (selectedProgramFilter === 'all') return true;
    if (selectedProgramFilter === 'ai-pm') return l.programId === 'ai-pm' || l.programName.toLowerCase().includes('project');
    if (selectedProgramFilter === 'ai-gtm') return l.programId === 'ai-gtm' || l.programName.toLowerCase().includes('gtm');
    if (selectedProgramFilter === 'ai-fellowship') return l.programId === 'ai-fellowship' || l.programName.toLowerCase().includes('fellowship');
    return true;
  });

  const totalRevenueCalc = selectedProgramFilter === 'ai-pm' ? '₹1,49,997' : selectedProgramFilter === 'ai-gtm' ? '₹1,64,997' : selectedProgramFilter === 'ai-fellowship' ? '₹2,99,997' : '₹6,14,991';

  const kpis = [
    { title: 'New Leads Today', value: filteredLeads.length + 8 },
    { title: 'Leads Contacted', value: Math.max(1, filteredLeads.length + 4) },
    { title: 'Qualified Leads', value: filteredLeads.length },
    { title: 'Follow-ups Due', value: Math.max(1, Math.floor(filteredLeads.length * 0.7)) },
    { title: 'Seat Reservations', value: Math.max(1, Math.floor(filteredLeads.length * 0.5)) },
    { title: 'Enrollments', value: Math.max(1, Math.floor(filteredLeads.length * 0.3)) },
    { title: 'Revenue', value: totalRevenueCalc },
    { title: 'Conversion Rate', value: selectedProgramFilter === 'all' ? '24.8%' : selectedProgramFilter === 'ai-fellowship' ? '33.3%' : '21.5%' }
  ];

  const funnelData = [
    { name: 'New Lead', value: filteredLeads.length * 10 + 15, fill: '#0A6F3D' },
    { name: 'AI Prepared', value: filteredLeads.length * 8 + 12, fill: '#08602F' },
    { name: 'Contact Pending', value: filteredLeads.length * 6 + 10, fill: '#064F22' },
    { name: 'Connected', value: filteredLeads.length * 5 + 8, fill: '#145C33' },
    { name: 'Qualified', value: filteredLeads.length * 4 + 6, fill: '#1C7F3A' },
    { name: 'Details Sent', value: filteredLeads.length * 3 + 4, fill: '#279948' },
    { name: 'Follow-Up', value: filteredLeads.length * 2 + 3, fill: '#3AA757' },
    { name: 'Payment Link Sent', value: filteredLeads.length * 2 + 1, fill: '#55BD71' },
    { name: 'Seat Reserved', value: Math.max(1, filteredLeads.length), fill: '#80D497' },
    { name: 'Enrolled', value: Math.max(1, Math.floor(filteredLeads.length * 0.5)), fill: '#B3E6C2' }
  ];


  const handleViewLead = (id: string) => {
    setSelectedLeadId(id);
    navigate('/ai');
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Executive Sales Dashboard</h1>
          <p className="text-sm text-gray-500">Real-time revenue intelligence & Meta Ads conversion funnel.</p>
        </div>
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center gap-2"
        >
          <span>⚡</span> + Simulate Incoming Meta Lead
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      {/* Funnel Chart & Negative Statuses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Lead Pipeline Conversion Funnel</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip formatter={(value: any) => [`${value} Leads`, 'Count']} />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#888" stroke="none" dataKey="name" fontSize={11} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Negative Statuses Breakdown */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Negative / Nurture Stages</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">No Response</span>
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 font-bold text-xs rounded">14 Leads</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Long-Term Nurture</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-xs rounded">22 Leads</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Not Interested</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-xs rounded">8 Leads</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Unqualified</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-xs rounded">5 Leads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Priority Leads */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🔥</span> Today's Priority Leads
          </h2>
          <button
            onClick={() => navigate('/leads')}
            className="text-xs font-bold text-primary-600 hover:underline"
          >
            View All Database ➔
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/60 text-xs text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-3">Name</th>
                <th className="p-3">Program</th>
                <th className="p-3">Current Role</th>
                <th className="p-3">Exp</th>
                <th className="p-3">Main Goal</th>
                <th className="p-3 text-center">Fit Score</th>
                <th className="p-3 text-center">Intent Score</th>
                <th className="p-3">CRM Stage</th>
                <th className="p-3">Next Action</th>
                <th className="p-3">Assigned Salesperson</th>
                <th className="p-3 text-right">CTA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{lead.fullName}</td>
                  <td className="p-3 text-xs font-medium text-gray-700 dark:text-gray-300">{lead.programName}</td>
                  <td className="p-3 text-xs">{lead.currentRole}</td>
                  <td className="p-3 text-xs">{lead.yearsOfExperience} yrs</td>
                  <td className="p-3 text-xs font-semibold text-gray-600 dark:text-gray-300">{lead.primaryGoal}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 font-bold text-xs rounded">
                      {lead.fitScore}/100
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded">
                      {lead.intentScore}/100
                    </span>
                  </td>
                  <td className="p-3 text-xs font-semibold">{lead.crmStage}</td>
                  <td className="p-3 text-xs text-gray-600 dark:text-gray-300">{lead.recommendedNextAction}</td>
                  <td className="p-3 text-xs text-gray-500">{lead.assignedSalesperson}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleViewLead(lead.id)}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg shadow-xs"
                    >
                      View Lead
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MetaLeadSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}
