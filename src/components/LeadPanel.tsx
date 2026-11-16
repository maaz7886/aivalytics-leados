// src/components/LeadPanel.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ActivityRecord } from '../types';
import { useApp } from '../context/AppContext';
import { StageChip } from './ui/StageChip';
import { TempTag } from './ui/TempTag';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import {
  X,
  ArrowLeft,
  ExternalLink,
  Phone,
  MessageSquare,
  FileText,
  CreditCard,
  Clock,
  AlertCircle,
  Check,
  Video,
  UserCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatPhoneNumber, formatRelativeDue, formatRelativeTime } from '../utils/tableFormatters';
import {
  getWorkshopDirectSaleWhatsApp,
  getWebinarInviteWhatsApp,
  getWebinarNoShowReplayWhatsApp,
  getMentorMeetingWithMaazWhatsApp,
  getAiPmFallbackToBuilderWhatsApp
} from '../utils/offeringTemplates';

interface LeadPanelProps {
  leadId: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const LeadPanel: React.FC<LeadPanelProps> = ({
  leadId,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}) => {
  const navigate = useNavigate();
  const {
    allLeads,
    leads,
    updateLead,
    updateLeadStage,
    addLead,
    logCall,
    callActivities,
    updatePaymentState,
    addCallNote,
    currentUser
  } = useApp();

  const leadsPool = allLeads || leads || [];
  const lead = leadsPool.find((l) => l.id === leadId);

  // Loading skeleton state simulation for instant responsiveness
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (leadId) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 80);
      return () => clearTimeout(timer);
    }
  }, [leadId]);

  // Keyboard navigation inside panel: J / K / Up / Down / Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        if (hasNext && onNext) onNext();
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        if (hasPrev && onPrev) onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'timeline' | 'calls' | 'notes' | 'payments'>('timeline');

  // Log Call Drawer State
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [callOutcome, setCallOutcome] = useState('Connected');
  const [callNotes, setCallNotes] = useState('');
  const [mandatoryNextAction, setMandatoryNextAction] = useState('Follow-up Call');
  const [mandatoryDueDate, setMandatoryDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().substring(0, 16).replace('T', ' ')
  );

  // Reschedule / Next Action Modal
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newActionText, setNewActionText] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Inline Editing Fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldPhone, setFieldPhone] = useState('');
  const [fieldEmail, setFieldEmail] = useState('');
  const [fieldCity, setFieldCity] = useState('');
  const [fieldProgram, setFieldProgram] = useState('');

  // Notes tab state
  const [newNoteText, setNewNoteText] = useState('');

  // Sync inline edit fields when lead changes
  useEffect(() => {
    if (lead) {
      setFieldPhone(lead.phone || '');
      setFieldEmail(lead.email || '');
      setFieldCity(lead.city || '');
      setFieldProgram(lead.programName || 'AI-Native Project Management');
    }
  }, [lead]);

  if (!leadId) return null;

  if (loading || !lead) {
    return (
      <div className="flex flex-col h-full p-4 space-y-4 animate-pulse">
        <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
          <div className="h-6 w-48 bg-[#F3F4F6] rounded" />
          <div className="h-6 w-6 bg-[#F3F4F6] rounded" />
        </div>
        <div className="h-10 w-full bg-[#F3F4F6] rounded" />
        <div className="h-24 w-full bg-[#F3F4F6] rounded" />
        <div className="h-40 w-full bg-[#F3F4F6] rounded" />
      </div>
    );
  }

  const nextActionInfo = formatRelativeDue(lead.nextTask?.dueDateTime || lead.nextFollowUp);
  const leadCalls = (callActivities || []).filter((c) => c.leadId === lead.id);
  const leadTimeline: ActivityRecord[] = lead.activities || [];

  // Actions
  const handleQuickLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNotes.trim()) return;

    logCall(
      lead.id,
      callOutcome,
      callNotes,
      {
        action: mandatoryNextAction,
        dueDateTime: mandatoryDueDate,
        notes: callNotes
      }
    );

    setCallNotes('');
    setIsLoggingCall(false);
  };

  const handleMarkActionDone = () => {
    updateLead(lead.id, {
      nextTask: null,
      nextFollowUp: ''
    });
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim() || !newDueDate) return;

    updateLead(lead.id, {
      nextFollowUp: newDueDate,
      nextTask: {
        id: `task-${Date.now()}`,
        leadId: lead.id,
        owner: lead.assignedSalesperson || currentUser.name,
        taskType: 'Call',
        dueDateTime: newDueDate,
        priority: 'High',
        completionStatus: 'Pending',
        notes: newActionText
      }
    });

    setIsRescheduling(false);
    setNewActionText('');
    setNewDueDate('');
  };

  const handleSendPayment = () => {
    const fee = lead.programId === 'ai-pm' ? 49999 : 6999;
    updatePaymentState(lead.id, 'Payment link sent', fee);
    const firstName = lead.fullName.split(' ')[0];
    const waUrl = `https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
      firstName
    )},%20here%20is%20your%20program%20enrollment%20checkout%20link:%20https://aivalytics-leados.vercel.app/checkout/${lead.id}`;
    window.open(waUrl, '_blank');
  };

  const handleSaveInline = (field: 'phone' | 'email' | 'city' | 'program') => {
    if (field === 'phone') updateLead(lead.id, { phone: fieldPhone });
    if (field === 'email') updateLead(lead.id, { email: fieldEmail });
    if (field === 'city') updateLead(lead.id, { city: fieldCity });
    if (field === 'program') updateLead(lead.id, { programName: fieldProgram });
    setEditingField(null);
  };

  const handleAddRepNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addCallNote(lead.id, newNoteText);
    const existing = lead.comments || '';
    const updated = `[${new Date().toLocaleDateString('en-IN')}] ${newNoteText}\n${existing}`;
    updateLead(lead.id, { comments: updated });
    setNewNoteText('');
  };

  const isAiBuilder =
    (lead.programName || '').toLowerCase().includes('builder') ||
    (lead.programName || '').toLowerCase().includes('workshop') ||
    lead.programId === 'workshop-3day';

  const isConverted =
    lead.crmStage === 'Converted' || lead.enrollmentStatus === 'Enrolled';

  const handleOpenAiPmUpsell = () => {
    const upsellLead = {
      ...lead,
      id: `upsell-${Date.now()}-${lead.id}`,
      fullName: `${lead.fullName} (AI-PM Upsell)`,
      programId: 'ai-pm',
      programName: 'AI Native PM Program',
      crmStage: 'Interested',
      source: 'AI Builder Alumni Upsell',
      metaCampaign: 'Workshop_Graduate_Upsell',
      leadTemperature: 'Hot',
      comments: `[Automated Upsell Trigger] Completed AI Native Builder Program (₹6,999). ₹6,999 fee credited toward AI-PM (₹49,999).`,
      nextTask: {
        id: `task-upsell-${Date.now()}`,
        leadId: `upsell-${Date.now()}-${lead.id}`,
        owner: lead.assignedSalesperson || currentUser.name,
        taskType: 'Call',
        dueDateTime: new Date(Date.now() + 86400000).toISOString().substring(0, 16).replace('T', ' '),
        priority: 'Critical',
        completionStatus: 'Pending',
        notes: 'Post-workshop AI-PM upgrade call. Offer ₹6,999 tuition credit toward AI-PM (₹49,999).'
      },
      activities: [
        {
          id: `act-upsell-${Date.now()}`,
          leadId: `upsell-${Date.now()}-${lead.id}`,
          activityType: 'Stage Change',
          outcome: 'AI-PM Upsell Deal Created',
          notes: 'AI Builder Program completed. System opened new AI-PM flagship opportunity.',
          performedBy: currentUser?.name || 'System',
          timestamp: new Date().toISOString()
        }
      ],
      dateCaptured: new Date().toISOString(),
      amountPaid: 0,
      paymentStatus: 'Unpaid',
      enrollmentStatus: 'Not Enrolled'
    };

    addLead(upsellLead as any);
    alert(`AI-PM Upsell Opportunity created for ${lead.fullName}!`);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none text-[#1F1F1D]">
      {/* 1. HEADER (lead name, StageChip, TempTag, Avatar, Open full page, X) */}
      <div className="h-14 px-4 border-b border-[#E6E6E3] flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            aria-label="Back"
            className="md:hidden p-1.5 -ml-1 text-[#6B6B66] hover:text-[#1F1F1D] rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h2 className="text-[17px] font-semibold text-[#1F1F1D] truncate leading-tight">
              {lead.fullName}
            </h2>
          </div>
        </div>

        {/* Right side of header */}
        <div className="flex items-center gap-2 shrink-0">
          <StageChip stage={lead.crmStage} />
          <TempTag temperature={((lead as any).temperature || (lead as any).leadTemperature || 'Warm') as any} />
          <Avatar name={lead.assignedSalesperson || 'Unassigned'} size={24} />

          <button
            onClick={() => navigate(`/lead/${lead.id}`)}
            title="Open full page"
            aria-label="Open full page"
            className="p-1.5 text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6] rounded-[6px]"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close"
            className="p-1.5 text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6] rounded-[6px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
        {/* 2. ACTION BAR (equal-width buttons, 40px) */}
        <div className="grid grid-cols-4 gap-2">
          {/* Call button */}
          <a
            href={`tel:${lead.phone}`}
            className="h-10 flex items-center justify-center gap-1.5 bg-[#3B4BDB] hover:bg-[#2F3CB8] text-white text-xs font-medium rounded-[6px] transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
              lead.fullName.split(' ')[0]
            )},%20reaching%20out%20from%20AIValytics%20regarding%20your%20application.`}
            target="_blank"
            rel="noreferrer"
            className="h-10 flex items-center justify-center gap-1.5 border border-[#E6E6E3] hover:bg-[#F3F4F6] text-[#1F1F1D] text-xs font-medium rounded-[6px] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#059669]" />
            <span>WhatsApp</span>
          </a>

          {/* Log call button */}
          <button
            type="button"
            onClick={() => setIsLoggingCall(!isLoggingCall)}
            className="h-10 flex items-center justify-center gap-1.5 border border-[#E6E6E3] hover:bg-[#F3F4F6] text-[#1F1F1D] text-xs font-medium rounded-[6px] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#3B4BDB]" />
            <span>Log call</span>
          </button>

          {/* Send payment link */}
          <button
            type="button"
            onClick={handleSendPayment}
            className="h-10 flex items-center justify-center gap-1.5 border border-[#E6E6E3] hover:bg-[#F3F4F6] text-[#1F1F1D] text-xs font-medium rounded-[6px] transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#8A4B00]" />
            <span>Payment</span>
          </button>
        </div>

        {/* 2b. LOG CALL FORM DRAWER */}
        {isLoggingCall && (
          <form
            onSubmit={handleQuickLogCall}
            className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[8px] space-y-2.5 text-xs animate-in fade-in duration-150"
          >
            <div className="font-semibold text-[#1F1F1D]">Log Call Outcome</div>

            <div>
              <label className="text-[#6B6B66] text-[11px] block mb-1">Outcome</label>
              <select
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs font-medium outline-none"
              >
                <option value="Connected">Connected</option>
                <option value="Interested">Interested</option>
                <option value="Call later">Call back later</option>
                <option value="No answer">No answer</option>
                <option value="Busy">Busy</option>
                <option value="Invalid number">Wrong / Invalid number</option>
                <option value="Not interested">Not interested</option>
              </select>
            </div>

            <div>
              <label className="text-[#6B6B66] text-[11px] block mb-1">Call Notes *</label>
              <textarea
                required
                rows={2}
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                placeholder="What did you discuss? Key blockers, motivation, next steps..."
                className="w-full p-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs resize-none outline-none focus:border-[#3B4BDB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#6B6B66] text-[11px] block mb-1">Mandatory Next Action *</label>
                <input
                  type="text"
                  required
                  value={mandatoryNextAction}
                  onChange={(e) => setMandatoryNextAction(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[#6B6B66] text-[11px] block mb-1">Due Date *</label>
                <input
                  type="datetime-local"
                  required
                  value={mandatoryDueDate.replace(' ', 'T').slice(0, 16)}
                  onChange={(e) => setMandatoryDueDate(e.target.value.replace('T', ' '))}
                  className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsLoggingCall(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save & Log
              </Button>
            </div>
          </form>
        )}

        {/* 3. NEXT ACTION BOX */}
        {nextActionInfo.isMissing ? (
          // Red empty box
          <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-[8px] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#B42318] font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>No next action set</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRescheduling(true)}
              className="text-xs h-7 text-[#B42318] border-[#FECDCA] hover:bg-white"
            >
              Set next action
            </Button>
          </div>
        ) : (
          // Active next action box (red border if overdue, light accent #EEF0FD otherwise)
          <div
            className={`p-3 rounded-[8px] border text-xs space-y-2 ${
              nextActionInfo.isOverdue
                ? 'bg-[#FEF3F2] border-[#FECDCA]'
                : 'bg-[#EEF0FD] border-[#3B4BDB]/20'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div
                  className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                    nextActionInfo.isOverdue ? 'text-[#B42318]' : 'text-[#3B4BDB]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lead.nextTask?.taskType || 'Follow-up'}</span>
                  <span>·</span>
                  <span className="tabular-nums">{nextActionInfo.text}</span>
                </div>
                <p className="text-[#1F1F1D] text-xs mt-1 font-medium">
                  {lead.nextTask?.notes || lead.nextFollowUp}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="secondary" size="sm" onClick={handleMarkActionDone} className="h-7 text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Mark done
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsRescheduling(true)} className="h-7 text-xs">
                  Reschedule
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Drawer */}
        {isRescheduling && (
          <form
            onSubmit={handleSaveReschedule}
            className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[8px] space-y-2 text-xs"
          >
            <div className="font-semibold text-[#1F1F1D]">Set / Reschedule Next Action</div>
            <input
              type="text"
              required
              placeholder="e.g. Call to discuss 3-month EMI plan"
              value={newActionText}
              onChange={(e) => setNewActionText(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
            />
            <input
              type="datetime-local"
              required
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsRescheduling(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Action
              </Button>
            </div>
          </form>
        )}

        {/* SALES FUNNEL & CONVERSION PLAYBOOK (AI Builder vs AI-PM) */}
        <div className="border border-[#E6E6E3] rounded-[8px] p-3 text-xs space-y-2.5 bg-[#F7F7F5]/50">
          <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-[#1F1F1D]">
              <Sparkles className="w-3.5 h-3.5 text-[#3B4BDB]" />
              <span>
                {isAiBuilder ? 'AI Builder Funnel (₹6,999)' : 'AI-PM 4-Attempt Funnel (₹49,999)'}
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#6B6B66]">
              {isConverted ? 'Converted ✅' : 'Active Funnel'}
            </span>
          </div>

          {/* AI BUILDER PLAYBOOK */}
          {isAiBuilder ? (
            <div className="space-y-2">
              {!isConverted ? (
                <>
                  <div className="p-2 bg-white border border-[#E6E6E3] rounded-[6px] space-y-1.5">
                    <div className="font-medium text-[#1F1F1D] flex items-center justify-between">
                      <span>1. Webinar Invitation</span>
                      <span className="text-[10px] text-[#6B6B66]">Free Pass</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          getWebinarInviteWhatsApp(lead.fullName)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-[#EEF0FD] hover:bg-[#EEF0FD]/80 text-[#3B4BDB] rounded font-medium text-[11px] flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Send Webinar Pass</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => updateLeadStage(lead.id, 'Demo Session Scheduled')}
                        className="px-2 py-1 bg-[#F7F7F5] hover:bg-[#F3F4F6] border border-[#E6E6E3] text-[#1F1F1D] rounded text-[11px]"
                      >
                        Mark Registered
                      </button>
                    </div>
                  </div>

                  <div className="p-2 bg-white border border-[#E6E6E3] rounded-[6px] space-y-1.5">
                    <div className="font-medium text-[#1F1F1D] flex items-center justify-between">
                      <span>2. Webinar Follow-up & Close</span>
                      <span className="text-[10px] font-semibold text-[#17673A]">₹6,999</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Attended -> Paid */}
                      <a
                        href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          getWorkshopDirectSaleWhatsApp(lead.fullName)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-[#DDF4E4] hover:bg-[#DDF4E4]/80 text-[#17673A] rounded font-medium text-[11px] flex items-center gap-1"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Send ₹6,999 Checkout</span>
                      </a>

                      {/* No-show 2nd chance */}
                      <a
                        href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          getWebinarNoShowReplayWhatsApp(lead.fullName)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-[#FFF0D6] hover:bg-[#FFF0D6]/80 text-[#8A4B00] rounded font-medium text-[11px] flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>Replay + 2nd Chance</span>
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                /* Converted -> Upsell trigger */
                <div className="p-2.5 bg-[#DDF4E4]/60 border border-[#17673A]/20 rounded-[6px] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#17673A]">
                    <span>AI Builder Enrolled & Paid ✅</span>
                    <span className="tabular-nums">₹6,999</span>
                  </div>
                  <p className="text-[11px] text-[#17673A]/90">
                    When candidate completes the workshop, trigger their AI-PM upsell opportunity.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAiPmUpsell}
                    className="w-full h-7 text-xs bg-[#17673A] hover:bg-[#13532e]"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    <span>Open AI-PM Upsell Deal</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* AI-PM 4 ATTEMPTS PLAYBOOK */
            <div className="space-y-1.5">
              {/* Attempt 1: Sell on the call */}
              <div className="p-2 bg-white border border-[#E6E6E3] rounded-[6px] flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-[#1F1F1D]">Attempt 1: Sell on the Call</div>
                  <div className="text-[10px] text-[#6B6B66]">Pitch ₹49,999 (No-cost EMI from ₹8,333/mo)</div>
                </div>
                <button
                  type="button"
                  onClick={handleSendPayment}
                  className="px-2 py-1 bg-[#EEF0FD] hover:bg-[#EEF0FD]/80 text-[#3B4BDB] font-semibold text-[11px] rounded"
                >
                  Send ₹49k Link
                </button>
              </div>

              {/* Attempt 2: Mentor meeting with Maaz */}
              <div className="p-2 bg-white border border-[#E6E6E3] rounded-[6px] flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-[#1F1F1D]">Attempt 2: 1-on-1 with Maaz</div>
                  <div className="text-[10px] text-[#6B6B66]">15-min strategy & portfolio roadmap</div>
                </div>
                <a
                  href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                    getMentorMeetingWithMaazWhatsApp(lead.fullName)
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => updateLeadStage(lead.id, 'Mentor Session Scheduled')}
                  className="px-2 py-1 bg-[#EFE6FF] hover:bg-[#EFE6FF]/80 text-[#5B2BA8] font-semibold text-[11px] rounded flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>Book Maaz</span>
                </a>
              </div>

              {/* Attempt 3: 90-min Zoom webinar */}
              <div className="p-2 bg-white border border-[#E6E6E3] rounded-[6px] flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-[#1F1F1D]">Attempt 3: 90-min Zoom Masterclass</div>
                  <div className="text-[10px] text-[#6B6B66]">Live agent defense & curriculum walkthrough</div>
                </div>
                <a
                  href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                    getWebinarInviteWhatsApp(
                      lead.fullName,
                      'Upcoming Saturday • 8:00 PM IST',
                      'https://zoom.us/j/aiv-90min-masterclass'
                    )
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => updateLeadStage(lead.id, 'Demo Session Scheduled')}
                  className="px-2 py-1 bg-[#FFF0D6] hover:bg-[#FFF0D6]/80 text-[#8A4B00] font-semibold text-[11px] rounded flex items-center gap-1"
                >
                  <Video className="w-3 h-3" />
                  <span>Zoom Pass</span>
                </a>
              </div>

              {/* Attempt 4: Offer AI Builder Fallback (₹6,999) */}
              <div className="p-2 bg-white border border-[#E6E6E3] rounded-[6px] flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-[#1F1F1D]">Attempt 4: Offer AI Builder (₹6,999)</div>
                  <div className="text-[10px] text-[#6B6B66]">Downsell to weekend sprint + 100% credit</div>
                </div>
                <a
                  href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                    getAiPmFallbackToBuilderWhatsApp(lead.fullName)
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 bg-[#DDF4E4] hover:bg-[#DDF4E4]/80 text-[#17673A] font-semibold text-[11px] rounded flex items-center gap-1"
                >
                  <span>Offer ₹6,999</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 4. DETAILS (Two-column key-value list with inline edit for Phone, Email, Program, City) */}
        <div className="border border-[#E6E6E3] rounded-[8px] p-3 text-xs space-y-2.5">
          <div className="font-semibold text-[#1F1F1D] text-[13px] border-b border-[#E6E6E3] pb-1.5">
            Lead Details
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {/* Phone (Inline editable) */}
            <div>
              <div className="text-[11px] text-[#6B6B66]">Phone</div>
              {editingField === 'phone' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    value={fieldPhone}
                    onChange={(e) => setFieldPhone(e.target.value)}
                    className="h-6 px-1.5 w-full bg-white border border-[#3B4BDB] rounded text-xs"
                  />
                  <button onClick={() => handleSaveInline('phone')} className="text-[#3B4BDB]">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setEditingField('phone')}
                  className="font-medium text-[#1F1F1D] tabular-nums hover:text-[#3B4BDB] cursor-pointer"
                  title="Click to edit"
                >
                  {formatPhoneNumber(lead.phone)}
                </div>
              )}
            </div>

            {/* Email (Inline editable) */}
            <div>
              <div className="text-[11px] text-[#6B6B66]">Email</div>
              {editingField === 'email' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="email"
                    value={fieldEmail}
                    onChange={(e) => setFieldEmail(e.target.value)}
                    className="h-6 px-1.5 w-full bg-white border border-[#3B4BDB] rounded text-xs"
                  />
                  <button onClick={() => handleSaveInline('email')} className="text-[#3B4BDB]">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setEditingField('email')}
                  className="font-medium text-[#1F1F1D] truncate hover:text-[#3B4BDB] cursor-pointer"
                  title="Click to edit"
                >
                  {lead.email || '—'}
                </div>
              )}
            </div>

            {/* Program (Inline editable) */}
            <div>
              <div className="text-[11px] text-[#6B6B66]">Program</div>
              {editingField === 'program' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <select
                    value={fieldProgram}
                    onChange={(e) => setFieldProgram(e.target.value)}
                    className="h-6 px-1 w-full bg-white border border-[#3B4BDB] rounded text-xs"
                  >
                    <option value="3-Day AI Builder Workshop">Workshop</option>
                    <option value="AI-Native Project Management">AI-PM</option>
                  </select>
                  <button onClick={() => handleSaveInline('program')} className="text-[#3B4BDB]">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setEditingField('program')}
                  className="font-medium text-[#1F1F1D] truncate hover:text-[#3B4BDB] cursor-pointer"
                  title="Click to edit"
                >
                  {lead.programName || 'AI-PM'}
                </div>
              )}
            </div>

            {/* City (Inline editable) */}
            <div>
              <div className="text-[11px] text-[#6B6B66]">City</div>
              {editingField === 'city' ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <input
                    type="text"
                    value={fieldCity}
                    onChange={(e) => setFieldCity(e.target.value)}
                    className="h-6 px-1.5 w-full bg-white border border-[#3B4BDB] rounded text-xs"
                  />
                  <button onClick={() => handleSaveInline('city')} className="text-[#3B4BDB]">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setEditingField('city')}
                  className="font-medium text-[#1F1F1D] truncate hover:text-[#3B4BDB] cursor-pointer"
                  title="Click to edit"
                >
                  {lead.city || '—'}
                </div>
              )}
            </div>

            {/* Read-only details */}
            <div>
              <div className="text-[11px] text-[#6B6B66]">Source</div>
              <div className="font-medium text-[#1F1F1D] truncate">{lead.source || 'Meta Ads'}</div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">Campaign</div>
              <div className="font-medium text-[#1F1F1D] truncate" title={lead.metaCampaign}>
                {lead.metaCampaign || '—'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">Ad Set</div>
              <div className="font-medium text-[#1F1F1D] truncate" title={lead.metaAdSet}>
                {lead.metaAdSet || '—'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">Ad</div>
              <div className="font-medium text-[#1F1F1D] truncate" title={lead.metaAd}>
                {lead.metaAd || '—'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">Created</div>
              <div className="font-medium text-[#1F1F1D] tabular-nums">
                {lead.dateCaptured ? new Date(lead.dateCaptured).toLocaleDateString('en-IN') : '—'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">Assigned at</div>
              <div className="font-medium text-[#1F1F1D] tabular-nums">
                {lead.assignedAt ? formatRelativeTime(lead.assignedAt) : '—'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">First call at</div>
              <div className="font-medium text-[#1F1F1D] tabular-nums">
                {lead.firstCallAt ? formatRelativeTime(lead.firstCallAt) : 'Not called yet'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">Calls made</div>
              <div className="font-medium text-[#1F1F1D] tabular-nums">{lead.numberOfCalls || 0}</div>
            </div>

            <div>
              <div className="text-[11px] text-[#6B6B66]">WhatsApp touches</div>
              <div className="font-medium text-[#1F1F1D] tabular-nums">
                {lead.outreachCadence?.whatsappAttempted || lead.numberOfFollowUps || 0}
              </div>
            </div>
          </div>
        </div>

        {/* 5. FORM ANSWERS (Qualifying Questions from Meta Ads) */}
        <div className="border border-[#E6E6E3] rounded-[8px] p-3 text-xs space-y-2.5">
          <div className="font-semibold text-[#1F1F1D] text-[13px] border-b border-[#E6E6E3] pb-1.5">
            Meta Form Answers
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[11px] text-[#6B6B66]">Experience:</span>
              <p className="font-medium text-[#1F1F1D]">{lead.yearsOfExperience || lead.experience || '5–8 years'}</p>
            </div>
            <div>
              <span className="text-[11px] text-[#6B6B66]">Current Role & Company:</span>
              <p className="font-medium text-[#1F1F1D]">
                {lead.currentRole || 'Product Manager'} at {lead.currentCompany || 'Tech Corp'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[#6B6B66]">Primary Goal:</span>
              <p className="font-medium text-[#1F1F1D]">
                {lead.primaryGoal || lead.goal || 'Upskill in current role and boost earning potential'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[#6B6B66]">Main Blocker:</span>
              <p className="font-medium text-[#1F1F1D]">
                {lead.mainChallenge || lead.blocker || 'Traditional PM workflows are becoming slow and manual'}
              </p>
            </div>
          </div>
        </div>

        {/* 6. TABS (Timeline | Calls | Notes | Payments) */}
        <div className="border border-[#E6E6E3] rounded-[8px] overflow-hidden">
          {/* Tab buttons */}
          <div className="flex border-b border-[#E6E6E3] bg-[#F7F7F5]">
            {[
              { id: 'timeline', label: 'Timeline' },
              { id: 'calls', label: `Calls (${leadCalls.length})` },
              { id: 'notes', label: 'Notes' },
              { id: 'payments', label: 'Payments' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#3B4BDB] text-[#3B4BDB] bg-white font-semibold'
                    : 'border-transparent text-[#6B6B66] hover:text-[#1F1F1D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-3">
            {/* TAB: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-3">
                {leadTimeline.length === 0 ? (
                  <div className="text-xs text-[#6B6B66] py-3 text-center">
                    Ingested from {lead.source || 'Meta Ads'}. No manual timeline entries yet.
                  </div>
                ) : (
                  <div className="relative pl-4 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E6E6E3]">
                    {leadTimeline.map((item) => (
                      <div key={item.id} className="relative flex items-start justify-between text-xs gap-2">
                        <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#3B4BDB] ring-4 ring-white" />
                        <div>
                          <span className="font-semibold text-[#1F1F1D]">{item.activityType}</span>
                          <span className="text-[#6B6B66]"> · {item.outcome}</span>
                          {item.notes && <p className="text-[11px] text-[#6B6B66] mt-0.5">{item.notes}</p>}
                        </div>
                        <span className="text-[10px] text-[#6B6B66] tabular-nums shrink-0">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CALLS */}
            {activeTab === 'calls' && (
              <div className="space-y-2">
                {leadCalls.length === 0 ? (
                  <div className="text-xs text-[#6B6B66] py-3 text-center">
                    No calls logged yet. Use the "Log call" button above.
                  </div>
                ) : (
                  <div className="border border-[#E6E6E3] rounded-[6px] overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[11px] text-[#6B6B66]">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Outcome</th>
                          <th className="p-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E6E3]">
                        {leadCalls.map((c) => (
                          <tr key={c.id}>
                            <td className="p-2 tabular-nums text-[#6B6B66] whitespace-nowrap">
                              {formatRelativeTime(c.timestamp)}
                            </td>
                            <td className="p-2 font-medium">{c.outcome}</td>
                            <td className="p-2 text-[#6B6B66] truncate max-w-[140px]">{c.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-3">
                <form onSubmit={handleAddRepNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Write a private note..."
                    className="w-full p-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs resize-none outline-none focus:border-[#3B4BDB]"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary" size="sm">
                      Add note
                    </Button>
                  </div>
                </form>

                <div className="p-2.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[6px] text-xs whitespace-pre-wrap text-[#1F1F1D]">
                  {lead.comments || 'No rep notes added yet.'}
                </div>
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[6px]">
                  <div>
                    <div className="font-semibold text-[#1F1F1D]">
                      {lead.programId === 'ai-pm' ? 'AI-Native PM' : 'AI Builder Workshop'}
                    </div>
                    <div className="text-[11px] text-[#6B6B66] tabular-nums">
                      Tuition: {lead.programId === 'ai-pm' ? '₹49,999' : '₹6,999'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-[4px] font-semibold text-[11px] ${
                        lead.paymentStatus === 'Paid'
                          ? 'bg-[#DDF4E4] text-[#17673A]'
                          : lead.paymentStatus === 'Partial'
                          ? 'bg-[#FFE6D9] text-[#9A3A0B]'
                          : 'bg-[#EEEEEC] text-[#3D3D3A]'
                      }`}
                    >
                      {lead.paymentStatus || 'Unpaid'}
                    </span>
                    <div className="text-[10px] text-[#6B6B66] mt-0.5">
                      {lead.paymentState || 'No request'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="secondary" size="sm" onClick={handleSendPayment}>
                    Send payment link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
