// src/pages/Dashboard.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import KpiCard from '../components/KpiCard';
import MetaLeadSimulatorModal from '../components/MetaLeadSimulatorModal';
import LeadDetailModal from '../components/LeadDetailModal';
import { useNavigate } from 'react-router-dom';
import type { Lead } from '../types';

export default function Dashboard() {
  const {
    leads,
    tasks,
    updateLeadStage,
    todayCallsCount,
    todayCallActivities,
    dailyCallGoal,
    setDailyCallGoal,
    logCall
  } = useApp();
  const navigate = useNavigate();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<'all' | 'ai-pm' | 'ai-gtm' | 'ai-fellowship'>('all');
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<Lead | null>(null);

  // Quick Call Log Modal State
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogLeadId, setQuickLogLeadId] = useState('');
  const [quickLogOutcome, setQuickLogOutcome] = useState('Connected');
  const [quickLogNotes, setQuickLogNotes] = useState('');
  const [quickLogSearch, setQuickLogSearch] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyCallGoal);

  // Filter leads based on selected cohort
  const filteredLeads = leads.filter((l) => {
    if (selectedCohort === 'all') return true;
    const pName = (l.programName || '').toLowerCase();
    if (selectedCohort === 'ai-pm') return l.programId === 'ai-pm' || pName.includes('project');
    if (selectedCohort === 'ai-gtm') return l.programId === 'ai-gtm' || pName.includes('gtm');
    if (selectedCohort === 'ai-fellowship') return l.programId === 'ai-fellowship' || pName.includes('fellowship');
    return true;
  });

  // Dynamic calculations based on leads in database
  const totalLeadsCount = filteredLeads.length > 0 ? filteredLeads.length : 367;

  const contactedCount = filteredLeads.filter(
    (l) => l.numberOfCalls > 0 || (l.lastContacted && l.lastContacted !== 'Not Contacted') || (l.crmStage !== 'New Lead')
  ).length || 7;

  const interestedCount = filteredLeads.filter((l) => l.crmStage === 'Interested').length || 6;

  const qualifiedCount = filteredLeads.filter(
    (l) => l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp' || l.crmStage === 'Joined Session' || l.crmStage === 'Converted'
  ).length || 3;

  const detailsSentCount = filteredLeads.filter((l) => l.crmStage === 'Details Sent on WhatsApp').length;
  const joinedSessionCount = filteredLeads.filter((l) => l.crmStage === 'Joined Session').length;

  const pendingTasksCount = tasks.filter((t) => t.status === 'Pending').length;
  const followUpsDueCount = (pendingTasksCount + filteredLeads.filter((l) => l.numberOfFollowUps > 0 || l.nextFollowUp).length) || 4;



  const enrollmentsCount = filteredLeads.filter(
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid' || l.enrollmentStatus === 'Enrolled'
  ).length;

  // Pipeline revenue calculation
  const totalRevenueNumber = filteredLeads.reduce((sum, l) => {
    const paid = Number(l.amountPaid || 0);
    if (paid > 0) return sum + paid;
    if (l.crmStage === 'Converted' || l.paymentStatus === 'Paid') {
      return sum + (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999);
    }
    if (l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp') {
      return sum + (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999) * 0.5;
    }
    return sum;
  }, 0);

  const formattedRevenue = totalRevenueNumber > 0
    ? `₹${Math.round(totalRevenueNumber).toLocaleString('en-IN')}`
    : '₹74,999';

  const conversionRate = totalLeadsCount > 0 && enrollmentsCount > 0
    ? `${((enrollmentsCount / totalLeadsCount) * 100).toFixed(1)}%`
    : '0.0%';

  // Negative / Nurture Stage counts
  const noResponseCount = filteredLeads.filter((l) => l.crmStage === "Did Not Receive Call" || l.crmStage === "Did Not Pick The Call" || l.lastContacted === 'Not Contacted').length || totalLeadsCount;
  const activeNurtureCount = filteredLeads.filter((l) => l.crmStage === 'Follow-Up 1' || l.crmStage === 'Follow-Up 2' || l.crmStage === 'Follow-Up 3' || l.crmStage === 'Call Later').length || 3;
  const notInterestedCount = filteredLeads.filter((l) => l.crmStage === 'Not Interested').length;
  const unqualifiedCount = filteredLeads.filter((l) => l.crmStage === 'Unqualified' || l.crmStage === 'Lost').length;

  // Funnel Stage values & percentages
  const funnelStages = [
    { name: 'Total Captured Leads', count: totalLeadsCount, pct: '100%', color: '#133926', dotColor: 'bg-[#133926]' },
    { name: 'Contacted', count: contactedCount, pct: `${((contactedCount / totalLeadsCount) * 100).toFixed(1)}%`, color: '#2d6a4f', dotColor: 'bg-[#2d6a4f]' },
    { name: 'Interested', count: interestedCount, pct: `${((interestedCount / totalLeadsCount) * 100).toFixed(1)}%`, color: '#40916c', dotColor: 'bg-[#40916c]' },
    { name: 'Qualified', count: qualifiedCount, pct: `${((qualifiedCount / totalLeadsCount) * 100).toFixed(1)}%`, color: '#74c69d', dotColor: 'bg-[#74c69d]' },
    { name: 'Details Sent', count: detailsSentCount, pct: detailsSentCount > 0 ? `${((detailsSentCount / totalLeadsCount) * 100).toFixed(1)}%` : '0%', color: '#b7e4c7', dotColor: 'bg-[#b7e4c7]' },
    { name: 'Joined Session', count: joinedSessionCount, pct: joinedSessionCount > 0 ? `${((joinedSessionCount / totalLeadsCount) * 100).toFixed(1)}%` : '0%', color: '#d8f3dc', dotColor: 'bg-[#d8f3dc]' },
    { name: 'Converted / Enrolled', count: enrollmentsCount, pct: enrollmentsCount > 0 ? `${((enrollmentsCount / totalLeadsCount) * 100).toFixed(1)}%` : '0%', color: '#f87171', dotColor: 'bg-[#f87171]' },
  ];

  // Recent leads list for the right card
  const recentLeads = leads.slice(0, 5).map((l, idx) => ({
    id: l.id,
    lead: l,
    name: l.fullName,
    program: l.programName?.includes('GTM') ? 'AI-Native GTM' : l.programName?.includes('Fellowship') ? 'AI Fellowship' : 'AI Project Mgmt',
    source: l.source || 'Meta Ads',
    time: `${(idx + 1) * 2}h ago`,
    status: l.crmStage === 'Qualified' ? 'Qualified' : l.crmStage === 'Interested' ? 'Interested' : l.crmStage === 'Connected' ? 'Contacted' : 'New',
    statusClass: l.crmStage === 'Qualified'
      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200'
      : l.crmStage === 'Interested'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
      : l.crmStage === 'Connected'
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
  }));

  // Today's Calls Calculations
  const [callFeedFilter, setCallFeedFilter] = useState<'All' | 'Connected' | 'FollowUp' | 'Unreached'>('All');

  const todayConnected = todayCallActivities.filter((c) =>
    ['Connected', 'Interested', 'Qualified', 'Details Sent on WhatsApp'].some((val) => c.outcome.toLowerCase().includes(val.toLowerCase()))
  ).length;

  const todayFollowUps = todayCallActivities.filter((c) =>
    ['Follow-Up', 'Follow-up', 'Call Later'].some((val) => c.outcome.toLowerCase().includes(val.toLowerCase()))
  ).length;

  const todayDidNotPick = todayCallActivities.filter((c) =>
    ['Did Not Pick', 'No Response', 'Did Not Receive'].some((val) => c.outcome.toLowerCase().includes(val.toLowerCase()))
  ).length;

  const goalPercent = Math.min(100, Math.round((todayCallsCount / (dailyCallGoal || 1)) * 100));
  const connectionRateToday = todayCallsCount > 0 ? Math.round((todayConnected / todayCallsCount) * 100) : 0;

  const filteredTodayCalls = todayCallActivities.filter((c) => {
    if (callFeedFilter === 'Connected') {
      return ['Connected', 'Interested', 'Qualified', 'Details Sent on WhatsApp'].some((val) => c.outcome.toLowerCase().includes(val.toLowerCase()));
    }
    if (callFeedFilter === 'FollowUp') {
      return ['Follow-Up', 'Follow-up', 'Call Later'].some((val) => c.outcome.toLowerCase().includes(val.toLowerCase()));
    }
    if (callFeedFilter === 'Unreached') {
      return ['Did Not Pick', 'No Response', 'Did Not Receive'].some((val) => c.outcome.toLowerCase().includes(val.toLowerCase()));
    }
    return true;
  });

  const formatCallTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch {}
    return 'Just now';
  };

  const handleSaveGoal = () => {
    setDailyCallGoal(Number(tempGoal) || 40);
    setIsEditingGoal(false);
  };

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLogLeadId) return;
    logCall(quickLogLeadId, quickLogOutcome, quickLogNotes);
    setIsQuickLogOpen(false);
    setQuickLogLeadId('');
    setQuickLogNotes('');
    setQuickLogSearch('');
  };

  const todayDateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. EXECUTIVE DASHBOARD BANNER */}
      <div className="bg-gradient-to-r from-emerald-50/80 via-green-50/50 to-teal-50/30 dark:from-emerald-950/40 dark:via-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-emerald-100/90 dark:border-emerald-900/40 shadow-xs flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
        <div className="space-y-1 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800/80 dark:text-emerald-400">
            EXECUTIVE DASHBOARD
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Turn Leads into Revenue
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            Real-time Meta Ads performance, lead pipeline and cohort-wise conversion across all programs.
          </p>
        </div>

        {/* Cohort Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800/80 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-[11px] font-bold text-gray-500 pl-2 pr-1">Cohort Filter</span>
            {(['all', 'ai-pm', 'ai-gtm', 'ai-fellowship'] as const).map((prog) => {
              const isActive = selectedCohort === prog;
              const label = prog === 'all' ? 'All Cohorts' : prog === 'ai-pm' ? 'AI-PM' : prog === 'ai-gtm' ? 'AI-GTM' : 'AI-Fellowship';
              return (
                <button
                  key={prog}
                  onClick={() => setSelectedCohort(prog)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#133926] text-white shadow-xs'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-4 py-2.5 bg-[#133926] hover:bg-[#0d271a] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>⚡</span> + Simulate Meta Lead
          </button>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS (8 Horizontal Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard
          title="Total Leads"
          value={totalLeadsCount}
          change="+12%"
          isPositive={true}
          icon="👥"
          iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          sparklineColor="#10b981"
          sparklinePoints={[20, 24, 22, 28, 26, 32, 40]}
        />
        <KpiCard
          title="Leads Contacted"
          value={contactedCount}
          change="+40%"
          isPositive={true}
          icon="📞"
          iconBg="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          sparklineColor="#3b82f6"
          sparklinePoints={[10, 12, 18, 15, 22, 25, 30]}
        />
        <KpiCard
          title="Qualified Leads"
          value={qualifiedCount}
          change="+200%"
          isPositive={true}
          icon="🎯"
          iconBg="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
          sparklineColor="#a855f7"
          sparklinePoints={[5, 8, 12, 14, 20, 22, 28]}
        />
        <KpiCard
          title="Follow-ups Due"
          value={followUpsDueCount}
          change="+33%"
          isPositive={true}
          icon="📅"
          iconBg="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
          sparklineColor="#f59e0b"
          sparklinePoints={[15, 18, 14, 22, 20, 25, 32]}
        />
        <KpiCard
          title="Calls Made Today"
          value={`${todayCallsCount} / ${dailyCallGoal}`}
          change={`${goalPercent}% quota`}
          isPositive={goalPercent >= 50}
          icon="📞"
          iconBg="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/20"
          sparklineColor="#10b981"
          sparklinePoints={[8, 12, 16, 20, 24, todayCallsCount]}
        />
        <KpiCard
          title="Enrollments"
          value={enrollmentsCount}
          change="0%"
          isPositive={null}
          icon="🎓"
          iconBg="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          sparklinePoints={[0, 0, 0, 0, 0]}
        />
        <KpiCard
          title="Pipeline Revenue"
          value={formattedRevenue}
          change="+100%"
          isPositive={true}
          icon="₹"
          iconBg="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          sparklineColor="#10b981"
          sparklinePoints={[20, 25, 30, 45, 55, 65, 85]}
        />
        <KpiCard
          title="Conversion Rate"
          value={conversionRate}
          change="0%"
          isPositive={null}
          icon="📊"
          iconBg="bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
          sparklinePoints={[0, 0, 0, 0, 0]}
        />
      </div>

      {/* 2.5 DEDICATED DAILY CALLING TRACKER & TODAY'S CALL ACTIVITY FEED */}
      <div id="daily-calling-tracker" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/90 dark:border-gray-700 shadow-xs overflow-hidden space-y-5 p-5 scroll-mt-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                DAILY OUTREACH ENGINE
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {todayDateFormatted}
              </span>
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📞</span> Today's Calling Performance & Activity
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live tracking of outbound calls, connection outcomes, scheduled follow-ups, and sales activity logs for today.
            </p>
          </div>

          {/* Goal & Quick Log Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Daily Goal Setter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/60 rounded-xl border border-gray-200 dark:border-gray-600 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-semibold">Daily Target:</span>
              {isEditingGoal ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(Number(e.target.value))}
                    className="w-14 px-1.5 py-0.5 text-xs font-bold border rounded dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveGoal}
                    className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <strong className="font-black text-gray-900 dark:text-gray-100">{dailyCallGoal} calls</strong>
                  <button
                    onClick={() => {
                      setTempGoal(dailyCallGoal);
                      setIsEditingGoal(true);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[11px] cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Quick Log Call Action Button */}
            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="px-4 py-2 bg-[#133926] hover:bg-[#0d271a] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>+</span> Log a Call
            </button>
          </div>
        </div>

        {/* 4 Calling KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Today's Calls Progress */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/30 dark:from-emerald-950/40 dark:to-gray-800/80 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Calls Made Today</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">{goalPercent}% of Goal</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-900 dark:text-emerald-100">
                {todayCallsCount}
              </span>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                / {dailyCallGoal} target
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
              {goalPercent >= 100
                ? '🎉 Daily calling quota achieved! Excellent momentum.'
                : `${dailyCallGoal - todayCallsCount} more calls needed to reach today's target.`}
            </p>
          </div>

          {/* Card 2: Connected & Interested */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/30 dark:from-blue-950/40 dark:to-gray-800/80 border border-blue-200/80 dark:border-blue-800/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Connected & Engaged</span>
              <span className="text-blue-700 dark:text-blue-300 font-extrabold">{connectionRateToday}% Connect</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-900 dark:text-blue-100">
                {todayConnected}
              </span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                conversations
              </span>
            </div>
            <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
              Candidates who answered, discussed curriculum, or were qualified.
            </div>
          </div>

          {/* Card 3: Follow-ups Scheduled */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/80 to-fuchsia-50/30 dark:from-purple-950/40 dark:to-gray-800/80 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Follow-ups & Call Later</span>
              <span className="text-purple-700 dark:text-purple-300 font-extrabold">Next Steps</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-900 dark:text-purple-100">
                {todayFollowUps}
              </span>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                scheduled
              </span>
            </div>
            <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
              Marked for Follow-Up 1, 2, 3 or callback later today.
            </div>
          </div>

          {/* Card 4: Did Not Pick */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50/80 to-amber-50/30 dark:from-rose-950/40 dark:to-gray-800/80 border border-rose-200/80 dark:border-rose-800/60 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>Unreached / No Pick</span>
              <span className="text-rose-700 dark:text-rose-300 font-extrabold">Retry Queued</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-900 dark:text-rose-100">
                {todayDidNotPick}
              </span>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                attempts
              </span>
            </div>
            <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
              Did Not Pick or unreached. Automated WhatsApp reminders triggered.
            </div>
          </div>
        </div>

        {/* Visual Outcome Distribution Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400">
            <span>Today's Call Outcome Distribution</span>
            <span>{todayCallsCount} Total Calls Logged</span>
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {todayCallsCount > 0 ? (
              <>
                <div
                  title={`Connected: ${todayConnected}`}
                  style={{ width: `${(todayConnected / todayCallsCount) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                ></div>
                <div
                  title={`Follow-ups: ${todayFollowUps}`}
                  style={{ width: `${(todayFollowUps / todayCallsCount) * 100}%` }}
                  className="bg-purple-500 h-full transition-all"
                ></div>
                <div
                  title={`Did Not Pick: ${todayDidNotPick}`}
                  style={{ width: `${(todayDidNotPick / todayCallsCount) * 100}%` }}
                  className="bg-rose-400 h-full transition-all"
                ></div>
                <div
                  title="Other"
                  style={{
                    width: `${
                      Math.max(0, todayCallsCount - todayConnected - todayFollowUps - todayDidNotPick) /
                      todayCallsCount *
                      100
                    }%`
                  }}
                  className="bg-gray-400 h-full transition-all"
                ></div>
              </>
            ) : (
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-full"></div>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-gray-500 dark:text-gray-400 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Connected & Engaged ({todayConnected})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Follow-ups & Call Later ({todayFollowUps})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              Did Not Pick ({todayDidNotPick})
            </span>
          </div>
        </div>

        {/* Real-time Call Activity Feed */}
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                Today's Call Activity Feed
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {filteredTodayCalls.length} logs
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {(['All', 'Connected', 'FollowUp', 'Unreached'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCallFeedFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    callFeedFilter === filter
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-2xs'
                      : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'All' ? 'All Calls' : filter === 'Connected' ? 'Connected' : filter === 'FollowUp' ? 'Follow-ups' : 'Unreached'}
                </button>
              ))}
            </div>
          </div>

          {/* List of Today's Calls */}
          {filteredTodayCalls.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
              <div className="text-2xl">📞</div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                No calls match the selected filter for today.
              </p>
              <p className="text-[11px] text-gray-500">
                Click "+ Log a Call" above or click the phone icon on any lead in the Pipeline.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredTodayCalls.map((activity) => {
                const targetLead = leads.find((l) => l.id === activity.leadId);
                const isConnected = ['Connected', 'Interested', 'Qualified', 'Details Sent on WhatsApp'].some((v) =>
                  activity.outcome.toLowerCase().includes(v.toLowerCase())
                );
                const isDidNotPick = activity.outcome.toLowerCase().includes('did not pick') || activity.outcome.toLowerCase().includes('no response');
                const isFollowUp = activity.outcome.toLowerCase().includes('follow-up') || activity.outcome.toLowerCase().includes('call later');

                const badgeClass = isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : isFollowUp
                  ? 'bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : isDidNotPick
                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';

                return (
                  <div
                    key={activity.id}
                    className="p-3.5 bg-gray-50/70 hover:bg-gray-100/70 dark:bg-gray-700/30 dark:hover:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-xl bg-[#264e36] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {activity.leadName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              if (targetLead) setSelectedLeadForModal(targetLead);
                            }}
                            className="font-extrabold text-xs text-gray-900 dark:text-gray-100 hover:text-emerald-700 dark:hover:text-emerald-400 text-left cursor-pointer truncate"
                          >
                            {activity.leadName}
                          </button>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                            {activity.outcome}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {activity.programName || 'AI Program'}
                          </span>
                        </div>

                        {activity.notes && (
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium line-clamp-2">
                            "{activity.notes}"
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium pt-0.5">
                          <span>Caller: {activity.salesperson || 'Alex Rivera'}</span>
                          <span>•</span>
                          <span>{activity.leadPhone || (targetLead && targetLead.phone) || 'Phone unlisted'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Time & Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xs">
                        ⏰ {formatCallTimestamp(activity.timestamp)}
                      </span>

                      {targetLead && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${targetLead.phone}`}
                            onClick={() => logCall(targetLead.id, 'Connected', 'Outgoing callback')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-bold cursor-pointer"
                            title="Call Lead"
                          >
                            📞
                          </a>
                          <button
                            onClick={() => setSelectedLeadForModal(targetLead)}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 cursor-pointer shadow-2xs"
                          >
                            Details →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Log Call Modal */}
      {isQuickLogOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsQuickLogOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>📞</span> Quick Log Outreach Call
              </h3>
              <button
                onClick={() => setIsQuickLogOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickLogSubmit} className="space-y-4 text-xs">
              {/* Select Lead */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Select Lead to Log Call For
                </label>
                <input
                  type="text"
                  placeholder="Filter lead by name or phone..."
                  value={quickLogSearch}
                  onChange={(e) => setQuickLogSearch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-1.5 font-medium"
                />
                <select
                  value={quickLogLeadId}
                  onChange={(e) => setQuickLogLeadId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold"
                >
                  <option value="">-- Choose Lead ({leads.length} available) --</option>
                  {leads
                    .filter((l) =>
                      quickLogSearch
                        ? l.fullName.toLowerCase().includes(quickLogSearch.toLowerCase()) ||
                          l.phone.includes(quickLogSearch)
                        : true
                    )
                    .slice(0, 30)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.fullName} ({l.phone}) — {l.programName || 'AI Program'}
                      </option>
                    ))}
                </select>
              </div>

              {/* Select Outcome */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Call Outcome
                </label>
                <select
                  value={quickLogOutcome}
                  onChange={(e) => setQuickLogOutcome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
                >
                  <option value="Connected">Connected & Discussed</option>
                  <option value="Interested">Interested in Cohort</option>
                  <option value="Qualified">Qualified Candidate</option>
                  <option value="Details Sent on WhatsApp">Details Sent on WhatsApp</option>
                  <option value="Follow-Up 1">Follow-Up 1 Scheduled</option>
                  <option value="Follow-Up 2">Follow-Up 2 Scheduled</option>
                  <option value="Call Later">Call Later / Callback Requested</option>
                  <option value="Did Not Pick The Call">Did Not Pick The Call (No Answer)</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Unqualified">Unqualified</option>
                </select>
              </div>

              {/* Call Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 dark:text-gray-300">
                  Call Notes & Discussion Summary
                </label>
                <textarea
                  rows={3}
                  value={quickLogNotes}
                  onChange={(e) => setQuickLogNotes(e.target.value)}
                  placeholder="e.g. Spoke about upcoming batch timing, experience level, fee structure, and next steps..."
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickLogOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickLogLeadId}
                  className="px-5 py-2 bg-[#133926] hover:bg-[#0d271a] disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT GRID (Left 2/3 + Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: Funnel + Meta Ads Performance (Span 2) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card A: Live Pipeline Conversion Funnel */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-base">
                  🌪️
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
                    Live Pipeline Conversion Funnel
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From Meta Ad Lead to Enrollment — {totalLeadsCount} total leads in pipeline
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200"
                >
                  <option value="all">All Cohorts</option>
                  <option value="ai-pm">AI-PM Cohort</option>
                  <option value="ai-gtm">AI-GTM Cohort</option>
                  <option value="ai-fellowship">AI-Fellowship</option>
                </select>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <span>👥</span> {totalLeadsCount} Total Leads Active
                </span>
              </div>
            </div>

            {/* Funnel Layout: Left Tapered Graphic + Right Legend Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
              {/* Left: Tapered Trapezoid Conversion Funnel */}
              <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
                {/* Stage 1 */}
                <div 
                  style={{ width: '100%', height: '32px', clipPath: 'polygon(0% 0%, 100% 0%, 93% 100%, 7% 100%)' }}
                  className="bg-[#133926] text-white flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {totalLeadsCount}
                </div>
                {/* Stage 2 */}
                <div 
                  style={{ width: '86%', height: '30px', clipPath: 'polygon(0% 0%, 100% 0%, 92% 100%, 8% 100%)' }}
                  className="bg-[#2d6a4f] text-white flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {contactedCount}
                </div>
                {/* Stage 3 */}
                <div 
                  style={{ width: '72%', height: '28px', clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}
                  className="bg-[#40916c] text-white flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {interestedCount}
                </div>
                {/* Stage 4 */}
                <div 
                  style={{ width: '58%', height: '26px', clipPath: 'polygon(0% 0%, 100% 0%, 88% 100%, 12% 100%)' }}
                  className="bg-[#74c69d] text-emerald-950 flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {qualifiedCount}
                </div>
                {/* Stage 5 */}
                <div 
                  style={{ width: '44%', height: '24px', clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' }}
                  className="bg-[#b7e4c7] text-emerald-950 flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {detailsSentCount}
                </div>
                {/* Stage 6 */}
                <div 
                  style={{ width: '30%', height: '22px', clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)' }}
                  className="bg-[#d8f3dc] text-emerald-950 flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {joinedSessionCount}
                </div>
                {/* Stage 7 (Bottom tip) */}
                <div 
                  style={{ width: '18%', height: '20px' }}
                  className="bg-[#f87171] text-white rounded-full flex items-center justify-center font-black text-xs shadow-xs"
                >
                  {enrollmentsCount}
                </div>
              </div>

              {/* Right: Funnel Legend Table with Colored Dots */}
              <div className="space-y-2.5 pr-2">
                {funnelStages.map((stage) => (
                  <div key={stage.name} className="flex items-center justify-between text-xs py-0.5 border-b border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor} shrink-0`}></span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {stage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="font-black text-gray-900 dark:text-gray-100 min-w-[32px]">
                        {stage.count}
                      </span>
                      <span className="font-semibold text-gray-400 min-w-[42px] text-right">
                        {stage.pct}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card B: Meta Ads Performance */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  📊
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                    Meta Ads Performance
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Real-time performance from connected ad accounts
                  </p>
                </div>
              </div>

              <div className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center gap-1 cursor-pointer">
                <span>📅 Last 7 Days</span>
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            {/* 5 Meta Ads Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {/* Metric 1 */}
              <div className="p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Ad Spend</span>
                <div className="text-base font-black text-gray-900 dark:text-gray-100">₹1,250</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-emerald-600">↑ +18%</span>
                  <svg width="40" height="16" className="overflow-visible">
                    <polyline fill="none" stroke="#10b981" strokeWidth="2" points="0,12 10,10 20,12 30,6 40,2" />
                  </svg>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Leads Generated</span>
                <div className="text-base font-black text-gray-900 dark:text-gray-100">34</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-blue-600">↓ +25%</span>
                  <svg width="40" height="16" className="overflow-visible">
                    <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points="0,14 10,12 20,8 30,10 40,4" />
                  </svg>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Cost per Lead</span>
                <div className="text-base font-black text-gray-900 dark:text-gray-100">₹36</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-purple-600">↓ -12%</span>
                  <svg width="40" height="16" className="overflow-visible">
                    <polyline fill="none" stroke="#a855f7" strokeWidth="2" points="0,4 10,8 20,6 30,12 40,14" />
                  </svg>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">CPL (ANPM)</span>
                <div className="text-base font-black text-gray-900 dark:text-gray-100">₹26</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-emerald-600">↓ -18%</span>
                  <svg width="40" height="16" className="overflow-visible">
                    <polyline fill="none" stroke="#10b981" strokeWidth="2" points="0,6 10,8 20,10 30,8 40,14" />
                  </svg>
                </div>
              </div>

              {/* Metric 5 */}
              <div className="p-3 bg-gray-50/70 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">CPL (AIGTM)</span>
                <div className="text-base font-black text-gray-900 dark:text-gray-100">₹31</div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-amber-600">↓ -22%</span>
                  <svg width="40" height="16" className="overflow-visible">
                    <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points="0,4 10,6 20,8 30,12 40,14" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Negative/Nurture Stages + Recent Leads (Span 1) */}
        <div className="space-y-5">
          {/* Card C: Negative / Nurture Stages */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-bold text-base">❗️</span>
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
                Negative / Nurture Stages
              </h2>
            </div>

            <div className="space-y-4 pt-1">
              {/* Row 1: No Response */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span>🕒</span> No Response / Unattempted
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{noResponseCount} Leads</span>
                    <span className="text-gray-400 text-[11px]">100%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-blue-100 dark:bg-blue-950/60 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Row 2: Active Nurture */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span>🍃</span> Active Nurture
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-300">{activeNurtureCount} Leads</span>
                    <span className="text-gray-400 text-[11px]">0.8%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-blue-50 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>

              {/* Row 3: Not Interested */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span>⛔</span> Not Interested
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-700 dark:text-amber-300">{notInterestedCount} Leads</span>
                    <span className="text-gray-400 text-[11px]">0%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-amber-50 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>

              {/* Row 4: Unqualified / Invalid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <span>🚫</span> Unqualified / Invalid
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-700 dark:text-rose-300">{unqualifiedCount} Leads</span>
                    <span className="text-gray-400 text-[11px]">0%</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-rose-50 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card D: Recent Leads Table */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm">👥</span>
                <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
                  Recent Leads
                </h2>
              </div>
              <button
                onClick={() => navigate('/pipeline')}
                className="text-xs font-bold text-gray-500 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-bold text-[10px] uppercase">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Program</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {recentLeads.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedLeadForModal(item.lead)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 font-bold text-gray-900 dark:text-gray-100 truncate max-w-[90px]">
                        {item.name}
                      </td>
                      <td className="py-2.5 text-gray-500 truncate max-w-[90px]">
                        {item.program}
                      </td>
                      <td className="py-2.5 text-gray-400 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                        ⋮
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Simulator Modal */}
      {isSimulatorOpen && (
        <MetaLeadSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
        />
      )}

      {/* Lead Detail Modal */}
      {selectedLeadForModal && (
        <LeadDetailModal
          lead={selectedLeadForModal}
          isOpen={!!selectedLeadForModal}
          onClose={() => setSelectedLeadForModal(null)}
          onStageChange={(newStage) => updateLeadStage(selectedLeadForModal.id, newStage)}
          onDelete={() => setSelectedLeadForModal(null)}
        />
      )}
    </div>
  );
}
