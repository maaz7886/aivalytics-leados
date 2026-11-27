// src/pages/Dashboard.tsx
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import { SidePanel } from '../components/ui/SidePanel';
import { LeadPanel } from '../components/LeadPanel';
import { StageChip } from '../components/ui/StageChip';
import { Button } from '../components/ui/Button';
import MetaLeadSimulatorModal from '../components/MetaLeadSimulatorModal';
import { formatPhoneNumber } from '../utils/tableFormatters';
import {
  Users,
  AlertCircle,
  AlertTriangle,
  Clock,
  Phone,
  CreditCard,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Search
} from 'lucide-react';

export default function Dashboard() {
  const {
    currentUser,
    leads,
    allLeads,
    todayCallActivities,
    salespeople = [],
    assignLead,
    autoDistributeRoundRobin,
    logCall
  } = useApp();
  const navigate = useNavigate();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<'all' | 'ai-pm' | 'ai-builder' | 'ai-gtm'>('all');

  // Side Panel state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Exception Center Drill-Down State
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<
    'untouched' | 'overdue' | 'unassigned' | 'stuck' | 'payment_pending' | null
  >('untouched');

  const [dashboardToast, setDashboardToast] = useState<string | null>(null);
  const [drillDownSearch, setDrillDownSearch] = useState('');

  const showDashboardToast = (msg: string) => {
    setDashboardToast(msg);
    setTimeout(() => setDashboardToast(null), 3500);
  };

  const todayStr = new Date().toISOString().substring(0, 10);
  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;

  // Cohort Filtering
  const filteredLeads = leadsPool.filter((l) => {
    if (selectedCohort === 'all') return true;
    const pName = (l.programName || '').toLowerCase();
    if (selectedCohort === 'ai-pm') return l.programId === 'ai-pm' || pName.includes('project') || pName.includes('pm');
    if (selectedCohort === 'ai-builder') return l.programId === 'ai-builder' || pName.includes('builder') || pName.includes('workshop');
    if (selectedCohort === 'ai-gtm') return l.programId === 'ai-gtm' || pName.includes('gtm');
    return true;
  });

  // --- 1. EXCEPTION CENTER DATA ---
  // A. Untouched Leads (>24h SLA breach)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const untouchedLeads = leadsPool.filter((l) => {
    if ((l.numberOfCalls || 0) > 0 || (l.lastContacted && l.lastContacted !== 'Not Contacted')) return false;
    if (['Not Interested', 'Unqualified', 'Converted', 'Lost', 'Closed Lost'].includes(l.crmStage)) return false;
    const t = l.assignedAt || l.dateCaptured || l.createdTime;
    return !t || new Date(t) <= twentyFourHoursAgo;
  });

  // B. Overdue Follow-ups across all reps
  const overdueFollowUps = leadsPool.filter((l) => {
    if (['Not Interested', 'Unqualified', 'Converted', 'Lost', 'Closed Lost'].includes(l.crmStage)) return false;
    const isOverdueFollowUp = l.nextFollowUp && l.nextFollowUp.substring(0, 10) < todayStr;
    const isOverdueTask =
      l.nextTask &&
      !l.nextTask.completionStatus?.toLowerCase().includes('complete') &&
      l.nextTask.dueDateTime?.substring(0, 10) < todayStr;
    return Boolean(isOverdueFollowUp || isOverdueTask);
  });

  // C. Unassigned Leads (Ad leads waiting for routing)
  const unassignedLeads = leadsPool.filter(
    (l) => !l.assignedSalesperson || l.assignedSalesperson === 'Unassigned'
  );

  // D. Stuck in Stage (>5 days without progression)
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const stuckLeads = leadsPool.filter((l) => {
    if (['New Lead', 'Not Interested', 'Unqualified', 'Converted', 'Lost', 'Closed Lost'].includes(l.crmStage)) return false;
    const t = l.lastContacted || l.dateCaptured;
    return t && new Date(t) <= fiveDaysAgo;
  });

  // E. Payment Pending Anomalies (Link sent but unpaid after 48h)
  const paymentPendingLeads = leadsPool.filter((l) => {
    return (
      l.crmStage === 'Payment Pending' ||
      l.paymentState === 'Payment link sent' ||
      l.paymentState === 'Deposit pending'
    );
  });

  const totalExceptionsCount =
    untouchedLeads.length +
    overdueFollowUps.length +
    unassignedLeads.length +
    stuckLeads.length +
    paymentPendingLeads.length;

  // --- 2. REVENUE & ADMISSIONS METRICS ---
  const totalLeadsCount = filteredLeads.length;

  const contactedCount = filteredLeads.filter(
    (l) =>
      (l.numberOfCalls || 0) > 0 ||
      (l.lastContacted && l.lastContacted !== 'Not Contacted') ||
      l.crmStage !== 'New Lead'
  ).length;

  const interestedCount = filteredLeads.filter((l) => l.crmStage === 'Interested').length;

  const qualifiedCount = filteredLeads.filter((l) =>
    ['Qualified', 'Details Sent on WhatsApp', 'Payment Pending', 'Converted'].includes(l.crmStage)
  ).length;

  const enrolledLeads = filteredLeads.filter(
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid' || l.paymentState === 'Paid in full'
  );

  // AI-PM vs AI Builder breakdowns
  const enrolledAiPm = enrolledLeads.filter((l) =>
    (l.programName || '').toLowerCase().includes('pm')
  );
  const enrolledAiBuilder = enrolledLeads.filter((l) =>
    (l.programName || '').toLowerCase().includes('builder') ||
    (l.programName || '').toLowerCase().includes('workshop')
  );

  const collectedRevenue =
    enrolledAiPm.length * 49999 +
    enrolledAiBuilder.length * 6999 +
    (enrolledLeads.length - enrolledAiPm.length - enrolledAiBuilder.length) * 34999;

  const pipelinePotentialValue = filteredLeads.reduce((acc, l) => {
    if (l.crmStage === 'Converted' || l.paymentStatus === 'Paid') return acc;
    const isAiPm = (l.programName || '').toLowerCase().includes('pm');
    const dealSize = isAiPm ? 49999 : 6999;
    const weight =
      l.crmStage === 'Payment Pending' ? 0.8 :
      l.crmStage === 'Qualified' ? 0.4 :
      l.crmStage === 'Interested' ? 0.2 : 0.05;
    return acc + Math.round(dealSize * weight);
  }, 0);

  const conversionRate = totalLeadsCount > 0
    ? ((enrolledLeads.length / totalLeadsCount) * 100).toFixed(1)
    : '0.0';

  // --- 3. STAGE CONVERSION FUNNEL ---
  const funnelSteps = [
    { name: 'Total Ingested', count: totalLeadsCount, pct: 100 },
    {
      name: 'Contacted',
      count: contactedCount,
      pct: totalLeadsCount > 0 ? Math.round((contactedCount / totalLeadsCount) * 100) : 0
    },
    {
      name: 'Interested',
      count: interestedCount,
      pct: totalLeadsCount > 0 ? Math.round((interestedCount / totalLeadsCount) * 100) : 0
    },
    {
      name: 'Qualified',
      count: qualifiedCount,
      pct: totalLeadsCount > 0 ? Math.round((qualifiedCount / totalLeadsCount) * 100) : 0
    },
    {
      name: 'Payment Pending',
      count: paymentPendingLeads.length,
      pct: totalLeadsCount > 0 ? Math.round((paymentPendingLeads.length / totalLeadsCount) * 100) : 0
    },
    {
      name: 'Enrolled',
      count: enrolledLeads.length,
      pct: totalLeadsCount > 0 ? Math.round((enrolledLeads.length / totalLeadsCount) * 100) : 0
    }
  ];

  // Helper to open side panel
  const handleOpenLeadPanel = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsSidePanelOpen(true);
  };

  // Get active exception records
  const getActiveRecords = (): Lead[] => {
    let list: Lead[] = [];
    if (selectedRiskCategory === 'untouched') list = untouchedLeads;
    else if (selectedRiskCategory === 'overdue') list = overdueFollowUps;
    else if (selectedRiskCategory === 'unassigned') list = unassignedLeads;
    else if (selectedRiskCategory === 'stuck') list = stuckLeads;
    else if (selectedRiskCategory === 'payment_pending') list = paymentPendingLeads;

    if (drillDownSearch.trim()) {
      const q = drillDownSearch.toLowerCase();
      return list.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const activeDrillDownRecords = getActiveRecords();

  if (!currentUser) {
    return <Navigate to="/auth/signin?redirect=/dashboard" replace />;
  }
  if (currentUser.role !== 'Admin') {
    return <Navigate to="/today" replace />;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {dashboardToast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{dashboardToast}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Control Room
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66]">
              Executive Overview
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Real-time pipeline metrics, operational exception monitoring, and cohort admissions revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Cohort Segmented Control */}
          <div className="flex items-center bg-[#F7F7F5] border border-[#E6E6E3] rounded-md p-0.5 text-[12px]">
            {(
              [
                { id: 'all', label: 'All Cohorts' },
                { id: 'ai-pm', label: 'AI-PM (₹49,999)' },
                { id: 'ai-builder', label: 'AI Builder (₹6,999)' }
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCohort(c.id)}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                  selectedCohort === c.id
                    ? 'bg-white text-[#1F1F1D] shadow-2xs'
                    : 'text-[#6B6B66] hover:text-[#1F1F1D]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 text-[13px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3B4BDB]" />
            <span>Simulate Lead</span>
          </Button>
        </div>
      </div>

      {/* --- SECTION 1: EXCEPTIONS & REVENUE RISK CENTER --- */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#B42318]" />
              <h2 className="text-[14px] font-semibold text-[#1F1F1D]">
                Operational Exceptions & Risk Center
              </h2>
            </div>
            <p className="text-[12px] text-[#6B6B66] mt-0.5">
              Tracks leads and queues deviating from operational SLA standards. Click any card below to drill down and remediate.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FDF2F2] border border-[#FECDCA] text-[#B42318] tabular-nums font-mono">
              {totalExceptionsCount} Total Exceptions
            </span>
          </div>
        </div>

        {/* 5 Exception Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Untouched >24h */}
          <div
            onClick={() =>
              setSelectedRiskCategory(selectedRiskCategory === 'untouched' ? null : 'untouched')
            }
            className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              selectedRiskCategory === 'untouched'
                ? 'bg-[#EEF0FD] border-[#3B4BDB]'
                : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B6B66]">Untouched &gt;24h</span>
              <Clock className="w-3.5 h-3.5 text-[#B42318]" />
            </div>
            <div className="my-2">
              <span className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                {untouchedLeads.length}
              </span>
              <span className="text-[12px] text-[#6B6B66] ml-1">leads</span>
            </div>
            <span className="text-[11px] text-[#B42318] font-medium flex items-center gap-1">
              0 calls placed <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* 2. Overdue Callbacks */}
          <div
            onClick={() =>
              setSelectedRiskCategory(selectedRiskCategory === 'overdue' ? null : 'overdue')
            }
            className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              selectedRiskCategory === 'overdue'
                ? 'bg-[#EEF0FD] border-[#3B4BDB]'
                : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B6B66]">Overdue Tasks</span>
              <AlertCircle className="w-3.5 h-3.5 text-[#B42318]" />
            </div>
            <div className="my-2">
              <span className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                {overdueFollowUps.length}
              </span>
              <span className="text-[12px] text-[#6B6B66] ml-1">leads</span>
            </div>
            <span className="text-[11px] text-[#B42318] font-medium flex items-center gap-1">
              Past SLA date <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* 3. Unassigned Leads */}
          <div
            onClick={() =>
              setSelectedRiskCategory(selectedRiskCategory === 'unassigned' ? null : 'unassigned')
            }
            className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              selectedRiskCategory === 'unassigned'
                ? 'bg-[#EEF0FD] border-[#3B4BDB]'
                : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B6B66]">Unassigned</span>
              <Users className="w-3.5 h-3.5 text-[#DC8A00]" />
            </div>
            <div className="my-2">
              <span className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                {unassignedLeads.length}
              </span>
              <span className="text-[12px] text-[#6B6B66] ml-1">leads</span>
            </div>
            <span className="text-[11px] text-[#8A4B00] font-medium flex items-center gap-1">
              Needs rep routing <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* 4. Stuck in Stage (>5 days) */}
          <div
            onClick={() =>
              setSelectedRiskCategory(selectedRiskCategory === 'stuck' ? null : 'stuck')
            }
            className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
              selectedRiskCategory === 'stuck'
                ? 'bg-[#EEF0FD] border-[#3B4BDB]'
                : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B6B66]">Stuck &gt;5 Days</span>
              <AlertTriangle className="w-3.5 h-3.5 text-[#DC8A00]" />
            </div>
            <div className="my-2">
              <span className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                {stuckLeads.length}
              </span>
              <span className="text-[12px] text-[#6B6B66] ml-1">leads</span>
            </div>
            <span className="text-[11px] text-[#8A4B00] font-medium flex items-center gap-1">
              No recent progress <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* 5. Payment Pending */}
          <div
            onClick={() =>
              setSelectedRiskCategory(
                selectedRiskCategory === 'payment_pending' ? null : 'payment_pending'
              )
            }
            className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1 ${
              selectedRiskCategory === 'payment_pending'
                ? 'bg-[#EEF0FD] border-[#3B4BDB]'
                : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#6B6B66]">Payment Pending</span>
              <CreditCard className="w-3.5 h-3.5 text-[#3B4BDB]" />
            </div>
            <div className="my-2">
              <span className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                {paymentPendingLeads.length}
              </span>
              <span className="text-[12px] text-[#6B6B66] ml-1">leads</span>
            </div>
            <span className="text-[11px] text-[#3B4BDB] font-medium flex items-center gap-1">
              Follow-up required <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* --- INTERACTIVE DRILL-DOWN PANEL --- */}
        {selectedRiskCategory && (
          <div className="mt-4 p-4 rounded-lg border border-[#E6E6E3] bg-[#F7F7F5] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-2.5">
              <div>
                <h3 className="text-[13px] font-semibold text-[#1F1F1D] flex items-center gap-2">
                  <span>Exception Drill-Down:</span>
                  <span className="text-[#3B4BDB]">
                    {selectedRiskCategory === 'untouched' && `Untouched Leads >24h (${untouchedLeads.length})`}
                    {selectedRiskCategory === 'overdue' && `Overdue Follow-ups (${overdueFollowUps.length})`}
                    {selectedRiskCategory === 'unassigned' && `Unassigned Leads (${unassignedLeads.length})`}
                    {selectedRiskCategory === 'stuck' && `Stuck in Stage >5 Days (${stuckLeads.length})`}
                    {selectedRiskCategory === 'payment_pending' && `Payment Pending (${paymentPendingLeads.length})`}
                  </span>
                </h3>
                <p className="text-[11px] text-[#6B6B66] mt-0.5">
                  {selectedRiskCategory === 'untouched' && 'Leads captured that have received zero outreach calls for over 24 hours.'}
                  {selectedRiskCategory === 'overdue' && 'Leads whose scheduled callback or action deadline has elapsed.'}
                  {selectedRiskCategory === 'unassigned' && 'Ad leads received in CRM without an assigned representative.'}
                  {selectedRiskCategory === 'stuck' && 'Candidates lingering in pipeline stages without touchpoints for over 5 days.'}
                  {selectedRiskCategory === 'payment_pending' && 'Candidates with active payment links or deposit invoices.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedRiskCategory === 'unassigned' && unassignedLeads.length > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (autoDistributeRoundRobin) {
                        autoDistributeRoundRobin();
                        showDashboardToast('All unassigned leads distributed evenly across sales reps');
                      }
                    }}
                    className="h-7 text-[12px] px-2.5"
                  >
                    Auto-Assign via Round-Robin
                  </Button>
                )}

                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-[#6B6B66] absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={drillDownSearch}
                    onChange={(e) => setDrillDownSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-white border border-[#E6E6E3] rounded-md text-[12px] text-[#1F1F1D] focus:outline-hidden"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRiskCategory(null)}
                  className="h-7 text-[12px] px-2"
                >
                  Close
                </Button>
              </div>
            </div>

            {/* Drill-Down Table */}
            <div className="overflow-x-auto rounded-md border border-[#E6E6E3] bg-white">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                    <th className="py-2 px-3">Candidate</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Program</th>
                    <th className="py-2 px-3">Assigned Rep</th>
                    <th className="py-2 px-3">Stage</th>
                    <th className="py-2 px-3">Next Action</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E6E3]">
                  {activeDrillDownRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[#6B6B66] text-[12px]">
                        No records found in this exception category.
                      </td>
                    </tr>
                  ) : (
                    activeDrillDownRecords.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#F3F4F6] transition-colors h-10">
                        <td className="py-2 px-3">
                          <button
                            type="button"
                            onClick={() => handleOpenLeadPanel(lead)}
                            className="font-medium text-[#1F1F1D] hover:text-[#3B4BDB] text-left cursor-pointer"
                          >
                            {lead.fullName}
                          </button>
                          <div className="text-[11px] text-[#6B6B66]">
                            {lead.currentRole || 'Candidate'}
                          </div>
                        </td>

                        <td className="py-2 px-3 tabular-nums font-mono text-[12px]">
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={() => {
                              logCall(lead.id, 'Connected', 'Direct control room dial');
                              showDashboardToast(`Dialing ${lead.fullName}...`);
                            }}
                            className="text-[#1F1F1D] hover:text-[#3B4BDB] flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-[#3B4BDB]" />
                            <span>{formatPhoneNumber(lead.phone)}</span>
                          </a>
                        </td>

                        <td className="py-2 px-3 text-[#1F1F1D]">
                          {lead.programName || 'AI Cohort'}
                        </td>

                        <td className="py-2 px-3">
                          <select
                            value={lead.assignedSalesperson || 'Unassigned'}
                            onChange={(e) => {
                              if (assignLead) assignLead(lead.id, e.target.value);
                              showDashboardToast(`Assigned ${lead.fullName} to ${e.target.value}`);
                            }}
                            className="px-2 py-0.5 border border-[#E6E6E3] rounded-md text-[12px] bg-white text-[#1F1F1D] cursor-pointer"
                          >
                            <option value="Unassigned">Unassigned</option>
                            {salespeople.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-3">
                          <StageChip stage={lead.crmStage as Stage} />
                        </td>

                        <td className="py-2 px-3">
                          {lead.nextTask ? (
                            <span className="text-[12px] text-[#1F1F1D]">
                              {lead.nextTask.taskType}
                            </span>
                          ) : lead.nextFollowUp ? (
                            <span className="text-[12px] text-[#8A4B00] tabular-nums font-mono">
                              {lead.nextFollowUp}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[#B42318]">No next action</span>
                          )}
                        </td>

                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.phone && (
                              <a
                                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
                                  lead.fullName.split(' ')[0]
                                )},%20following%20up%20from%20AIValytics.`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] border border-[#C3ECD0] rounded"
                              >
                                WhatsApp
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenLeadPanel(lead)}
                              className="h-7 text-[12px] px-2 text-[#3B4BDB]"
                            >
                              Details
                            </Button>
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
      </div>

      {/* --- SECTION 2: REVENUE & PIPELINE OVERVIEW (4 NOTION CARDS) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled Revenue */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Total Enrolled Revenue</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              {enrolledLeads.length} paid
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            ₹{collectedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            {enrolledAiPm.length} AI-PM (₹49,999) · {enrolledAiBuilder.length} AI Builder (₹6,999)
          </div>
        </div>

        {/* Card 2: Weighted Pipeline Potential */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Weighted Pipeline</span>
            <span className="tabular-nums font-mono text-[11px]">Active deals</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            ₹{pipelinePotentialValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Probability-weighted forecast across active leads
          </div>
        </div>

        {/* Card 3: Total Active Leads */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Active Leads Pool</span>
            <span className="tabular-nums font-mono text-[11px]">All stages</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {totalLeadsCount}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            {contactedCount} contacted · {qualifiedCount} qualified
          </div>
        </div>

        {/* Card 4: Funnel Conversion Rate */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Overall Conversion Rate</span>
            <span className="tabular-nums font-mono text-[11px]">Lead to paid</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {conversionRate}%
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            {enrolledLeads.length} enrolled out of {totalLeadsCount} total leads
          </div>
        </div>
      </div>

      {/* --- SECTION 3: FUNNEL PROGRESS & REP PERFORMANCE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stage Conversion Funnel */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                Pipeline Conversion Funnel
              </h3>
              <p className="text-[12px] text-[#6B6B66]">
                Progression from ad capture to enrollment
              </p>
            </div>
            <span className="text-[12px] text-[#6B6B66] tabular-nums font-mono">
              {totalLeadsCount} Total Leads
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelSteps.map((step) => (
              <div key={step.name} className="space-y-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-[#1F1F1D]">{step.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1F1F1D] font-semibold tabular-nums font-mono">
                      {step.count}
                    </span>
                    <span className="text-[#6B6B66] tabular-nums font-mono text-[11px] w-10 text-right">
                      {step.pct}%
                    </span>
                  </div>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-[#F7F7F5] rounded-full h-2 overflow-hidden border border-[#E6E6E3]">
                  <div
                    className="bg-[#3B4BDB] h-full rounded-full transition-all duration-300"
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rep Activity Leaderboard */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                Sales Reps Performance
              </h3>
              <p className="text-[12px] text-[#6B6B66]">
                Daily call pacing, connect rate, and admissions
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/team')}
              className="text-[12px] text-[#3B4BDB]"
            >
              Manage Team →
            </Button>
          </div>

          <div className="divide-y divide-[#E6E6E3]">
            {salespeople.map((rep) => {
              const repCalls = todayCallActivities.filter((c) => c.salesperson === rep.name);
              const repConnected = repCalls.filter((c) =>
                ['Connected', 'Interested', 'Qualified', 'Details Sent on WhatsApp'].includes(c.outcome)
              );
              const repConnectRate =
                repCalls.length > 0 ? Math.round((repConnected.length / repCalls.length) * 100) : 0;
              const repEnrolledCount = leadsPool.filter(
                (l) =>
                  l.assignedSalesperson === rep.name &&
                  (l.crmStage === 'Converted' || l.paymentStatus === 'Paid')
              ).length;
              const target = rep.dailyCallTarget || 30;
              const repPacingPercent = Math.min(100, Math.round((repCalls.length / target) * 100));

              return (
                <div key={rep.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold text-[12px] flex items-center justify-center shrink-0">
                      {rep.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-[13px] text-[#1F1F1D] truncate">
                        {rep.name}
                      </div>
                      <div className="text-[11px] text-[#6B6B66] truncate">
                        {rep.title || 'Admissions Specialist'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <div className="text-[12px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                        {repCalls.length} / {target}
                      </div>
                      <div className="text-[10px] text-[#6B6B66] tabular-nums font-mono">
                        {repPacingPercent}% quota
                      </div>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                        {repConnectRate}%
                      </div>
                      <div className="text-[10px] text-[#6B6B66]">connects</div>
                    </div>

                    <div>
                      <div className="text-[12px] font-semibold text-[#17673A] tabular-nums font-mono">
                        {repEnrolledCount}
                      </div>
                      <div className="text-[10px] text-[#6B6B66]">enrolled</div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/workspace/${rep.id}`)}
                      className="h-7 text-[11px] px-2"
                    >
                      Workspace
                    </Button>
                  </div>
                </div>
              );
            })}
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

      {/* Slide-over Side Panel (480px) */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false);
          setSelectedLeadId(null);
        }}
      >
        <LeadPanel
          leadId={selectedLeadId}
          onClose={() => {
            setIsSidePanelOpen(false);
            setSelectedLeadId(null);
          }}
        />
      </SidePanel>
    </div>
  );
}
