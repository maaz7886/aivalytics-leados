// src/pages/Dashboard.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import KpiCard from '../components/KpiCard';
import MetaLeadSimulatorModal from '../components/MetaLeadSimulatorModal';
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { leads, tasks, setSelectedLeadId } = useApp();
  const navigate = useNavigate();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<'all' | 'ai-pm' | 'ai-gtm' | 'ai-fellowship'>('all');

  // Filter leads based on selected program cohort
  const filteredLeads = leads.filter((l) => {
    if (selectedProgramFilter === 'all') return true;
    const pName = (l.programName || '').toLowerCase();
    if (selectedProgramFilter === 'ai-pm') return l.programId === 'ai-pm' || pName.includes('project');
    if (selectedProgramFilter === 'ai-gtm') return l.programId === 'ai-gtm' || pName.includes('gtm');
    if (selectedProgramFilter === 'ai-fellowship') return l.programId === 'ai-fellowship' || pName.includes('fellowship');
    return true;
  });

  // Real Dynamic Metrics & Aggregations
  const totalLeadsCount = filteredLeads.length;

  const contactedCount = filteredLeads.filter(
    (l) => l.numberOfCalls > 0 || (l.lastContacted && l.lastContacted !== 'Not Contacted') || (l.crmStage !== 'New Lead')
  ).length;

  const qualifiedCount = filteredLeads.filter(
    (l) => l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp' || l.crmStage === 'Joined Session' || l.crmStage === 'Converted'
  ).length;

  const pendingTasksCount = tasks.filter((t) => t.status === 'Pending').length;
  const followUpsDueCount = pendingTasksCount + filteredLeads.filter((l) => l.numberOfFollowUps > 0 || l.nextFollowUp).length;

  const seatReservationsCount = filteredLeads.filter(
    (l) => l.crmStage === 'Joined Session' || l.enrollmentStatus === 'Reserved' || l.crmStage === 'Details Sent on WhatsApp'
  ).length;

  const enrollmentsCount = filteredLeads.filter(
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid' || l.enrollmentStatus === 'Enrolled'
  ).length;

  // Real Pipeline Revenue Calculation
  const totalRevenueNumber = filteredLeads.reduce((sum, l) => {
    const paid = Number(l.amountPaid || 0);
    if (paid > 0) return sum + paid;
    if (l.crmStage === 'Converted' || l.paymentStatus === 'Paid') {
      return sum + (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999);
    }
    // Estimated potential pipeline value
    if (l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp') {
      return sum + (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999) * 0.5;
    }
    return sum;
  }, 0);

  const formattedRevenue = `₹${Math.round(totalRevenueNumber).toLocaleString('en-IN')}`;

  const conversionRate = totalLeadsCount > 0
    ? `${((enrollmentsCount / totalLeadsCount) * 100).toFixed(1)}%`
    : '0.0%';

  const kpis = [
    { title: 'Total Leads', value: totalLeadsCount },
    { title: 'Leads Contacted', value: contactedCount },
    { title: 'Qualified Leads', value: qualifiedCount },
    { title: 'Follow-ups Due', value: followUpsDueCount },
    { title: 'Seat Reservations', value: seatReservationsCount },
    { title: 'Enrollments', value: enrollmentsCount },
    { title: 'Pipeline Revenue', value: formattedRevenue },
    { title: 'Conversion Rate', value: conversionRate }
  ];

  // Dynamic Funnel Stage Counts
  const interestedStageCount = filteredLeads.filter((l) => l.crmStage === 'Interested').length;
  const qualifiedStageCount = filteredLeads.filter((l) => l.crmStage === 'Qualified').length;
  const detailsSentStageCount = filteredLeads.filter((l) => l.crmStage === 'Details Sent on WhatsApp').length;
  const seatReservedStageCount = filteredLeads.filter((l) => l.crmStage === 'Joined Session' || l.enrollmentStatus === 'Reserved').length;
  const enrolledStageCount = filteredLeads.filter((l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid').length;

  const funnelData = [
    { name: 'Total Captured Leads', value: totalLeadsCount || 1, fill: '#0A6F3D' },
    { name: 'Contacted', value: contactedCount || 1, fill: '#08602F' },
    { name: 'Interested', value: interestedStageCount || 1, fill: '#064F22' },
    { name: 'Qualified', value: qualifiedStageCount || 1, fill: '#1C7F3A' },
    { name: 'Details Sent', value: detailsSentStageCount || 1, fill: '#279948' },
    { name: 'Joined Session', value: seatReservedStageCount || 1, fill: '#55BD71' },
    { name: 'Converted', value: enrolledStageCount || 1, fill: '#80D497' }
  ];

  // Dynamic Negative / Nurture Breakdown
  const noResponseCount = filteredLeads.filter((l) => l.crmStage === "Did Not Receive Call" || l.lastContacted === 'Not Contacted').length;
  const nurtureCount = filteredLeads.filter((l) => l.crmStage === 'Details Sent on WhatsApp' || l.crmStage === 'Interested').length;
  const notInterestedCount = filteredLeads.filter((l) => l.crmStage === 'Not Interested').length;
  const unqualifiedCount = filteredLeads.filter((l) => l.crmStage === 'Unqualified' || l.crmStage === 'Lost').length;

  const handleViewLead = (id: string) => {
    setSelectedLeadId(id);
    navigate('/ai');
  };

  return (
    <div className="space-y-6">
      {/* Executive Header & Program Cohort Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Executive Sales Dashboard</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-300 dark:border-emerald-700 animate-pulse">
              ● Live Cloud DB Sync
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">Real-time revenue intelligence & Meta Ads conversion funnel across all active cohorts.</p>
        </div>

        {/* Program Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 mr-1">Cohort Filter:</span>
          {(['all', 'ai-pm', 'ai-gtm', 'ai-fellowship'] as const).map((prog) => (
            <button
              key={prog}
              onClick={() => setSelectedProgramFilter(prog)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedProgramFilter === prog
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {prog === 'all' ? 'All Cohorts' : prog === 'ai-pm' ? 'AI-PM' : prog === 'ai-gtm' ? 'AI-GTM' : 'AI-Fellowship'}
            </button>
          ))}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ml-2 cursor-pointer"
          >
            <span>⚡</span> + Simulate Meta Lead
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
        ))}
      </div>

      {/* Funnel Chart & Negative Statuses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Live Pipeline Conversion Funnel</h2>
            <span className="text-xs font-semibold text-gray-500">{filteredLeads.length} Total Leads Active</span>
          </div>
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
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Negative / Nurture Stages</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">No Response / Unattempted</span>
              <span className="px-2.5 py-0.5 bg-gray-200 dark:bg-gray-600 font-bold text-xs rounded-lg text-gray-800 dark:text-gray-200">
                {noResponseCount} Leads
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active Nurture</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-bold text-xs rounded-lg">
                {nurtureCount} Leads
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Not Interested</span>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 font-bold text-xs rounded-lg">
                {notInterestedCount} Leads
              </span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Unqualified / Invalid</span>
              <span className="px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 font-bold text-xs rounded-lg">
                {unqualifiedCount} Leads
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Priority Leads */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>🔥</span> Today's Top Priority Leads
            </h2>
            <p className="text-xs text-gray-500">Sorted by AI Fit & Purchase Intent scores.</p>
          </div>
          <button
            onClick={() => navigate('/pipeline')}
            className="text-xs font-extrabold text-primary-600 hover:underline cursor-pointer"
          >
            View All Pipeline ({leads.length}) ➔
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
                <th className="p-3">Assigned Rep</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.slice(0, 8).map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{lead.fullName}</td>
                  <td className="p-3 text-xs font-medium text-gray-700 dark:text-gray-300">{lead.programName}</td>
                  <td className="p-3 text-xs capitalize">{lead.currentRole?.replace('_', ' ') || 'Professional'}</td>
                  <td className="p-3 text-xs">{lead.yearsOfExperience} yrs</td>
                  <td className="p-3 text-xs font-semibold text-gray-600 dark:text-gray-300">{lead.primaryGoal}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xs rounded-md">
                      {lead.fitScore}/100
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-md">
                      {lead.intentScore}/100
                    </span>
                  </td>
                  <td className="p-3 text-xs font-semibold">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md">
                      {lead.crmStage}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-gray-500">{lead.assignedSalesperson || 'Alex Rivera'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleViewLead(lead.id)}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                    >
                      View AI Brief
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
