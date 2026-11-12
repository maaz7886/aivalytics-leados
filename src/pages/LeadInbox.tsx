// src/pages/LeadInbox.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead } from '../types';
import LeadDetailModal from '../components/LeadDetailModal';

export default function LeadInbox() {
  const {
    allLeads,
    leads,
    salespeople,
    assignLead,
    bulkAssignLeads,
    autoDistributeRoundRobin,
    roundRobinEnabled,
    setRoundRobinEnabled
  } = useApp();

  const leadsPool = allLeads || leads;

  // Unassigned leads: assignedSalesperson is null, empty, 'Unassigned', or not matching active salespeople
  const unassignedLeads = leadsPool
    .filter(
      (l) =>
        !l.assignedSalesperson ||
        l.assignedSalesperson === 'Unassigned' ||
        l.assignedSalesperson.trim() === ''
    )
    .sort((a, b) => {
      const timeA = new Date(a.dateCaptured || a.createdTime || 0).getTime();
      const timeB = new Date(b.dateCaptured || b.createdTime || 0).getTime();
      return timeB - timeA;
    });

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [targetRep, setTargetRep] = useState<string>('');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeReps = salespeople.filter((s) => s.status === 'Active');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredUnassigned = unassignedLeads.filter((l) => {
    if (programFilter !== 'All' && l.programId !== programFilter && l.programName !== programFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = (l.fullName || '').toLowerCase().includes(q);
      const matchPhone = (l.phone || '').includes(q);
      const matchEmail = (l.email || '').toLowerCase().includes(q);
      const matchCampaign = (l.metaCampaign || l.campaignName || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchCampaign) return false;
    }
    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(filteredUnassigned.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleManualBulkAssign = () => {
    if (selectedLeadIds.length === 0 || !targetRep) return;
    bulkAssignLeads(selectedLeadIds, targetRep);
    showToast(`Assigned ${selectedLeadIds.length} leads to ${targetRep}`);
    setSelectedLeadIds([]);
    setTargetRep('');
  };

  const handleAutoAssignSelected = () => {
    if (selectedLeadIds.length === 0) {
      autoDistributeRoundRobin();
      showToast('Auto-assigned all unassigned leads across active reps');
    } else {
      autoDistributeRoundRobin(selectedLeadIds);
      showToast(`Auto-assigned ${selectedLeadIds.length} selected leads across active reps`);
      setSelectedLeadIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-900 text-white rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in">
          <span>✅</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📥</span>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Unassigned Lead Inbox
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              {unassignedLeads.length} Unassigned
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Real-time feed of all incoming leads from Meta Ads and Google Sheets awaiting salesperson assignment. Assign individually, bulk assign, or trigger capacity-checked Round-Robin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Round Robin Auto Mode Toggle */}
          <button
            onClick={() => {
              const next = !roundRobinEnabled;
              setRoundRobinEnabled(next);
              showToast(`Automatic Round-Robin on new leads is now ${next ? 'ENABLED' : 'DISABLED'}`);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              roundRobinEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
            title="When ON, incoming leads are auto-assigned to active reps respecting daily limits"
          >
            <span className={`w-2 h-2 rounded-full ${roundRobinEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span>Auto-Assign on Ingest: <strong>{roundRobinEnabled ? 'ON' : 'OFF'}</strong></span>
          </button>

          {/* Auto Assign Button */}
          <button
            onClick={handleAutoAssignSelected}
            className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>⚡</span> {selectedLeadIds.length > 0 ? `Auto-Assign (${selectedLeadIds.length})` : 'Auto-Assign All'}
          </button>
        </div>
      </div>

      {/* Active Reps Capacity Strip */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <span>👥</span> Active Sales Reps & Daily Capacity:
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            {activeReps.length} reps online
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {activeReps.map((rep) => {
            const todayStr = new Date().toISOString().substring(0, 10);
            const assignedToday = leadsPool.filter(
              (l) => l.assignedSalesperson === rep.name && l.assignedAt && l.assignedAt.startsWith(todayStr)
            ).length;
            const cap = rep.dailyLeadCapacity || 30;
            const pct = Math.min(100, Math.round((assignedToday / cap) * 100));
            const isFull = assignedToday >= cap;

            return (
              <div
                key={rep.id}
                className={`p-2.5 rounded-xl border text-xs ${
                  isFull
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 dark:text-gray-100 truncate">{rep.name}</span>
                  <span className={`text-[10px] font-black ${isFull ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {assignedToday}/{cap}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isFull ? 'bg-amber-500' : 'bg-emerald-600'}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {isFull ? 'At Capacity' : `${cap - assignedToday} slots free`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name, phone, ad campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-1.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-64"
            />
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200"
            >
              <option value="All">All Programs</option>
              <option value="ai-pm">AI-Native PM</option>
              <option value="ai-builder">3-Day AI Workshop</option>
            </select>
          </div>

          <span className="text-xs text-gray-500">
            Showing <strong>{filteredUnassigned.length}</strong> unassigned leads
          </span>
        </div>

        {/* Bulk Action Strip */}
        {selectedLeadIds.length > 0 && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
              <span>🎯</span>
              <span><strong>{selectedLeadIds.length}</strong> leads selected</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={targetRep}
                onChange={(e) => setTargetRep(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                <option value="">-- Assign to Active Rep --</option>
                {activeReps.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleManualBulkAssign}
                disabled={!targetRep}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all"
              >
                Assign
              </button>

              <button
                onClick={handleAutoAssignSelected}
                className="px-3 py-1.5 bg-[#133926] hover:bg-[#1a4a33] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all flex items-center gap-1"
              >
                <span>⚡</span> Auto-Assign Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredUnassigned.length > 0 &&
                      selectedLeadIds.length === filteredUnassigned.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-3">Lead Details</th>
                <th className="py-3 px-3">Program</th>
                <th className="py-3 px-3">Source & Campaign</th>
                <th className="py-3 px-3">Created / Ingested</th>
                <th className="py-3 px-3 text-right">Assign Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUnassigned.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <span className="text-3xl block mb-2">🎉</span>
                    No unassigned leads! All incoming leads have been distributed to sales reps.
                  </td>
                </tr>
              ) : (
                filteredUnassigned.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const createdDate = lead.dateCaptured || lead.createdTime || lead.dateOfFillingForm || 'Just now';

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors ${
                        isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleLead(lead.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="font-bold text-gray-900 dark:text-gray-100 hover:text-emerald-600 text-left cursor-pointer"
                        >
                          {lead.fullName}
                        </button>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{lead.phone}</span>
                          <span>•</span>
                          <span>{lead.email}</span>
                          {lead.city && <span>• {lead.city}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {lead.programName || (lead.programId === 'ai-pm' ? 'AI-Native PM' : '3-Day Workshop')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                          {lead.source || 'Meta Ads'}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate max-w-xs" title={lead.metaCampaign || lead.campaignName}>
                          {lead.metaCampaign || lead.campaignName || lead.formName || 'Direct Campaign'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                        {createdDate}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              assignLead(lead.id, e.target.value);
                              showToast(`Assigned ${lead.fullName} to ${e.target.value}`);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
                        >
                          <option value="">Assign To...</option>
                          {activeReps.map((r) => (
                            <option key={r.id} value={r.name}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLeadForDetail && (
        <LeadDetailModal
          lead={selectedLeadForDetail}
          isOpen={!!selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
        />
      )}
    </div>
  );
}
