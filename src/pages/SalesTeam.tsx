// src/pages/SalesTeam.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import type { Salesperson, Lead } from '../types';
import LeadDetailModal from '../components/LeadDetailModal';

export default function SalesTeam() {
  const {
    salespeople,
    leads,
    callActivities,
    currentUser,
    setCurrentUser,
    roundRobinEnabled,
    setRoundRobinEnabled,
    autoDistributeRoundRobin,
    assignLead,
    bulkAssignLeads,
    addSalesperson,
    updateSalesperson
  } = useApp();

  const navigate = useNavigate();

  // Modals & UI States
  const [selectedRepForEdit, setSelectedRepForEdit] = useState<Salesperson | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [filterRep, setFilterRep] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkTargetRep, setBulkTargetRep] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for Add Rep
  const [newRepName, setNewRepName] = useState('');
  const [newRepEmail, setNewRepEmail] = useState('');
  const [newRepPhone, setNewRepPhone] = useState('');
  const [newRepTitle, setNewRepTitle] = useState('Sales Representative');
  const [newRepTarget, setNewRepTarget] = useState(25);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  // Calculate team-wide metrics
  const totalLeads = leads.length;
  const activeReps = salespeople.filter((s) => s.status === 'Active');
  const teamTodayCalls = callActivities.filter((c) => c.timestamp.startsWith(todayStr)).length;
  const teamTotalQualified = leads.filter(
    (l) => l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp' || l.crmStage === 'Converted'
  ).length;

  // Individual rep stats generator
  const getRepStats = (repName: string) => {
    const repLeads = leads.filter((l) => l.assignedSalesperson === repName);
    const repCallsToday = callActivities.filter(
      (c) => c.salesperson === repName && c.timestamp.startsWith(todayStr)
    ).length;
    const repInterested = repLeads.filter((l) => l.crmStage === 'Interested').length;
    const repQualified = repLeads.filter(
      (l) => l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp'
    ).length;
    const repConverted = repLeads.filter(
      (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid'
    ).length;

    return {
      totalLeads: repLeads.length,
      callsToday: repCallsToday,
      interested: repInterested,
      qualified: repQualified,
      converted: repConverted,
      conversionRate: repLeads.length > 0 ? ((repConverted / repLeads.length) * 100).toFixed(1) : '0.0'
    };
  };

  // Filtered leads for assignment table
  const filteredLeads = leads.filter((lead) => {
    if (filterRep !== 'All') {
      if (filterRep === 'Unassigned') {
        const isAssigned = salespeople.some((s) => s.name === lead.assignedSalesperson);
        if (isAssigned) return false;
      } else if (lead.assignedSalesperson !== filterRep) {
        return false;
      }
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkAssign = () => {
    if (selectedLeadIds.length === 0 || !bulkTargetRep) return;
    bulkAssignLeads(selectedLeadIds, bulkTargetRep);
    showToast(`Successfully assigned ${selectedLeadIds.length} leads to ${bulkTargetRep}!`);
    setSelectedLeadIds([]);
    setBulkTargetRep('');
  };

  const handleAutoDistribute = () => {
    autoDistributeRoundRobin();
    showToast('Auto-distributed unassigned leads evenly across active sales reps!');
  };

  const handleCreateRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName.trim()) return;

    const colors = ['bg-indigo-600', 'bg-cyan-600', 'bg-teal-600', 'bg-rose-600', 'bg-amber-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addSalesperson({
      name: newRepName.trim(),
      email: newRepEmail.trim() || `${newRepName.toLowerCase().replace(/\s+/g, '.')}@aivalytics.io`,
      phone: newRepPhone.trim() || '+91 98765 00000',
      role: 'Salesperson',
      title: newRepTitle.trim(),
      status: 'Active',
      dailyCallTarget: Number(newRepTarget) || 25,
      avatarColor: randomColor,
      joinedDate: new Date().toISOString().substring(0, 10),
      bio: 'Admissions & sales representative.'
    });

    setIsAddModalOpen(false);
    setNewRepName('');
    setNewRepEmail('');
    setNewRepPhone('');
    showToast(`Added ${newRepName} to the sales team!`);
  };

  const handleImpersonate = (rep: Salesperson) => {
    setCurrentUser(rep);
    showToast(`Now viewing as ${rep.name} (${rep.role})!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-900 text-white rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in">
          <span>✅</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">👥</span>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Sales Team Operations & Rep Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {salespeople.length} Sales Reps
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Each salesperson manages their own dedicated lead pool. Track daily outreach quotas, reassign leads with 1 click, or enable automated Round-Robin distribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Round-Robin Toggle */}
          <button
            onClick={() => {
              const next = !roundRobinEnabled;
              setRoundRobinEnabled(next);
              showToast(`Round-Robin auto-distribution is now ${next ? 'ENABLED' : 'DISABLED'}`);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
              roundRobinEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
            title="Automatically distribute incoming Meta leads evenly across active sales reps"
          >
            <span className={`w-2 h-2 rounded-full ${roundRobinEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span>Round-Robin: <strong>{roundRobinEnabled ? 'ON' : 'OFF'}</strong></span>
          </button>

          {/* Auto Distribute Button */}
          <button
            onClick={handleAutoDistribute}
            className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            title="Distribute all unassigned leads across the 5 reps"
          >
            <span>⚡</span> Auto-Balance Leads
          </button>

          {/* Add Salesperson Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>➕</span> Add Salesperson
          </button>
        </div>
      </div>

      {/* Top Team Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Leads In Pool</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{totalLeads}</span>
            <span className="text-xs text-emerald-600 font-bold">100% Synced</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Team Calls Today</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{teamTodayCalls}</span>
            <span className="text-xs text-gray-400 font-semibold">calls placed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Qualified Prospects</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-700 dark:text-purple-400">{teamTotalQualified}</span>
            <span className="text-xs text-gray-400 font-semibold">high-intent</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Active Sales Reps</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{activeReps.length}</span>
            <span className="text-xs text-gray-400 font-semibold">of {salespeople.length} reps</span>
          </div>
        </div>
      </div>

      {/* 5 Salespeople Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🎖️</span> Sales Representatives & Workspaces
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Click "Open Workspace" to view that rep's private leads & calling pipeline.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {salespeople.map((rep) => {
            const stats = getRepStats(rep.name);
            const callPct = Math.min(100, Math.round((stats.callsToday / (rep.dailyCallTarget || 25)) * 100));
            const isCurrent = currentUser?.email === rep.email;

            return (
              <div
                key={rep.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all p-5 shadow-2xs flex flex-col justify-between ${
                  isCurrent
                    ? 'border-emerald-500/80 dark:border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-gray-200/80 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  {/* Card Header: Avatar, Name, Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${rep.avatarColor || 'bg-emerald-600'} text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0`}>
                        {rep.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">{rep.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                              Active User
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{rep.title}</p>
                        <p className="text-[10px] text-gray-400">{rep.email}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rep.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  {/* Daily Target Progress Bar */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                      <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <span>📞</span> Daily Calls: <strong>{stats.callsToday}</strong>/{rep.dailyCallTarget || 25}
                      </span>
                      <span className={`${callPct >= 100 ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {callPct}% Target
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          callPct >= 100 ? 'bg-emerald-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${callPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Mini Stats Breakdown */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 text-center">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750">
                      <span className="text-[10px] text-gray-400 font-bold block">Assigned Leads</span>
                      <span className="text-sm font-black text-gray-900 dark:text-gray-100">{stats.totalLeads}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750">
                      <span className="text-[10px] text-gray-400 font-bold block">Qualified</span>
                      <span className="text-sm font-black text-purple-700 dark:text-purple-400">{stats.qualified}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-750">
                      <span className="text-[10px] text-gray-400 font-bold block">Converted</span>
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{stats.converted}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleImpersonate(rep)}
                    className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                    title={`Simulate logging in as ${rep.name}`}
                  >
                    <span>👤</span> View As Rep
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedRepForEdit(rep)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                      title="Edit quota and info"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => navigate(`/team/${rep.id}`)}
                      className="px-3 py-1.5 bg-[#133926] hover:bg-[#1a4a33] text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Workspace ➡️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leads Distribution & Reassignment Manager Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📋</span> Lead Distribution & Salesperson Reassignment
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select leads to bulk-reassign or change any lead's salesperson directly from the dropdown.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Salesperson */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-750 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
              <span className="text-gray-400 font-bold">Rep Filter:</span>
              <select
                value={filterRep}
                onChange={(e) => setFilterRep(e.target.value)}
                className="bg-transparent font-bold text-gray-800 dark:text-gray-200 focus:outline-hidden cursor-pointer"
              >
                <option value="All">All Leads ({leads.length})</option>
                {salespeople.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({leads.filter((l) => l.assignedSalesperson === s.name).length})
                  </option>
                ))}
                <option value="Unassigned">Unassigned Leads</option>
              </select>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-1.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 w-48"
            />
          </div>
        </div>

        {/* Bulk Reassignment Control Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 font-bold">
              <span>🎯</span>
              <span><strong>{selectedLeadIds.length}</strong> leads selected</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bulkTargetRep}
                onChange={(e) => setBulkTargetRep(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-emerald-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              >
                <option value="">-- Choose Salesperson --</option>
                {salespeople.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.title})</option>
                ))}
              </select>

              <button
                onClick={handleExecuteBulkAssign}
                disabled={!bulkTargetRep}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  bulkTargetRep
                    ? 'bg-[#133926] text-white shadow-xs cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Assign Selected
              </button>

              <button
                onClick={() => setSelectedLeadIds([])}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-700">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-700">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Candidate & Contact</th>
                <th className="p-3">Program</th>
                <th className="p-3">CRM Stage</th>
                <th className="p-3">Fit & Score</th>
                <th className="p-3">Assigned Salesperson</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No leads found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isChecked = selectedLeadIds.includes(lead.id);
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-gray-50/70 dark:hover:bg-gray-750/50 transition-colors ${
                        isChecked ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleLead(lead.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Candidate info */}
                      <td className="p-3">
                        <div
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="font-bold text-gray-900 dark:text-gray-100 hover:text-emerald-700 cursor-pointer"
                        >
                          {lead.fullName}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>📞 {lead.phone}</span>
                          <span>✉️ {lead.email}</span>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="p-3">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {lead.programName || 'AI Program'}
                        </span>
                      </td>

                      {/* Stage */}
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {lead.crmStage}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 font-black text-gray-900 dark:text-gray-100">
                          <span className={`w-2 h-2 rounded-full ${lead.fitScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <span>{lead.fitScore || 85}</span>
                          <span className="text-[10px] text-gray-400 font-semibold">/100</span>
                        </div>
                      </td>

                      {/* Salesperson Assignment Dropdown */}
                      <td className="p-3">
                        <div className="relative">
                          <select
                            value={lead.assignedSalesperson || 'Alex Rivera'}
                            onChange={(e) => {
                              assignLead(lead.id, e.target.value);
                              showToast(`Reassigned ${lead.fullName} to ${e.target.value}!`);
                            }}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer w-44"
                          >
                            {salespeople.map((s) => (
                              <option key={s.id} value={s.name}>
                                👤 {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Salesperson Profile */}
      {selectedRepForEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                Edit {selectedRepForEdit.name}'s Profile
              </h3>
              <button
                onClick={() => setSelectedRepForEdit(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={selectedRepForEdit.name}
                  onChange={(e) => setSelectedRepForEdit({ ...selectedRepForEdit, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={selectedRepForEdit.title}
                  onChange={(e) => setSelectedRepForEdit({ ...selectedRepForEdit, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Daily Call Quota</label>
                <input
                  type="number"
                  value={selectedRepForEdit.dailyCallTarget}
                  onChange={(e) => setSelectedRepForEdit({ ...selectedRepForEdit, dailyCallTarget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Status</label>
                <select
                  value={selectedRepForEdit.status}
                  onChange={(e) => setSelectedRepForEdit({ ...selectedRepForEdit, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Active">Active (Receives Round-Robin Leads)</option>
                  <option value="Inactive">Inactive (Paused)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setSelectedRepForEdit(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSalesperson(selectedRepForEdit.id, selectedRepForEdit);
                  showToast(`Updated ${selectedRepForEdit.name}'s profile!`);
                  setSelectedRepForEdit(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#133926] text-white rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Salesperson */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateRep} className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                Add New Salesperson
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Roy"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. rohan.roy@aivalytics.io"
                  value={newRepEmail}
                  onChange={(e) => setNewRepEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 11111"
                  value={newRepPhone}
                  onChange={(e) => setNewRepPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={newRepTitle}
                  onChange={(e) => setNewRepTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Daily Call Quota</label>
                <input
                  type="number"
                  value={newRepTarget}
                  onChange={(e) => setNewRepTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#133926] text-white rounded-lg shadow-sm cursor-pointer"
              >
                Add Salesperson
              </button>
            </div>
          </form>
        </div>
      )}

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
