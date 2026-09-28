// src/pages/SalespersonWorkspace.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Lead } from '../types';
import LeadDetailModal from '../components/LeadDetailModal';

export default function SalespersonWorkspace() {
  const { repId } = useParams<{ repId: string }>();
  const navigate = useNavigate();
  const {
    salespeople,
    leads,
    callActivities,
    currentUser,
    setCurrentUser,
    logCall
  } = useApp();


  const rep = salespeople.find((s) => s.id === repId) || salespeople[0];

  const [activeTab, setActiveTab] = useState<'leads' | 'queue' | 'calls' | 'analytics'>('leads');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [quickLogModalLead, setQuickLogModalLead] = useState<Lead | null>(null);
  const [quickLogOutcome, setQuickLogOutcome] = useState('Connected');
  const [quickLogNotes, setQuickLogNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const todayStr = new Date().toISOString().substring(0, 10);

  // Leads strictly assigned to this salesperson
  const repLeads = leads.filter((l) => l.assignedSalesperson === rep.name);

  // Calls logged by this rep
  const repCallActivities = callActivities.filter((c) => c.salesperson === rep.name);
  const repTodayCalls = repCallActivities.filter((c) => c.timestamp.startsWith(todayStr));

  // Today's priority calling queue (Leads with 0 calls or nextFollowUp today or hot temperature)
  const priorityQueue = repLeads.filter((l) => {
    const isNew = (l.numberOfCalls || 0) === 0 || l.crmStage === 'New Lead';
    const isFollowUpDue = l.nextFollowUp && l.nextFollowUp.startsWith(todayStr);
    const isHot = l.leadTemperature === 'Hot';
    return isNew || isFollowUpDue || isHot;
  });

  // Filtered assigned leads
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
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid'
  ).length;

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogModalLead) return;

    logCall(quickLogModalLead.id, quickLogOutcome, quickLogNotes);
    showToast(`Logged call with ${quickLogModalLead.fullName} as "${quickLogOutcome}"!`);
    setQuickLogModalLead(null);
    setQuickLogNotes('');
  };

  const handleImpersonateThisRep = () => {
    setCurrentUser(rep);
    showToast(`Session switched to ${rep.name}!`);
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
              <div className={`w-16 h-16 rounded-2xl ${rep.avatarColor || 'bg-emerald-600'} text-white font-black text-2xl flex items-center justify-center shadow-md`}>
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
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{repTodayCalls.length}</span>
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
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'bg-[#133926] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>📋</span> My Assigned Leads ({repLeads.length})
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-[#133926] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <span>⏰</span> Priority Calling Queue ({priorityQueue.length})
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

      {/* TAB 1: MY ASSIGNED LEADS */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Stage filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'New Lead', 'Interested', 'Details Sent on WhatsApp', 'Qualified', 'Follow-Up 1', 'Payment Pending'].map((stage) => (
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
                  <th className="p-3">CRM Stage</th>
                  <th className="p-3">Fit Score</th>
                  <th className="p-3">Calls Made</th>
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
                              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(lead.fullName.split(' ')[0])},%20this%20is%20${encodeURIComponent(rep.name)}%20from%20Aivalytics.`}
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
                        <div className="flex items-center gap-1 font-black text-gray-900 dark:text-gray-100">
                          <span className={`w-2 h-2 rounded-full ${lead.fitScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <span>{lead.fitScore || 85}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {lead.numberOfCalls || 0} calls
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setQuickLogModalLead(lead)}
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

      {/* TAB 2: PRIORITY CALLING QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>⏰</span> Today's Action Queue for {rep.name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Prioritized leads requiring attention today: uncontacted leads, scheduled follow-ups, and hot prospects.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 rounded-full">
              {priorityQueue.length} Priority Items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityQueue.length === 0 ? (
              <div className="col-span-2 p-10 text-center text-gray-400">
                🎉 No pending priority leads for today! Great job clearing the queue.
              </div>
            ) : (
              priorityQueue.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4
                        onClick={() => setSelectedLeadForDetail(lead)}
                        className="font-black text-sm text-gray-900 dark:text-gray-100 hover:text-emerald-600 cursor-pointer"
                      >
                        {lead.fullName}
                      </h4>
                      <p className="text-xs text-gray-500">{lead.programName}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        🎯 Goal: {lead.goal || lead.primaryGoal || 'Career Advancement'}
                      </p>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {lead.leadTemperature || 'Hot'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      📞 {lead.phone}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${lead.phone}`}
                        onClick={() => logCall(lead.id, 'Connected', 'Direct queue call')}
                        className="px-3 py-1 bg-[#133926] text-white text-xs font-bold rounded-lg shadow-2xs"
                      >
                        Call Now
                      </a>
                      <button
                        onClick={() => setQuickLogModalLead(lead)}
                        className="px-2.5 py-1 bg-white dark:bg-gray-700 border text-xs font-bold rounded-lg"
                      >
                        + Log
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Log Call Modal */}
      {quickLogModalLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleQuickLogSubmit} className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                Log Call with {quickLogModalLead.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setQuickLogModalLead(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Call Outcome</label>
                <select
                  value={quickLogOutcome}
                  onChange={(e) => setQuickLogOutcome(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-bold"
                >
                  <option value="Connected">Connected & Discussed</option>
                  <option value="Interested">Interested in Cohort</option>
                  <option value="Details Sent on WhatsApp">Details Sent on WhatsApp</option>
                  <option value="Qualified">Qualified Candidate</option>
                  <option value="Call Later">Call Later / Callback Scheduled</option>
                  <option value="Did Not Pick The Call">Did Not Pick The Call</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Unqualified">Unqualified</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Call Notes / Discussion Summary</label>
                <textarea
                  rows={3}
                  placeholder="Discussed curriculum, pricing objection, or follow-up timing..."
                  value={quickLogNotes}
                  onChange={(e) => setQuickLogNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setQuickLogModalLead(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-[#133926] text-white rounded-lg shadow-sm cursor-pointer"
              >
                Save & Log Activity
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
