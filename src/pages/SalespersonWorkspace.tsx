// src/pages/SalespersonWorkspace.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Lead, ActivityOutcome, Stage } from '../types';
import { SidePanel } from '../components/ui/SidePanel';
import { LeadPanel } from '../components/LeadPanel';
import { CallingMode } from '../components/CallingMode';
import { StageChip } from '../components/ui/StageChip';
import { TempTag } from '../components/ui/TempTag';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/EmptyState';
import { formatPhoneNumber, formatRelativeTime } from '../utils/tableFormatters';
import {
  Phone,
  PhoneCall,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  TrendingUp,
  Users,
  X,
  MessageSquare,
  Search,
  Kanban,
  Zap,
  Flame,
  CreditCard
} from 'lucide-react';

export default function SalespersonWorkspace() {
  const { repId } = useParams<{ repId: string }>();
  const navigate = useNavigate();
  const {
    salespeople,
    leads,
    allLeads,
    callActivities,
    currentUser,
    logCall,
    recordActivity
  } = useApp();

  const rep =
    salespeople.find((s) => s.id === repId) ||
    (currentUser?.role === 'Salesperson' ? currentUser : salespeople[0]) || {
      id: 'rep-default',
      name: 'Sales Rep',
      title: 'Senior Admissions Specialist',
      email: 'sales@aivalytics.com',
      phone: '+91 98220 12345',
      dailyCallTarget: 30,
      avatarColor: 'bg-[#3B4BDB]'
    };

  const [activeTab, setActiveTab] = useState<'queue' | 'leads' | 'calls'>('queue');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Side Panel state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Calling Mode (Power Dialer) state
  const [isCallingModeOpen, setIsCallingModeOpen] = useState(false);

  // Quick Log Modal State
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

  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;
  // Rep-scoped leads
  const repLeads = leadsPool.filter((l) => l.assignedSalesperson === rep.name);

  // Calls logged by this rep
  const repCallActivities = callActivities.filter((c) => c.salesperson === rep.name);
  const repTodayCalls = repCallActivities.filter((c) => c.timestamp.startsWith(todayStr));

  // --- 5 ACTION QUEUES (Exact Playbook Structure) ---
  // 1. Overdue Follow-ups (SLA breach risk · Clear first thing in the morning)
  const overdueQueue = repLeads.filter((l) => {
    if (
      l.crmStage === 'Not Interested' ||
      l.crmStage === 'Unqualified' ||
      l.crmStage === 'Converted' ||
      l.leadStage === 'Closed Lost'
    )
      return false;
    const taskOverdue =
      l.nextTask &&
      !l.nextTask.completionStatus?.toLowerCase().includes('complete') &&
      l.nextTask.dueDateTime?.substring(0, 10) < todayStr;
    const followUpOverdue = l.nextFollowUp && l.nextFollowUp.substring(0, 10) < todayStr;
    return Boolean(taskOverdue || followUpOverdue);
  });

  // 2. Hot Leads (High-priority leads with strong fit scores & purchase intent)
  const hotLeadsQueue = repLeads.filter((l) => {
    if (
      l.crmStage === 'Not Interested' ||
      l.crmStage === 'Unqualified' ||
      l.crmStage === 'Converted' ||
      l.leadStage === 'Closed Lost'
    )
      return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    const isHot = l.leadTemperature === 'Hot';
    const isHighFit = (l.fitScore || 0) >= 80;
    const isHighIntent = (l.intentScore || 0) >= 80;
    return Boolean(isHot || isHighFit || isHighIntent);
  });

  // 3. New Leads (Fresh inbound form submissions · Contact as soon as they arrive)
  const newLeadsQueue = repLeads.filter((l) => {
    if (
      l.crmStage === 'Not Interested' ||
      l.crmStage === 'Unqualified' ||
      l.crmStage === 'Converted' ||
      l.leadStage === 'Closed Lost'
    )
      return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    if (hotLeadsQueue.some((o) => o.id === l.id)) return false;
    const calls = l.numberOfCalls || 0;
    const isNew =
      l.crmStage === 'New Lead' || l.leadStage === 'New' || l.lastContacted === 'Not Contacted';
    return calls === 0 || isNew;
  });

  // 4. Today's Callbacks (Dial at candidate's requested time)
  const todayCallbacksQueue = repLeads.filter((l) => {
    if (
      l.crmStage === 'Not Interested' ||
      l.crmStage === 'Unqualified' ||
      l.crmStage === 'Converted' ||
      l.leadStage === 'Closed Lost'
    )
      return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    if (hotLeadsQueue.some((o) => o.id === l.id)) return false;
    if (newLeadsQueue.some((o) => o.id === l.id)) return false;
    const isTodayTask =
      l.nextTask &&
      !l.nextTask.completionStatus?.toLowerCase().includes('complete') &&
      l.nextTask.dueDateTime?.substring(0, 10) === todayStr;
    const isTodayFollowUp = l.nextFollowUp && l.nextFollowUp.substring(0, 10) === todayStr;
    return Boolean(isTodayTask || isTodayFollowUp);
  });

  // 5. Payment Pending (Check on candidates with active payment links)
  const paymentPendingQueue = repLeads.filter((l) => {
    if (
      l.crmStage === 'Not Interested' ||
      l.crmStage === 'Unqualified' ||
      l.crmStage === 'Converted' ||
      l.leadStage === 'Closed Lost'
    )
      return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    if (hotLeadsQueue.some((o) => o.id === l.id)) return false;
    if (newLeadsQueue.some((o) => o.id === l.id)) return false;
    if (todayCallbacksQueue.some((o) => o.id === l.id)) return false;
    return (
      l.crmStage === 'Payment Pending' ||
      l.paymentState === 'Payment link sent' ||
      (l.paymentStatus && l.paymentStatus.toLowerCase().includes('pending')) ||
      (l.paymentLink && l.paymentStatus !== 'Paid')
    );
  });

  // Remaining active pipeline leads (Nurture)
  const otherActiveQueue = repLeads.filter((l) => {
    if (
      l.crmStage === 'Not Interested' ||
      l.crmStage === 'Unqualified' ||
      l.crmStage === 'Converted' ||
      l.leadStage === 'Closed Lost'
    )
      return false;
    if (overdueQueue.some((o) => o.id === l.id)) return false;
    if (hotLeadsQueue.some((o) => o.id === l.id)) return false;
    if (newLeadsQueue.some((o) => o.id === l.id)) return false;
    if (todayCallbacksQueue.some((o) => o.id === l.id)) return false;
    if (paymentPendingQueue.some((o) => o.id === l.id)) return false;
    return true;
  });

  const fullPriorityQueue = [
    ...overdueQueue,
    ...hotLeadsQueue,
    ...newLeadsQueue,
    ...todayCallbacksQueue,
    ...paymentPendingQueue,
    ...otherActiveQueue
  ];

  // Daily target metrics
  const dailyTarget = rep.dailyCallTarget || 30;
  const callsMadeToday = repTodayCalls.length;
  const progressPercent = Math.min(100, Math.round((callsMadeToday / dailyTarget) * 100));

  // Connected ratio
  const connectedCallsToday = repTodayCalls.filter((c) =>
    ['Connected', 'Interested', 'Qualified', 'Details Sent on WhatsApp'].includes(c.outcome)
  ).length;
  const notConnectedCallsToday = callsMadeToday - connectedCallsToday;
  const connectedRatio = callsMadeToday > 0 ? Math.round((connectedCallsToday / callsMadeToday) * 100) : 0;

  // Enrolled conversions value
  const enrolledLeads = repLeads.filter(
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid' || l.paymentState === 'Paid in full'
  );
  const enrolledValue = enrolledLeads.reduce((acc, l) => {
    const isAiPm = (l.programName || '').toLowerCase().includes('pm');
    return acc + (isAiPm ? 49999 : 6999);
  }, 0);

  // Filtered assigned leads for Tab 2
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

    logCall(quickLogModalLead.id, quickLogOutcome, quickLogNotes || 'Call logged');

    showToast(`Activity and Next Task logged for ${quickLogModalLead.fullName}`);
    setQuickLogModalLead(null);
  };

  const handleOpenLeadPanel = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsSidePanelOpen(true);
  };

  const handleStartCallingQueue = () => {
    setIsCallingModeOpen(true);
  };

  // Helper for rendering a single lead card inside the priority queues
  const renderQueueItem = (
    lead: Lead,
    urgencyType: 'overdue' | 'today' | 'fresh' | 'active' | 'hot' | 'payment',
    urgencyText: string
  ) => {
    const cleanPhone = (lead.phone || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hi%20${encodeURIComponent(
      lead.fullName.split(' ')[0]
    )},%20this%20is%20${encodeURIComponent(rep.name)}%20from%20AIValytics.`;

    const nextActionText = lead.nextTask?.taskType
      ? `${lead.nextTask.taskType} (${lead.nextTask.dueDateTime || 'No due time'})`
      : lead.nextFollowUp
      ? `Follow-up: ${lead.nextFollowUp}`
      : 'No next action scheduled';

    const isOverdue = urgencyType === 'overdue';

    return (
      <div
        key={lead.id}
        className="p-3.5 bg-white border border-[#E6E6E3] rounded-lg hover:border-[#3B4BDB]/40 transition-all space-y-3"
      >
        {/* Row 1: Candidate Name + Stage + Temperature */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleOpenLeadPanel(lead)}
                className="font-semibold text-[14px] text-[#1F1F1D] hover:text-[#3B4BDB] text-left truncate cursor-pointer"
              >
                {lead.fullName}
              </button>
              <StageChip stage={lead.crmStage as Stage} />
              <TempTag temperature={lead.leadTemperature} />
            </div>
            <p className="text-[12px] text-[#6B6B66] truncate mt-0.5">
              {lead.programName || 'AI Cohort'} · {lead.currentRole || 'Candidate'} · {lead.currentCompany || lead.city || 'India'}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                urgencyType === 'overdue'
                  ? 'bg-[#FDF2F2] text-[#B42318] border border-[#FECDCA]'
                  : urgencyType === 'hot'
                  ? 'bg-[#FEF3F2] text-[#B42318] border border-[#FDA29B]'
                  : urgencyType === 'fresh'
                  ? 'bg-[#E3EBFF] text-[#1E3FA8] border border-[#BFD5FF]'
                  : urgencyType === 'today'
                  ? 'bg-[#FFF0D6] text-[#8A4B00] border border-[#FFE0A3]'
                  : urgencyType === 'payment'
                  ? 'bg-[#DDF4E4] text-[#17673A] border border-[#C3ECD0]'
                  : 'bg-[#F7F7F5] text-[#1F1F1D] border border-[#E6E6E3]'
              }`}
            >
              {urgencyType === 'overdue' && <AlertCircle className="w-3 h-3" />}
              {urgencyType === 'hot' && <Flame className="w-3 h-3 text-[#B42318]" />}
              {urgencyType === 'fresh' && <Zap className="w-3 h-3 text-[#3B4BDB]" />}
              {urgencyType === 'today' && <Clock className="w-3 h-3" />}
              {urgencyType === 'payment' && <CreditCard className="w-3 h-3 text-[#17673A]" />}
              {urgencyText}
            </span>
          </div>
        </div>

        {/* Row 2: Next Action Banner */}
        <div className="p-2 rounded-md bg-[#F7F7F5] border border-[#E6E6E3] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2 truncate">
            <span className="text-[#6B6B66] shrink-0 font-medium">Next:</span>
            <span
              className={`truncate font-medium ${
                isOverdue ? 'text-[#B42318] font-semibold' : 'text-[#1F1F1D]'
              }`}
            >
              {nextActionText}
            </span>
          </div>
          <span className="text-[11px] text-[#6B6B66] tabular-nums font-mono shrink-0 ml-2">
            Calls: {lead.numberOfCalls || 0}
          </span>
        </div>

        {/* Row 3: Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E6E6E3] text-[12px]">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              onClick={() => {
                logCall(lead.id, 'Connected', 'Direct queue call');
                showToast(`Dialing ${lead.fullName}...`);
              }}
              className="font-medium text-[#1F1F1D] hover:text-[#3B4BDB] flex items-center gap-1 tabular-nums font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-[#3B4BDB]" />
              <span>{formatPhoneNumber(lead.phone)}</span>
            </a>
            {lead.phone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#6B6B66] hover:text-[#17673A] font-medium flex items-center gap-1 ml-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#17673A]" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenQuickLog(lead)}
              className="h-7 text-[12px] px-2.5"
            >
              Log Call
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenLeadPanel(lead)}
              className="h-7 text-[12px] px-2.5 text-[#3B4BDB]"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              My Day
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#EEF0FD] text-[#3B4BDB]">
              {rep.name}
            </span>
            <span className="text-[12px] text-[#6B6B66]">
              {rep.title || 'Admissions Specialist'}
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Daily calling queue, priority follow-ups, and student admissions outreach.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/leads?mode=kanban')}
            className="flex items-center gap-1.5 text-[13px]"
          >
            <Kanban className="w-4 h-4 text-[#6B6B66]" />
            <span>Kanban Pipeline</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => handleStartCallingQueue()}
            className="flex items-center gap-2 text-[13px] font-medium shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Start Calling Mode</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[11px] tabular-nums font-mono">
              {fullPriorityQueue.length}
            </span>
          </Button>
        </div>
      </div>

      {/* Progress & Target Metrics (4 Notion/Airtable style cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Calls */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Today's Calls</span>
            <span className="tabular-nums font-mono text-[11px]">Goal: {dailyTarget}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
              {callsMadeToday}
            </span>
            <span className="text-[13px] text-[#6B6B66] tabular-nums font-mono">
              / {dailyTarget}
            </span>
            <span className="ml-auto text-[12px] font-medium text-[#3B4BDB] tabular-nums font-mono">
              {progressPercent}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#F7F7F5] rounded-full h-1.5 overflow-hidden border border-[#E6E6E3]">
            <div
              className="bg-[#3B4BDB] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Connected Ratio */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Connected Calls</span>
            <span className="tabular-nums font-mono text-[11px]">Connect rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
              {connectedRatio}%
            </span>
            <span className="text-[12px] text-[#6B6B66]">
              ({connectedCallsToday} connected)
            </span>
          </div>
          <div className="text-[12px] text-[#6B6B66] tabular-nums font-mono">
            {notConnectedCallsToday} unanswered / voicemail
          </div>
        </div>

        {/* Metric 3: Value Enrolled Today */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Revenue Enrolled</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              {enrolledLeads.length} paid
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            ₹{enrolledValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            From AI Builder & AI-PM cohorts
          </div>
        </div>

        {/* Metric 4: Overdue Follow-ups */}
        <div
          className={`p-4 rounded-lg border space-y-2 ${
            overdueQueue.length > 0
              ? 'bg-[#FDF2F2] border-[#FECDCA]'
              : 'bg-white border-[#E6E6E3]'
          }`}
        >
          <div className="flex items-center justify-between text-[12px]">
            <span
              className={`font-medium ${
                overdueQueue.length > 0 ? 'text-[#B42318]' : 'text-[#6B6B66]'
              }`}
            >
              Overdue Actions
            </span>
            {overdueQueue.length > 0 ? (
              <span className="text-[11px] font-medium text-[#B42318] bg-white px-1.5 py-0.2 rounded border border-[#FECDCA]">
                Immediate attention
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
                All clear
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-[24px] font-semibold tabular-nums font-mono ${
                overdueQueue.length > 0 ? 'text-[#B42318]' : 'text-[#1F1F1D]'
              }`}
            >
              {overdueQueue.length}
            </span>
            <span
              className={`text-[12px] ${
                overdueQueue.length > 0 ? 'text-[#B42318]' : 'text-[#6B6B66]'
              }`}
            >
              leads past SLA
            </span>
          </div>
          <div
            className={`text-[12px] ${
              overdueQueue.length > 0 ? 'text-[#B42318]' : 'text-[#6B6B66]'
            }`}
          >
            {overdueQueue.length > 0
              ? 'Call these candidates first'
              : 'No missed callbacks today'}
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E6E3] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-[#EEF0FD] text-[#3B4BDB]'
              : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Priority Action Queue</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white text-[11px] tabular-nums font-mono font-semibold border border-[#E6E6E3]">
            {fullPriorityQueue.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'leads'
              ? 'bg-[#EEF0FD] text-[#3B4BDB]'
              : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>All Assigned Leads</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white text-[11px] tabular-nums font-mono font-semibold border border-[#E6E6E3]">
            {repLeads.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calls')}
          className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'calls'
              ? 'bg-[#EEF0FD] text-[#3B4BDB]'
              : 'text-[#6B6B66] hover:bg-[#F3F4F6]'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call Activity Log</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white text-[11px] tabular-nums font-mono font-semibold border border-[#E6E6E3]">
            {repCallActivities.length}
          </span>
        </button>
      </div>

      {/* TAB 1: 5 ACTION QUEUES (Exact Playbook Structure) */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Queue 1: Overdue Follow-ups */}
          <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#B42318]" />
                <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                  1. Overdue Follow-ups ({overdueQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#B42318] bg-[#FDF2F2] border border-[#FECDCA] px-2 py-0.5 rounded-md">
                SLA Breach Risk · Clear First Thing in the Morning
              </span>
            </div>

            {overdueQueue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No overdue callbacks. Great job!"
                description="You are fully caught up on all scheduled callbacks and past-due tasks."
                className="py-6"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overdueQueue.map((lead) =>
                  renderQueueItem(lead, 'overdue', 'Overdue')
                )}
              </div>
            )}
          </div>

          {/* Queue 2: Hot Leads */}
          <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#B42318]" />
                <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                  2. Hot Leads ({hotLeadsQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#B42318] bg-[#FEF3F2] border border-[#FDA29B] px-2 py-0.5 rounded-md">
                High Priority · Strong Fit Score (≥80)
              </span>
            </div>

            {hotLeadsQueue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No hot leads pending in queue"
                description="High-intent and high-fit candidates are currently engaged."
                className="py-6"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hotLeadsQueue.map((lead) =>
                  renderQueueItem(lead, 'hot', 'Hot Lead')
                )}
              </div>
            )}
          </div>

          {/* Queue 3: New Leads */}
          <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#3B4BDB]" />
                <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                  3. New Leads ({newLeadsQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#1E3FA8] bg-[#E3EBFF] border border-[#BFD5FF] px-2 py-0.5 rounded-md">
                Fresh Inbound Submissions · Contact Immediately (&lt;15m SLA)
              </span>
            </div>

            {newLeadsQueue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All fresh leads contacted!"
                description="Every incoming lead assigned to you has been contacted promptly."
                className="py-6"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newLeadsQueue.map((lead) =>
                  renderQueueItem(lead, 'fresh', 'New Form Fill')
                )}
              </div>
            )}
          </div>

          {/* Queue 4: Today's Callbacks */}
          <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#DC8A00]" />
                <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                  4. Today's Callbacks ({todayCallbacksQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#8A4B00] bg-[#FFF0D6] border border-[#FFE0A3] px-2 py-0.5 rounded-md tabular-nums font-mono">
                Dial at Candidate's Requested Time · Due Today ({todayStr})
              </span>
            </div>

            {todayCallbacksQueue.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No scheduled callbacks remaining for today"
                description="Your calendar for today is clear. Check incoming leads or nurture active pipeline."
                className="py-6"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {todayCallbacksQueue.map((lead) =>
                  renderQueueItem(lead, 'today', 'Due Today')
                )}
              </div>
            )}
          </div>

          {/* Queue 5: Payment Pending */}
          <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#17673A]" />
                <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                  5. Payment Pending ({paymentPendingQueue.length})
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] border border-[#C3ECD0] px-2 py-0.5 rounded-md">
                Active Payment Links · Check Completion Status
              </span>
            </div>

            {paymentPendingQueue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No pending payments"
                description="No active payment links awaiting student completion."
                className="py-6"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentPendingQueue.map((lead) =>
                  renderQueueItem(lead, 'payment', 'Payment Pending')
                )}
              </div>
            )}
          </div>

          {/* Other Active Pipeline Nurture (if any) */}
          {otherActiveQueue.length > 0 && (
            <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#6B6B66]" />
                  <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                    6. Active Pipeline & Nurture ({otherActiveQueue.length})
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-[#6B6B66] bg-[#F7F7F5] border border-[#E6E6E3] px-2 py-0.5 rounded-md">
                  Contacted Candidates · In-Discussion
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {otherActiveQueue.map((lead) =>
                  renderQueueItem(lead, 'active', 'In Nurture')
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL ASSIGNED LEADS */}
      {activeTab === 'leads' && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Stage filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                'All',
                'New Lead',
                'Interested',
                'Details Sent on WhatsApp',
                'Qualified',
                'Payment Pending',
                'Converted'
              ].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stage)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
                    stageFilter === stage
                      ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold'
                      : 'bg-[#F7F7F5] text-[#6B6B66] hover:bg-[#F3F4F6]'
                  }`}
                >
                  {stage === 'Details Sent on WhatsApp' ? 'Details Sent' : stage}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-[#6B6B66] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${rep.name.split(' ')[0]}'s leads...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md text-[13px] text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                  <th className="py-2.5 px-3">Lead</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Program</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Next Action</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E3]">
                {filteredAssignedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8">
                      <EmptyState
                        icon={Users}
                        title="No leads found in this view"
                        description="Try adjusting your search query or stage filter."
                        className="py-4"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredAssignedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#F3F4F6] transition-colors h-10"
                    >
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
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-[#1F1F1D] hover:text-[#3B4BDB] flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 text-[#3B4BDB]" />
                            <span>{formatPhoneNumber(lead.phone)}</span>
                          </a>
                        </div>
                      </td>

                      <td className="py-2 px-3 text-[#1F1F1D]">
                        {lead.programName || 'AI Cohort'}
                      </td>

                      <td className="py-2 px-3">
                        <StageChip stage={lead.crmStage as Stage} />
                      </td>

                      <td className="py-2 px-3">
                        <TempTag temperature={lead.leadTemperature} />
                      </td>

                      <td className="py-2 px-3">
                        {lead.nextTask ? (
                          <div className="text-[12px]">
                            <span className="font-medium text-[#1F1F1D]">
                              {lead.nextTask.taskType}
                            </span>
                            <div className="text-[11px] text-[#6B6B66] tabular-nums font-mono">
                              {lead.nextTask.dueDateTime}
                            </div>
                          </div>
                        ) : lead.nextFollowUp ? (
                          <span className="text-[12px] text-[#8A4B00] font-medium tabular-nums font-mono">
                            {lead.nextFollowUp}
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#B42318]">
                            No next action
                          </span>
                        )}
                      </td>

                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenQuickLog(lead)}
                            className="h-7 text-[12px] px-2.5"
                          >
                            Log Call
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenLeadPanel(lead)}
                            className="h-7 text-[12px] px-2.5 text-[#3B4BDB]"
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

      {/* TAB 3: CALL ACTIVITIES LOG */}
      {activeTab === 'calls' && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#1F1F1D] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#3B4BDB]" />
              <span>Outreach Calls Placed by {rep.name}</span>
            </h2>
            <span className="text-[12px] text-[#6B6B66] tabular-nums font-mono">
              Total {repCallActivities.length} calls logged
            </span>
          </div>

          <div className="space-y-2">
            {repCallActivities.length === 0 ? (
              <EmptyState
                icon={PhoneCall}
                title="No calls logged yet"
                description={`No call activities recorded for ${rep.name}. Start Calling Mode or place a call above.`}
                className="py-8"
              />
            ) : (
              repCallActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#3B4BDB] flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[13px] text-[#1F1F1D]">
                        {act.leadName} ({formatPhoneNumber(act.leadPhone)})
                      </h4>
                      <p className="text-[12px] text-[#6B6B66] mt-0.5">{act.notes}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white border border-[#E6E6E3] text-[#1F1F1D]">
                      {act.outcome}
                    </span>
                    <p className="text-[11px] text-[#6B6B66] mt-1 tabular-nums font-mono">
                      {formatRelativeTime(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Slide-over Side Panel (480px, responsive) */}
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

      {/* Calling Mode (Distraction-Free Power Dialer Modal) */}
      {isCallingModeOpen && (
        <CallingMode
          queue={fullPriorityQueue}
          onClose={() => setIsCallingModeOpen(false)}
          onOpenSidePanel={(lead) => {
            setIsCallingModeOpen(false);
            handleOpenLeadPanel(lead);
          }}
        />
      )}

      {/* Quick Log Call & Next Task Modal */}
      {quickLogModalLead && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleQuickLogSubmit}
            className="bg-white rounded-lg max-w-lg w-full p-5 shadow-xl border border-[#E6E6E3] space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
              <div>
                <h3 className="font-semibold text-[14px] text-[#1F1F1D]">
                  Log Call & Schedule Next Action
                </h3>
                <p className="text-[12px] text-[#6B6B66]">
                  Candidate:{' '}
                  <span className="font-medium text-[#1F1F1D]">
                    {quickLogModalLead.fullName}
                  </span>{' '}
                  ({formatPhoneNumber(quickLogModalLead.phone)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickLogModalLead(null)}
                className="text-[#6B6B66] hover:text-[#1F1F1D] p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickLogErrorMessage && (
              <div className="p-3 bg-[#FDF2F2] border border-[#FECDCA] text-[#B42318] rounded-md text-[12px] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{quickLogErrorMessage}</span>
              </div>
            )}

            <div className="space-y-3 text-[13px]">
              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Call Outcome
                </label>
                <select
                  value={quickLogOutcome}
                  onChange={(e) => setQuickLogOutcome(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] bg-white text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
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

              <div>
                <label className="font-medium text-[#1F1F1D] block mb-1 text-[12px]">
                  Discussion Summary & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on questions asked, program track discussion..."
                  value={quickLogNotes}
                  onChange={(e) => setQuickLogNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E6E6E3] rounded-md text-[13px] text-[#1F1F1D] focus:outline-hidden focus:border-[#3B4BDB]"
                />
              </div>

              {!isTerminalOutcome(quickLogOutcome) ? (
                <div className="p-3 rounded-md border border-[#E6E6E3] bg-[#F7F7F5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[12px] text-[#1F1F1D] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#3B4BDB]" />
                      <span>Mandatory Next Task</span>
                    </span>
                    <span className="text-[10px] font-medium text-[#3B4BDB] bg-[#EEF0FD] px-2 py-0.5 rounded-full border border-[#C5CDFA]">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-medium text-[#6B6B66] text-[11px] block mb-0.5">
                        Task Type
                      </label>
                      <select
                        value={nextTaskType}
                        onChange={(e) => setNextTaskType(e.target.value as any)}
                        className="w-full px-2 py-1 bg-white border border-[#E6E6E3] rounded-md text-[12px]"
                      >
                        <option value="Call">Phone Call</option>
                        <option value="WhatsApp">WhatsApp Follow-up</option>
                        <option value="Session">Demo / Briefing Session</option>
                        <option value="Payment Follow-Up">Payment Follow-Up</option>
                        <option value="Review">Application Review</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-[#6B6B66] text-[11px] block mb-0.5">
                        Due Date & Time
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={nextTaskDate}
                          onChange={(e) => setNextTaskDate(e.target.value)}
                          className="w-2/3 px-2 py-1 bg-white border border-[#E6E6E3] rounded-md text-[12px]"
                          required
                        />
                        <input
                          type="time"
                          value={nextTaskTime}
                          onChange={(e) => setNextTaskTime(e.target.value)}
                          className="w-1/3 px-2 py-1 bg-white border border-[#E6E6E3] rounded-md text-[12px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[#6B6B66] text-[11px] block mb-0.5">
                      Next Action Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Follow-up after review of AI Builder replay"
                      value={nextTaskInstructions}
                      onChange={(e) => setNextTaskInstructions(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-[#E6E6E3] rounded-md text-[12px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md text-[12px] text-[#6B6B66]">
                  Lead marked terminal ({quickLogOutcome}). No mandatory follow-up task required.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E6E6E3]">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setQuickLogModalLead(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
              >
                Save Outreach & Task
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
