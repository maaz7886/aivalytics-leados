// src/pages/AllLeads.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead } from '../types';
import LeadDetailModal from '../components/LeadDetailModal';
import { EmptyState } from '../components/EmptyState';
import { Search, Phone, Filter } from 'lucide-react';

export default function AllLeads() {
  const { allLeads, leads, salespeople, assignLead } = useApp();
  const leadsPool = allLeads || leads;

  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [repFilter, setRepFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = leadsPool.filter((lead) => {
    if (stageFilter !== 'All' && lead.crmStage !== stageFilter && lead.leadStage !== stageFilter) {
      return false;
    }
    if (repFilter !== 'All' && lead.assignedSalesperson !== repFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (lead.fullName || '').toLowerCase().includes(q);
      const matchPhone = (lead.phone || '').includes(q);
      const matchEmail = (lead.email || '').toLowerCase().includes(q);
      const matchProg = (lead.programName || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchProg) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              All Leads Database
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {filtered.length} of {leadsPool.length} Leads
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complete database of enrolled candidates, active prospects, and historical inquiries across both programs.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by candidate name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
            >
              <option value="All">All Stages</option>
              <option value="New Lead">New Lead</option>
              <option value="Interested">Interested</option>
              <option value="Qualified">Qualified</option>
              <option value="Call Later">Call Later</option>
              <option value="Details Sent on WhatsApp">WhatsApp Sent</option>
              <option value="Converted">Converted (Paid)</option>
              <option value="Not Interested">Not Interested</option>
            </select>

            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
            >
              <option value="All">All Representatives</option>
              {salespeople.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="No candidate records match your current search or filter criteria. Try clearing filters."
            actionText="Clear Filters"
            onAction={() => {
              setSearchTerm('');
              setStageFilter('All');
              setRepFilter('All');
            }}
            className="m-6"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-3">Program</th>
                  <th className="py-3 px-3">Status / Stage</th>
                  <th className="py-3 px-3">Assigned Salesperson</th>
                  <th className="py-3 px-3">Last Contacted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {lead.fullName}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span>{lead.phone}</span>
                        <span>•</span>
                        <span>{lead.email}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {lead.programName || (lead.programId === 'ai-pm' ? 'AI-Native PM' : '3-Day Builder')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        lead.crmStage === 'Converted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : lead.crmStage === 'Interested' || lead.crmStage === 'Qualified'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {lead.crmStage || 'New Lead'}
                      </span>
                    </td>

                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.assignedSalesperson || 'Unassigned'}
                        onChange={(e) => assignLead(lead.id, e.target.value)}
                        className="px-2 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        <option value="Unassigned">Unassigned</option>
                        {salespeople.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3 text-gray-500 font-mono text-[11px]">
                      {lead.lastContacted ? lead.lastContacted.substring(0, 10) : 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          title="Call Candidate"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
