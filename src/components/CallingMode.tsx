// src/components/CallingMode.tsx
import React, { useState, useEffect } from 'react';
import type { Lead } from '../types';
import { useApp } from '../context/AppContext';
import { StageChip } from './ui/StageChip';
import { TempTag } from './ui/TempTag';
import { Button } from './ui/Button';
import {
  Phone,
  MessageSquare,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatPhoneNumber, formatRelativeDue } from '../utils/tableFormatters';
import {
  getWorkshopDirectSaleWhatsApp,
  getWebinarInviteWhatsApp,
  getWebinarNoShowReplayWhatsApp,
  getMentorMeetingWithMaazWhatsApp,
  getAiPmFallbackToBuilderWhatsApp
} from '../utils/offeringTemplates';
import { LostReasonModal } from './LostReasonModal';

interface CallingModeProps {
  queue: Lead[];
  onClose: () => void;
  onOpenSidePanel?: (lead: Lead) => void;
}

export const CallingMode: React.FC<CallingModeProps> = ({
  queue,
  onClose,
  onOpenSidePanel
}) => {
  const {
    logCall,
    updateLead,
    updateLeadStage,
    updatePaymentState,
    addLead,
    currentUser
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentLead = queue[currentIndex] || null;

  // Post-call log state
  const [outcome, setOutcome] = useState('Connected');
  const [callNotes, setCallNotes] = useState('');
  const [mandatoryAction, setMandatoryAction] = useState('Follow-up Call');
  const [mandatoryDueDate, setMandatoryDueDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().substring(0, 16).replace('T', ' ');
  });

  // Lost modal state
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);

  // Keyboard navigation: Space to call, N for next, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'n' || e.key === 'N') {
        if (currentIndex < queue.length - 1) {
          handleNextLead();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, queue.length, onClose]);

  // Reset log form when switching lead
  useEffect(() => {
    setOutcome('Connected');
    setCallNotes('');
    setMandatoryAction('Follow-up Call');
    setMandatoryDueDate(
      new Date(Date.now() + 86400000).toISOString().substring(0, 16).replace('T', ' ')
    );
  }, [currentIndex]);

  if (!currentLead) {
    return (
      <div className="fixed inset-0 z-50 bg-[#1F1F1D]/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white border border-[#E6E6E3] rounded-[8px] p-6 max-w-sm w-full text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-[#17673A] mx-auto" />
          <h3 className="text-base font-semibold text-[#1F1F1D]">Queue Completed!</h3>
          <p className="text-xs text-[#6B6B66]">
            Great job! You have called and logged all leads in this action queue.
          </p>
          <Button variant="primary" onClick={onClose} className="w-full">
            Return to My Day
          </Button>
        </div>
      </div>
    );
  }

  const isAiBuilder =
    (currentLead.programName || '').toLowerCase().includes('builder') ||
    (currentLead.programName || '').toLowerCase().includes('workshop') ||
    currentLead.programId === 'workshop-3day';

  const isConverted =
    currentLead.crmStage === 'Converted' || currentLead.enrollmentStatus === 'Enrolled';

  const dueInfo = formatRelativeDue(currentLead.nextTask?.dueDateTime || currentLead.nextFollowUp);

  const handleNextLead = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevLead = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Save log and advance
  const handleSaveAndAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNotes.trim()) return;

    logCall(
      currentLead.id,
      outcome,
      callNotes,
      {
        action: mandatoryAction,
        dueDateTime: mandatoryDueDate,
        notes: callNotes
      }
    );

    handleNextLead();
  };

  const handleSendPayment = () => {
    const fee = isAiBuilder ? 6999 : 49999;
    updatePaymentState(currentLead.id, 'Payment link sent', fee);
    const firstName = currentLead.fullName.split(' ')[0];
    const waUrl = `https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
      firstName
    )},%20here%20is%20your%20program%20enrollment%20checkout%20link:%20https://aivalytics-leados.vercel.app/checkout/${currentLead.id}`;
    window.open(waUrl, '_blank');
  };

  const handleOpenAiPmUpsell = () => {
    const upsellLead = {
      ...currentLead,
      id: `upsell-${Date.now()}-${currentLead.id}`,
      fullName: `${currentLead.fullName} (AI-PM Upsell)`,
      programId: 'ai-pm',
      programName: 'AI Native PM Program',
      crmStage: 'Interested',
      source: 'AI Builder Alumni Upsell',
      metaCampaign: 'Workshop_Graduate_Upsell',
      leadTemperature: 'Hot',
      comments: `[Automated Upsell Trigger] Completed AI Native Builder Program (₹6,999). ₹6,999 fee credited toward AI-PM (₹49,999).`,
      nextTask: {
        id: `task-upsell-${Date.now()}`,
        leadId: `upsell-${Date.now()}-${currentLead.id}`,
        owner: currentLead.assignedSalesperson || currentUser.name,
        taskType: 'Call',
        dueDateTime: new Date(Date.now() + 86400000).toISOString().substring(0, 16).replace('T', ' '),
        priority: 'Critical',
        completionStatus: 'Pending',
        notes: 'Post-workshop AI-PM upgrade call. Offer ₹6,999 tuition credit toward AI-PM (₹49,999).'
      },
      activities: [
        {
          id: `act-upsell-${Date.now()}`,
          leadId: `upsell-${Date.now()}-${currentLead.id}`,
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
    alert(`AI-PM Upsell Opportunity created for ${currentLead.fullName}!`);
  };

  const handleConfirmLost = (reason: string, notes?: string) => {
    updateLead(currentLead.id, {
      crmStage: 'Lost',
      objection: reason,
      comments:
        (currentLead.comments ? `${currentLead.comments}\n` : '') +
        `[Lost Reason: ${reason}] ${notes || ''}`
    });
    setIsLostModalOpen(false);
    handleNextLead();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1F1F1D]/70 backdrop-blur-[2px] flex items-center justify-center p-3 select-none text-[#1F1F1D]">
      <div className="w-full max-w-5xl h-[92vh] bg-white border border-[#E6E6E3] rounded-[8px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* TOP BAR: Queue counter + Navigation + Exit */}
        <div className="h-13 px-4 border-b border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F1F1D]">
              <Phone className="w-4 h-4 text-[#3B4BDB]" />
              <span>Calling Mode</span>
            </div>
            <span className="text-[#6B6B66] text-xs">|</span>
            <span className="text-xs font-medium text-[#6B6B66] tabular-nums">
              Lead <strong className="text-[#1F1F1D]">{currentIndex + 1}</strong> of {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevLead}
              disabled={currentIndex === 0}
              className="p-1 text-[#6B6B66] hover:text-[#1F1F1D] disabled:opacity-30 rounded hover:bg-white"
              title="Previous lead"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextLead}
              disabled={currentIndex === queue.length - 1}
              className="p-1 text-[#6B6B66] hover:text-[#1F1F1D] disabled:opacity-30 rounded hover:bg-white"
              title="Skip / Next lead (N)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-[#6B6B66] hover:text-[#1F1F1D] rounded hover:bg-white ml-2"
              title="Exit Calling Mode (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-COLUMN MAIN BODY */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-x divide-[#E6E6E3]">
          {/* LEFT COLUMN: Candidate Profile & Meta Answers */}
          <div className="overflow-y-auto p-5 space-y-4 bg-white">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StageChip stage={currentLead.crmStage} />
                <TempTag
                  temperature={
                    ((currentLead as any).temperature ||
                      (currentLead as any).leadTemperature ||
                      'Warm') as any
                  }
                />
              </div>

              <h2 className="text-2xl font-semibold text-[#1F1F1D] leading-tight">
                {currentLead.fullName}
              </h2>
              <div className="text-xs text-[#6B6B66] mt-0.5">
                {currentLead.currentRole || 'Product Manager'} at{' '}
                {currentLead.currentCompany || 'Tech Corp'}
              </div>
            </div>

            {/* BIG CALL BUTTON */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${currentLead.phone}`}
                className="h-12 flex items-center justify-center gap-2 bg-[#3B4BDB] hover:bg-[#2F3CB8] text-white text-sm font-semibold rounded-[6px] shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call ({formatPhoneNumber(currentLead.phone)})</span>
              </a>

              <a
                href={`https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
                  currentLead.fullName.split(' ')[0]
                )},%20reaching%20out%20from%20AIValytics.`}
                target="_blank"
                rel="noreferrer"
                className="h-12 flex items-center justify-center gap-2 border border-[#E6E6E3] hover:bg-[#F3F4F6] text-[#1F1F1D] text-sm font-medium rounded-[6px] transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#059669]" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Next Action Box */}
            <div
              className={`p-3 rounded-[6px] border text-xs space-y-1 ${
                dueInfo.isOverdue
                  ? 'bg-[#FEF3F2] border-[#FECDCA]'
                  : 'bg-[#EEF0FD] border-[#3B4BDB]/20'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={dueInfo.isOverdue ? 'text-[#B42318]' : 'text-[#3B4BDB]'}>
                  Scheduled Task: {currentLead.nextTask?.taskType || 'Call'}
                </span>
                <span
                  className={`tabular-nums ${
                    dueInfo.isOverdue ? 'text-[#B42318] font-bold' : 'text-[#6B6B66]'
                  }`}
                >
                  {dueInfo.text}
                </span>
              </div>
              <p className="text-[#1F1F1D] text-xs font-medium">
                {currentLead.nextTask?.notes || currentLead.nextFollowUp || 'No specific notes'}
              </p>
            </div>

            {/* Meta Qualification Form Answers */}
            <div className="border border-[#E6E6E3] rounded-[6px] p-3 text-xs space-y-2">
              <div className="font-semibold text-[#1F1F1D] border-b border-[#E6E6E3] pb-1">
                Qualification Responses (Meta Ad Form)
              </div>
              <div>
                <span className="text-[11px] text-[#6B6B66]">Program Interested In:</span>
                <div className="font-medium text-[#1F1F1D]">{currentLead.programName}</div>
              </div>
              <div>
                <span className="text-[11px] text-[#6B6B66]">Experience Level:</span>
                <div className="font-medium text-[#1F1F1D]">
                  {currentLead.yearsOfExperience || currentLead.experience || '5–8 years'}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-[#6B6B66]">Primary Career Goal:</span>
                <div className="font-medium text-[#1F1F1D]">
                  {currentLead.primaryGoal ||
                    currentLead.goal ||
                    'Upskill and transition into AI product role'}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-[#6B6B66]">Key Blocker / Challenge:</span>
                <div className="font-medium text-[#1F1F1D]">
                  {currentLead.mainChallenge ||
                    currentLead.blocker ||
                    'Needs practical hands-on agent orchestration experience'}
                </div>
              </div>
            </div>

            {/* Open full side panel trigger */}
            {onOpenSidePanel && (
              <button
                type="button"
                onClick={() => onOpenSidePanel(currentLead)}
                className="text-xs text-[#3B4BDB] hover:underline font-medium block"
              >
                View full candidate history & notes in side panel →
              </button>
            )}
          </div>

          {/* RIGHT COLUMN: Sales Funnel Playbook + Post-Call Logger */}
          <div className="overflow-y-auto p-5 space-y-4 bg-[#F7F7F5]/40 flex flex-col justify-between">
            <div className="space-y-4">
              {/* PLAYBOOK CARD */}
              <div className="border border-[#E6E6E3] rounded-[8px] p-3.5 bg-white text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[#1F1F1D]">
                    <Sparkles className="w-3.5 h-3.5 text-[#3B4BDB]" />
                    <span>
                      {isAiBuilder
                        ? 'AI Builder Sales Track (₹6,999)'
                        : 'AI-PM 4-Attempt Sales Track (₹49,999)'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#17673A]">
                    {isConverted ? 'Enrolled ✅' : 'Active Track'}
                  </span>
                </div>

                {isAiBuilder ? (
                  /* AI BUILDER OPTIONS */
                  <div className="space-y-2">
                    {!isConverted ? (
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            getWebinarInviteWhatsApp(currentLead.fullName)
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => updateLeadStage(currentLead.id, 'Demo Session Scheduled')}
                          className="p-2 border border-[#E6E6E3] hover:bg-[#F3F4F6] rounded-[6px] text-left block"
                        >
                          <div className="font-semibold text-[#3B4BDB]">1. Webinar Pass</div>
                          <div className="text-[10px] text-[#6B6B66]">Send free masterclass link</div>
                        </a>

                        <a
                          href={`https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            getWorkshopDirectSaleWhatsApp(currentLead.fullName)
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-[#DDF4E4] hover:bg-[#DDF4E4]/80 text-[#17673A] rounded-[6px] text-left block font-medium"
                        >
                          <div className="font-semibold">2. Sell on Call</div>
                          <div className="text-[10px]">Send ₹6,999 checkout link</div>
                        </a>

                        <a
                          href={`https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            getWebinarNoShowReplayWhatsApp(currentLead.fullName)
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 border border-[#E6E6E3] hover:bg-[#F3F4F6] rounded-[6px] text-left block col-span-2"
                        >
                          <div className="font-semibold text-[#8A4B00]">3. No-Show Replay (2nd Chance)</div>
                          <div className="text-[10px] text-[#6B6B66]">Send replay access + upcoming pass</div>
                        </a>
                      </div>
                    ) : (
                      /* Converted -> Upsell */
                      <div className="p-2.5 bg-[#DDF4E4] border border-[#17673A]/20 rounded-[6px] space-y-1.5">
                        <div className="font-semibold text-[#17673A] flex items-center justify-between">
                          <span>AI Builder Enrolled ✅</span>
                          <span>₹6,999</span>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleOpenAiPmUpsell}
                          className="w-full bg-[#17673A] hover:bg-[#13532e] text-xs h-8"
                        >
                          Trigger AI-PM Upsell Opportunity
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* AI-PM 4 ATTEMPTS */
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 border border-[#E6E6E3] rounded-[6px] bg-white">
                      <div>
                        <div className="font-semibold text-[#1F1F1D]">Attempt 1: Sell on Call</div>
                        <div className="text-[10px] text-[#6B6B66]">₹49,999 (No-cost EMI ₹8,333/mo)</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendPayment}
                        className="px-2 py-1 bg-[#EEF0FD] text-[#3B4BDB] font-semibold rounded text-[11px]"
                      >
                        Send ₹49k Link
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 border border-[#E6E6E3] rounded-[6px] bg-white">
                      <div>
                        <div className="font-semibold text-[#1F1F1D]">Attempt 2: 1-on-1 with Maaz</div>
                        <div className="text-[10px] text-[#6B6B66]">15-min strategy session</div>
                      </div>
                      <a
                        href={`https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          getMentorMeetingWithMaazWhatsApp(currentLead.fullName)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => updateLeadStage(currentLead.id, 'Mentor Session Scheduled')}
                        className="px-2 py-1 bg-[#EFE6FF] text-[#5B2BA8] font-semibold rounded text-[11px]"
                      >
                        Book Maaz
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 border border-[#E6E6E3] rounded-[6px] bg-white">
                      <div>
                        <div className="font-semibold text-[#1F1F1D]">Attempt 3: Zoom Masterclass</div>
                        <div className="text-[10px] text-[#6B6B66]">90-min curriculum walkthrough</div>
                      </div>
                      <a
                        href={`https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          getWebinarInviteWhatsApp(
                            currentLead.fullName,
                            'Upcoming Saturday • 8:00 PM IST',
                            'https://zoom.us/j/aiv-90min-masterclass'
                          )
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => updateLeadStage(currentLead.id, 'Demo Session Scheduled')}
                        className="px-2 py-1 bg-[#FFF0D6] text-[#8A4B00] font-semibold rounded text-[11px]"
                      >
                        Zoom Pass
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2 border border-[#E6E6E3] rounded-[6px] bg-white">
                      <div>
                        <div className="font-semibold text-[#1F1F1D]">Attempt 4: Offer AI Builder</div>
                        <div className="text-[10px] text-[#6B6B66]">₹6,999 weekend sprint with 100% credit</div>
                      </div>
                      <a
                        href={`https://wa.me/${(currentLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                          getAiPmFallbackToBuilderWhatsApp(currentLead.fullName)
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 bg-[#DDF4E4] text-[#17673A] font-semibold rounded text-[11px]"
                      >
                        Offer ₹6,999
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* POST-CALL LOGGING FORM */}
              <form onSubmit={handleSaveAndAdvance} className="border border-[#E6E6E3] rounded-[8px] p-3.5 bg-white text-xs space-y-3">
                <div className="font-semibold text-[#1F1F1D] border-b border-[#E6E6E3] pb-1.5">
                  Post-Call Mandatory Logging
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#6B6B66] block mb-1">
                      Call Outcome *
                    </label>
                    <select
                      value={outcome}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOutcome(val);
                        if (val === 'Not interested') {
                          setIsLostModalOpen(true);
                        }
                      }}
                      className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                    >
                      <option value="Connected">Connected</option>
                      <option value="Interested">Interested</option>
                      <option value="Call later">Call later / Callback</option>
                      <option value="No answer">No answer</option>
                      <option value="Busy">Busy</option>
                      <option value="Invalid number">Invalid number</option>
                      <option value="Not interested">Not interested (Lost)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-[#6B6B66] block mb-1">
                      Next Action *
                    </label>
                    <input
                      type="text"
                      required
                      value={mandatoryAction}
                      onChange={(e) => setMandatoryAction(e.target.value)}
                      placeholder="e.g. Follow-up on payment"
                      className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#6B6B66] block mb-1">
                    Call Notes *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Discussion points, objections raised, candidate readiness..."
                    className="w-full p-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs resize-none outline-none focus:border-[#3B4BDB]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#6B6B66] block mb-1">
                    Next Action Due Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={mandatoryDueDate.replace(' ', 'T').slice(0, 16)}
                    onChange={(e) => setMandatoryDueDate(e.target.value.replace('T', ' '))}
                    className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsLostModalOpen(true)}
                    className="text-xs text-[#8E2424] hover:underline font-medium"
                  >
                    Mark Lost…
                  </button>

                  <Button type="submit" variant="primary" size="md">
                    <span>Save & Next Lead (N)</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        leadName={currentLead.fullName}
        onClose={() => setIsLostModalOpen(false)}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
};
