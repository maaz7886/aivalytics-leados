// src/pages/SalespersonWorkspace.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Lead, ActivityOutcome } from '../types';
import LeadDetailModal from '../components/LeadDetailModal';

export default function SalespersonWorkspace() {
  const { repId } = useParams<{ repId: string }>();
  const navigate = useNavigate();
  const {
    salespeople,
    leads,
    allLeads,
    callActivities,
    currentUser,
    setCurrentUser,
    logCall,
    recordActivity,
    completeNextTask
  } = useApp();

  const rep = salespeople.find((s) => s.id === repId) || salespeople[0];

  const [activeTab, setActiveTab] = useState<'queue' | 'leads' | 'calls'>('queue');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);

  // Quick Log Modal State with Mandatory Next Task
  const [quickLogModalLead, setQuickLogModalLead] = useState<Lead | null>(null);
  const [quickLogOutcome, setQuickLogOutcome] = useState<string>('Connected');
  const [quickLogNotes, setQuickLogNotes] = useState('');
  const [nextTaskType, setNextTaskType] = useState<'Call' | 'WhatsApp' | 'Session' | 'Payment Follow-Up' | 'Review'>('Call');
  const [nextTaskDate, setNextTaskDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().substring(0, 10);
  });
  const [nextTaskTime, setNextTaskTime] = useState('11:00');
  const [nextTaskInstructions, setNextTaskInstructions] = useState('');
  const [quickLogErrorMessage, setQuickLogErrorMessage] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  const leadsPool = allLeads || leads;
  // Leads strictly assigned to this salesperson
  const repLeads = leadsPool.filter((l) => l.assignedSalesperson === rep.name);

  // Calls logged by this rep
  const repCallActivities = callActivities.filter((c) => c.salesperson === rep.name);
  const repTodayCalls = repCallActivities.filter((c) => c.timestamp.startsWith(todayStr));

  // --- 4 GROUPED ACTION QUEUES ---
  // 1. Overdue Follow-ups & Tasks (SLA Breach Risk)
  const overdueQueue = repLeads.filter((l) => {
    if (l.crmStage === 'Not Interested' || l.crmStage === 'Unqualified' || l.crmStage === 'Converted' || l.leadStage === 'Closed Lost') return false;
    const taskOverdue = l.nextTask && !l.nextTask.completionStatus?.toLowerCase().includes('complete') && l.nextTask.dueDateTime?.substring(0, 10) < todayStr;
    const followUpOverdue = l.nextFollowUp && l.nextFollowUp.substring(0, 10) < todayStr;
    return Boolean(taskOverdue || followUpOverdue);
  });

  // 2. Today's Scheduled Calls & Tasks
  const todayScheduledQueue = repLeads.filter((l) => {
    if (l.crmStage === 'Not Interested' || l.crmStage === 'Unqualified' || l.crmStage === 'Converted' || l.leadStage === 'Closed Lost') return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    const isTodayTask = l.nextTask && !l.nextTask.completionStatus?.toLowerCase().includes('complete') && l.nextTask.dueDateTime?.substring(0, 10) === todayStr;
    const isTodayFollowUp = l.nextFollowUp && l.nextFollowUp.substring(0, 10) === todayStr;
    return Boolean(isTodayTask || isTodayFollowUp);
  });

  // 3. Fresh Untouched Leads (Fast Response SLA Alert)
  const freshUntouchedQueue = repLeads.filter((l) => {
    if (l.crmStage === 'Not Interested' || l.crmStage === 'Unqualified' || l.crmStage === 'Converted' || l.leadStage === 'Closed Lost') return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    if (todayScheduledQueue.some((o) => o.id === l.id)) return false;
    const calls = l.numberOfCalls || 0;
    const isNew = l.crmStage === 'New Lead' || l.leadStage === 'New' || l.lastContacted === 'Not Contacted';
    return calls === 0 || isNew;
  });

  // 4. Active Pipeline / High-Intent Nurture
  const activePipelineQueue = repLeads.filter((l) => {
    if (l.crmStage === 'Not Interested' || l.crmStage === 'Unqualified' || l.crmStage === 'Converted' || l.leadStage === 'Closed Lost') return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    if (todayScheduledQueue.some((o) => o.id === l.id)) return false;
    if (freshUntouchedQueue.some((o) => o.id === l.id)) return false;
    return (
      l.leadTemperature === 'Hot' ||
      l.crmStage === 'Interested' ||
      l.crmStage === 'Qualified' ||
      l.crmStage === 'Payment Pending' ||
      l.crmStage === 'Details Sent on WhatsApp' ||
      (l.paymentState && l.paymentState !== 'No payment request')
    );
  });

  const totalPriorityQueueItems =
    overdueQueue.length + todayScheduledQueue.length + freshUntouchedQueue.length + activePipelineQueue.length;

  // Filtered assigned leads for Tab 1
  const filteredAssignedLeads = repLeads.filter((lead) => {
    if (stageFilter !== 'All' && lead.crmStage !== stageFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (lead.fullName || '').toLowerCase().includes(q);
      const matchPhone = (lead.phone || '').includes(q);
      const matchEmail = (lead.email || '').toLowerCase().includes(q);
      const matchCompany = (lead.currentCompany || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchCompany) return false;
    }
    return true;
  });

  // Performance calculations
  const totalAssigned = repLeads.length;
  const contactedCount = repLeads.filter((l) => (l.numberOfCalls || 0) > 0 || l.crmStage !== 'New Lead').length;
  const qualifiedCount = repLeads.filter(
    (l) => l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp'
  ).length;
  const convertedCount = repLeads.filter(
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid' || l.paymentState === 'Paid in full'
  ).length;

  const isTerminalOutcome = (outcome: string) => {
    return outcome === 'Not Interested' || outcome === 'Unqualified' || outcome === 'Closed Lost';
  };

  const handleOpenQuickLog = (lead: Lead) => {
    setQuickLogModalLead(lead);
    setQuickLogOutcome('Connected');
    setQuickLogNotes('');
    setQuickLogErrorMessage(null);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setNextTaskDate(d.toISOString().substring(0, 10));
    setNextTaskTime('11:00');
    setNextTaskInstructions('');
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogModalLead) return;

    const terminal = isTerminalOutcome(quickLogOutcome);

    // Enforce mandatory next task for all active/non-terminal outreach
    if (!terminal && !nextTaskDate) {
      setQuickLogErrorMessage('Mandatory: Please select a scheduled Next Action date.');
      return;
    }

    const dueDateTime = terminal ? '' : `${nextTaskDate} ${nextTaskTime || '11:00'}`;

    recordActivity(
      quickLogModalLead.id,
      'Call',
      quickLogOutcome as ActivityOutcome,
      quickLogNotes || `Outreach logged by ${rep.name}`,
      !terminal
        ? {
            taskType: nextTaskType,
            dueDateTime,
            notes: nextTaskInstructions || `${nextTaskType} scheduled by ${rep.name}`
          }
        : undefined
    );

    // Also update legacy call activity for backwards compatibility
    logCall(quickLogModalLead.id, quickLogOutcome, quickLogNotes || 'Call logged');

    showToast(`✅ Activity & Next Task logged for ${quickLogModalLead.fullName}!`);
    setQuickLogModalLead(null);
  };

  const handleImpersonateThisRep = () => {
    setCurrentUser(rep);
    showToast(`Session switched to ${rep.name}!`);
  };

  // Helper for rendering a single lead card inside the priority queues
  const renderQueueItem = (lead: Lead, badgeColor: string, urgencyLabel: string) => {
    const cleanPhone = (lead.phone || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hi%20${encodeURIComponent(
      lead.fullName.split(' ')[0]
    )},%20this%20is%20${encodeURIComponent(rep.name)}%20from%20Aivalytics.`;

    return (
      <div
        key={lead.id}
        className="p-4 rounded-xl border border-gray-200/90 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                onClick={() => setSelectedLeadForDetail(lead)}
                className="font-black text-sm text-gray-900 dark:text-gray-100 hover:text-emerald-700 cursor-pointer truncate"
              >
                {lead.fullName}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                {urgencyLabel}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
              {lead.programName || 'AI Cohort'} • {lead.currentRole || 'Candidate'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {lead.crmStage}
            </span>
          </div>
        </div>

        {/* Task & Context Snippet */}
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-750 text-xs text-gray-700 dark:text-gray-300 space-y-1">
          {lead.nextTask ? (
            <div className="flex items-center justify-between font-medium">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                📌 Next: {lead.nextTask.taskType} ({lead.nextTask.dueDateTime})
              </span>
              <button
                type="button"
                onClick={() => {
                  completeNextTask(lead.id, lead.nextTask!.id);
                  showToast('Task marked complete!');
                }}
                className="text-[10px] font-bold text-gray-500 hover:text-emerald-600 underline cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : lead.nextFollowUp ? (
            <div className="text-amber-700 dark:text-amber-400 font-bold">
              ⏰ Follow-up: {lead.nextFollowUp}
            </div>
          ) : (
            <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <span>⚠️</span> Needs Next Scheduled Action
            </div>
          )}

          {lead.objection && (
            <div className="text-[11px] text-gray-500 truncate">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Objection:</span> {lead.objection}
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              onClick={() => {
                logCall(lead.id, 'Connected', 'Direct queue call');
                showToast(`Call initiated to ${lead.fullName}!`);
              }}
              className="text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-emerald-600 flex items-center gap-1"
            >
              <span>📞</span> {lead.phone}
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 rounded-lg hover:bg-emerald-100"
            >
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => handleOpenQuickLog(lead)}
              className="px-3 py-1 text-[11px] font-bold bg-[#133926] text-white rounded-lg hover:bg-[#1a4a33] shadow-2xs cursor-pointer"
            >
              + Log Call
            </button>
            <button
              type="button"
              onClick={() => setSelectedLeadForDetail(lead)}
              className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    );
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

      {/* Top Breadcrumb & Rep Workspace Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/team')}
              className="mt-1 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 flex items-center justify-center text-sm font-black transition-all cursor-pointer"
              title="Back to Sales Team Hub"
            >
              ←
            </button>

            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl ${
                  rep.avatarColor || 'bg-emerald-600'
                } text-white font-black text-2xl flex items-center justify-center shadow-md`}
              >
                {rep.name.split(' ').map((n) => n[0]).join('')}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                    {rep.name}
                  </h1>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                    {rep.title}
                  </span>
                  {currentUser?.id === rep.id && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                      Logged in as this Rep
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-3 flex-wrap">
                  <span>✉️ {rep.email}</span>
                  <span>•</span>
                  <span>📱 {rep.phone}</span>
                  <span>•</span>
                  <span>📅 Joined: {rep.joinedDate}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleImpersonateThisRep}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-600 transition-all flex items-center gap-2 cursor-pointer"
              title="Set active role-based session to this rep"
            >
              <span>👤</span> View LeadOS As {rep.name.split(' ')[0]}
            </button>

            <button
              onClick={() => navigate('/pipeline')}
              className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>⚡</span> Open Kanban Pipeline
            </button>
          </div>
        </div>

        {/* Rep Quota & Outreach Tracker Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assigned Leads</span>
            <span className="text-xl font-black text-gray-900 dark:text-gray-100">{totalAssigned}</span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Today's Calls</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                {repTodayCalls.length}
              </span>
              <span className="text-xs text-gray-400 font-bold">/{rep.dailyCallTarget || 25} goal</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contacted Leads</span>
            <span className="text-xl font-black text-blue-700 dark:text-blue-400">{contactedCount}</span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Qualified Prospects</span>
            <span className="text-xl font-black text-purple-700 dark:text-purple-400">{qualifiedCount}</span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Enrolled / Paid</span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{convertedCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-[#133926] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>⏰</span> Priority Action Queue ({totalPriorityQueueItems})
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'bg-[#133926] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>📋</span> All Assigned Leads ({repLeads.length})
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'calls'
              ? 'bg-[#133926] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>📞</span> Call Activities Log ({repCallActivities.length})
        </button>
      </div>

      {/* TAB 1: GROUPED PRIORITIZED ACTION QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Queue Header & SLA Guidance */}
          <div className="bg-gradient-to-r from-emerald-950 to-gray-900 text-white rounded-2xl p-5 border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h2 className="text-base font-black tracking-tight">
                  Prioritized Daily Calling & Outreach Queue
                </h2>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 max-w-2xl">
                Every outreach must culminate in a scheduled Next Action. Work top-down: clear overdue tasks first, execute today's calls, respond to fresh leads within 15 minutes, and advance active opportunities.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 bg-emerald-800/80 text-white text-xs font-black rounded-xl border border-emerald-600">
                {totalPriorityQueueItems} Tasks Queued
              </span>
            </div>
          </div>

          {/* Group 1: Overdue Follow-ups & Tasks */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/60 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <h3 className="text-sm font-black text-red-900 dark:text-red-300">
                  🚨 1. Overdue Follow-ups & Tasks ({overdueQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 dark:bg-red-950 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                Immediate SLA Breach Risk
              </span>
            </div>

            {overdueQueue.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 italic">
                🎉 No overdue follow-ups! Outstanding punctuality.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {overdueQueue.map((lead) =>
                  renderQueueItem(
                    lead,
                    'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300',
                    'Overdue Task'
                  )
                )}
              </div>
            )}
          </div>

          {/* Group 2: Today's Scheduled Calls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-amber-900/60 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <h3 className="text-sm font-black text-amber-900 dark:text-amber-300">
                  2. Today's Scheduled Calls & Tasks ({todayScheduledQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Due Today ({todayStr})
              </span>
            </div>

            {todayScheduledQueue.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 italic">
                No scheduled follow-ups remaining for today.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {todayScheduledQueue.map((lead) =>
                  renderQueueItem(
                    lead,
                    'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
                    'Scheduled Today'
                  )
                )}
              </div>
            )}
          </div>

          {/* Group 3: Fresh Untouched Leads (Fast Response SLA) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-blue-900/60 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <h3 className="text-sm font-black text-blue-900 dark:text-blue-300">
                  3. Fresh Untouched Leads ({freshUntouchedQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Speed-to-Lead SLA (&lt;15m)
              </span>
            </div>

            {freshUntouchedQueue.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 italic">
                All assigned incoming leads have been touched at least once.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {freshUntouchedQueue.map((lead) =>
                  renderQueueItem(
                    lead,
                    'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
                    'Fresh Ingestion'
                  )
                )}
              </div>
            )}
          </div>

          {/* Group 4: Active Pipeline & High Intent Nurture */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🌱</span>
                <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-300">
                  4. Active Pipeline / High-Intent Nurture ({activePipelineQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Hot Candidates & Deal Closing
              </span>
            </div>

            {activePipelineQueue.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 italic">
                No extra active pipeline opportunities in queue.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activePipelineQueue.map((lead) =>
                  renderQueueItem(
                    lead,
                    'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
                    'High Intent'
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ALL ASSIGNED LEADS */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Stage filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'All',
                'New Lead',
                'Interested',
                'Details Sent on WhatsApp',
                'Qualified',
                'Follow-Up 1',
                'Payment Pending'
              ].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stage)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    stageFilter === stage
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {stage === 'Details Sent on WhatsApp' ? 'Details Sent' : stage}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder={`Search ${rep.name.split(' ')[0]}'s leads...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs w-64 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-700">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Phone & Direct Outreach</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Lifecycle / CRM Stage</th>
                  <th className="p-3">Next Action</th>
                  <th className="p-3">Payment State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredAssignedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No leads found in {rep.name}'s assigned pool matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAssignedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-750/50 transition-colors"
                    >
                      <td className="p-3">
                        <div
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="font-bold text-gray-900 dark:text-gray-100 hover:text-emerald-700 cursor-pointer"
                        >
                          {lead.fullName}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {lead.currentRole || lead.professionalStatus || 'Candidate'}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={() => {
                              logCall(lead.id, 'Connected', 'Direct phone call placed');
                              showToast(`Call placed to ${lead.fullName}!`);
                            }}
                            className="font-bold text-gray-800 dark:text-gray-200 hover:text-emerald-600 flex items-center gap-1"
                          >
                            <span>📞</span> {lead.phone}
                          </a>
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
                                lead.fullName.split(' ')[0]
                              )},%20this%20is%20${encodeURIComponent(rep.name)}%20from%20Aivalytics.`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 px-1.5 py-0.5 rounded font-bold"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {lead.programName || 'AI Program'}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {lead.crmStage}
                        </span>
                      </td>

                      <td className="p-3">
                        {lead.nextTask ? (
                          <div className="text-[11px]">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {lead.nextTask.taskType}
                            </span>
                            <div className="text-gray-400">{lead.nextTask.dueDateTime}</div>
                          </div>
                        ) : lead.nextFollowUp ? (
                          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                            {lead.nextFollowUp}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-medium">⚠️ No Next Task</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            lead.paymentState === 'Paid in full' || lead.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : lead.paymentState === 'Payment link sent' || lead.paymentState === 'Deposit pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {lead.paymentState || lead.paymentStatus || 'No payment request'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenQuickLog(lead)}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            + Log Call
                          </button>
                          <button
                            onClick={() => setSelectedLeadForDetail(lead)}
                            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CALL ACTIVITIES LOG */}
      {activeTab === 'calls' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📞</span> Call Log & Touchpoints Placed by {rep.name}
            </h2>
            <span className="text-xs font-bold text-gray-500">
              Total {repCallActivities.length} Calls Logged
            </span>
          </div>

          <div className="space-y-3">
            {repCallActivities.length === 0 ? (
              <p className="p-8 text-center text-gray-400">
                No calls logged yet by {rep.name}. Place a call or log an outcome above.
              </p>
            ) : (
              repCallActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-sm shrink-0">
                      📞
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100">
                        {act.leadName} ({act.leadPhone})
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{act.notes}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                      {act.outcome}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(act.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Log Call & Mandatory Next Task Modal */}
      {quickLogModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickLogSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                  Log Call & Schedule Next Action
                </h3>
                <p className="text-xs text-gray-500">
                  Candidate: <span className="font-bold text-gray-900 dark:text-gray-200">{quickLogModalLead.fullName}</span> ({quickLogModalLead.phone})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickLogModalLead(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {quickLogErrorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-300 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold">
                ⚠️ {quickLogErrorMessage}
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* 1. Call Outcome */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  1. Call Outcome
                </label>
                <select
                  value={quickLogOutcome}
                  onChange={(e) => setQuickLogOutcome(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Connected">Connected & Discussed</option>
                  <option value="Interested">Interested in Cohort</option>
                  <option value="Details Sent on WhatsApp">Details Sent on WhatsApp</option>
                  <option value="Qualified">Qualified Prospect</option>
                  <option value="Call Later">Call Later / Callback Requested</option>
                  <option value="Did Not Pick The Call">Did Not Pick The Call (No Answer)</option>
                  <option value="Not Interested">Not Interested (Terminal)</option>
                  <option value="Unqualified">Unqualified (Terminal)</option>
                </select>
              </div>

              {/* 2. Call Notes */}
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  2. Discussion Summary & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Discussed curriculum, pricing objections, or candidate background..."
                  value={quickLogNotes}
                  onChange={(e) => setQuickLogNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                ></textarea>
              </div>

              {/* 3. Mandatory Next Task Section */}
              {!isTerminalOutcome(quickLogOutcome) ? (
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <span>📌</span> 3. Mandatory Next Task
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white dark:bg-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                      Required for Active Pipeline
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-gray-600 dark:text-gray-300 text-[11px] block mb-0.5">
                        Task Type
                      </label>
                      <select
                        value={nextTaskType}
                        onChange={(e) => setNextTaskType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold"
                      >
                        <option value="Call">Phone Call</option>
                        <option value="WhatsApp">WhatsApp Follow-up</option>
                        <option value="Session">Demo / Briefing Session</option>
                        <option value="Payment Follow-Up">Payment Follow-Up</option>
                        <option value="Review">Application Review</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-600 dark:text-gray-300 text-[11px] block mb-0.5">
                        Due Date & Time
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={nextTaskDate}
                          onChange={(e) => setNextTaskDate(e.target.value)}
                          className="w-2/3 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium"
                          required
                        />
                        <input
                          type="time"
                          value={nextTaskTime}
                          onChange={(e) => setNextTaskTime(e.target.value)}
                          className="w-1/3 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-600 dark:text-gray-300 text-[11px] block mb-0.5">
                      Next Action Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Confirm attendance for Saturday session, send curriculum PDF"
                      value={nextTaskInstructions}
                      onChange={(e) => setNextTaskInstructions(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold">
                  ℹ️ Marked terminal ({quickLogOutcome}). Lead is moved to Closed/Unqualified with no mandatory follow-up task.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setQuickLogModalLead(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg shadow-sm cursor-pointer"
              >
                Save Outreach & Task
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
