// src/components/LeadTable.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LeadTable() {
  const { leads, setSelectedLeadId, updateLeadStage } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedView, setSelectedView] = useState('All Leads');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(search.toLowerCase()) ||
      lead.currentRole.toLowerCase().includes(search.toLowerCase()) ||
      lead.currentCompany.toLowerCase().includes(search.toLowerCase()) ||
      lead.industry.toLowerCase().includes(search.toLowerCase());

    const matchesProgram = programFilter === 'All' || lead.programName.includes(programFilter);
    const matchesStage = stageFilter === 'All' || lead.crmStage === stageFilter;

    if (selectedView === 'Hot Leads') return matchesSearch && matchesProgram && matchesStage && lead.leadTemperature === 'Hot';
    if (selectedView === 'High Fit Leads') return matchesSearch && matchesProgram && matchesStage && lead.fitScore >= 85;
    if (selectedView === 'Qualified') return matchesSearch && matchesProgram && matchesStage && lead.crmStage === 'Qualified';
    if (selectedView === 'Payment Pending') return matchesSearch && matchesProgram && matchesStage && lead.crmStage === 'Payment Link Sent';

    return matchesSearch && matchesProgram && matchesStage;
  });

  const handleOpenLead = (id: string) => {
    setSelectedLeadId(id);
    navigate('/ai');
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <input
            type="text"
            placeholder="Search leads by name, role, company, or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[280px] focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="All">All Programs</option>
            <option value="Project Management">Project Management</option>
            <option value="GTM">GTM</option>
            <option value="Fellowship">Fellowship</option>
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="All">All Stages</option>
            <option value="New Lead">New Lead</option>
            <option value="AI Prepared">AI Prepared</option>
            <option value="Contact Pending">Contact Pending</option>
            <option value="Connected">Connected</option>
            <option value="Qualified">Qualified</option>
            <option value="Follow-Up">Follow-Up</option>
            <option value="Payment Link Sent">Payment Link Sent</option>
          </select>
        </div>

        {/* Saved Views Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-gray-400 font-semibold mr-1">Saved Views:</span>
          {['All Leads', 'Hot Leads', 'High Fit Leads', 'Qualified', 'Payment Pending'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                selectedView === view
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-bold uppercase tracking-wider">
              <th className="p-3.5">Lead Name</th>
              <th className="p-3.5">Program</th>
              <th className="p-3.5">Current Role</th>
              <th className="p-3.5">Exp</th>
              <th className="p-3.5">Primary Goal</th>
              <th className="p-3.5 text-center">Fit Score</th>
              <th className="p-3.5 text-center">Intent Score</th>
              <th className="p-3.5">CRM Stage</th>
              <th className="p-3.5">Next Action</th>
              <th className="p-3.5">Salesperson</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-gray-500 italic">
                  No leads found matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="p-3.5 font-bold text-gray-900 dark:text-gray-100">
                    <div>{lead.fullName}</div>
                    <div className="text-xs font-normal text-gray-400">{lead.city}, {lead.state}</div>
                  </td>
                  <td className="p-3.5 font-medium text-gray-800 dark:text-gray-200">{lead.programName}</td>
                  <td className="p-3.5 text-gray-700 dark:text-gray-300">
                    <div>{lead.currentRole}</div>
                    <div className="text-xs text-gray-400">{lead.currentCompany}</div>
                  </td>
                  <td className="p-3.5 font-medium">{lead.yearsOfExperience} yrs</td>
                  <td className="p-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300">{lead.primaryGoal}</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-1 rounded bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-extrabold text-xs border border-primary-200">
                      {lead.fitScore}/100
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200">
                      {lead.intentScore}/100
                    </span>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={lead.crmStage}
                      onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                      className="px-2 py-1 border rounded text-xs font-semibold bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="New Lead">New Lead</option>
                      <option value="AI Prepared">AI Prepared</option>
                      <option value="Contact Pending">Contact Pending</option>
                      <option value="Connected">Connected</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Details Sent">Details Sent</option>
                      <option value="Follow-Up">Follow-Up</option>
                      <option value="Payment Link Sent">Payment Link Sent</option>
                      <option value="Seat Reserved">Seat Reserved</option>
                      <option value="Enrolled">Enrolled</option>
                    </select>
                  </td>
                  <td className="p-3.5 text-xs font-medium text-gray-600 dark:text-gray-300">{lead.recommendedNextAction}</td>
                  <td className="p-3.5 text-xs text-gray-500">{lead.assignedSalesperson}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenLead(lead.id)}
                      className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
                    >
                      View Intelligence
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
