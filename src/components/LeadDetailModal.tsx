// src/components/LeadDetailModal.tsx
import React, { useState, useEffect } from 'react';
import type { Lead, Stage, MentorMeeting, DemoSession, DirectSale } from '../types';
import { useApp } from '../context/AppContext';
import {
  MENTOR_PRESETS,
  DEMO_SESSION_PRESETS,
  calculate48HourWorkingSla,
  generateMentorWhatsAppMessage
} from '../utils/cadenceUtils';
import {
  WORKSHOP_DIRECT_SALE_SCRIPT,
  FREE_WEBINAR_FALLBACK_SCRIPT,
  AI_PM_PROGRAM_SCRIPT,
  getWorkshopDirectSaleWhatsApp,
  getFreeWebinarWhatsApp,
  getAiPmProgramWhatsApp,
  getPostWebinarDualProposalWhatsApp
} from '../utils/offeringTemplates';
import LeadTimeline from './LeadTimeline';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange?: (newStage: Stage) => void;
  onDelete?: (leadId: string) => void;
  initialPathway?: 'none' | 'mentor' | 'demo' | 'sale';
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch {}
  return String(dateStr);
}

const CRM_STAGES: Stage[] = [
  'New Lead',
  'Interested',
  'Follow-Up 1',
  'Follow-Up 2',
  'Follow-Up 3',
  'Qualified',
  'Call Later',
  'Did Not Pick The Call',
  'Details Sent on WhatsApp',
  'Mentor Session Scheduled',
  'Demo Session Scheduled',
  'Joined Session',
  'Payment Pending',
  'Converted',
  'Not Interested',
  'Unqualified',
  'Lost'
];

export default function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onStageChange,
  onDelete,
  initialPathway = 'none'
}: LeadDetailModalProps) {
  const {
    updateLeadStage,
    addCallNote,
    updateLeadFollowUp,
    deleteLead,
    logCall,
    salespeople = [],
    assignLead,
    scheduleMentorMeeting,
    inviteDemoSession,
    initiateDirectSale,
    incrementCadenceTouch
  } = useApp();

  const [activeActionTab, setActiveActionTab] = useState<'workshop-sale' | 'webinar-invite' | 'aipm-track' | 'followup'>('workshop-sale');
  const [callNoteText, setCallNoteText] = useState('');
  const [toastAlert, setToastAlert] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Offering and Script Drawer States
  const [selectedOffering, setSelectedOffering] = useState<'workshop-3day' | 'ai-pm'>(() => {
    if (lead?.programId === 'workshop-3day' || lead?.programName?.includes('Workshop') || lead?.programName?.includes('3-Day') || lead?.programName?.includes('3 Days')) {
      return 'workshop-3day';
    }
    return 'ai-pm';
  });
  const [showScriptDrawer, setShowScriptDrawer] = useState(false);
  const [scriptTab, setScriptTab] = useState<'workshop' | 'webinar' | 'aipm'>('workshop');

  // Offering 1: 3-Day Workshop In-Call Close State
  const [workshopFee, setWorkshopFee] = useState<number>(2999);
  const [workshopBatch, setWorkshopBatch] = useState<string>('Upcoming Weekend: Friday (7-10 PM), Saturday (10 AM-6 PM), Sunday (10 AM-6 PM)');
  const [workshopCheckoutLink] = useState('https://pages.razorpay.com/aiv-3day-builder');

  // Offering 2: AI-Native PM (4 Certifications in 3 Months) State
  const [aiPmFee] = useState<number>(49999);
  const [aiPmEmi] = useState<number>(4500);

  // Pathway 1: Mentor Form State (for AI-PM)
  const [mentorName, setMentorName] = useState(MENTOR_PRESETS[0].name);
  const [mentorDate, setMentorDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [mentorTime, setMentorTime] = useState('16:00');
  const mentorCallMinutes = 5;
  const mentorLink = 'https://meet.google.com/aiv-mentor-session';
  const mentorDuration = 30;
  const mentorAgenda = '1-on-1 AI Career Transition & Curriculum Alignment';

  // Fallback: Free Webinar State
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(0);
  const [demoDate, setDemoDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [demoTime, setDemoTime] = useState('20:00');
  const [demoLink, setDemoLink] = useState('https://meet.google.com/aiv-free-masterclass');

  // Custom Follow-up State
  const [nextStage, setNextStage] = useState<Stage>('Interested');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [nextFollowUpTime, setNextFollowUpTime] = useState('11:00');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Call Tracking & Mandatory Post-Call Log State
  const [isCallLogModalOpen, setIsCallLogModalOpen] = useState(false);
  const [callOutcome, setCallOutcome] = useState<'Connected' | 'No answer' | 'Busy' | 'Wrong number' | 'Call back later' | 'Not interested' | 'Interested'>('Connected');
  const [callDurationSec, setCallDurationSec] = useState<number>(120);
  const [callOutcomeNotes, setCallOutcomeNotes] = useState('');
  const [callNextActionType, setCallNextActionType] = useState<'Call' | 'WhatsApp' | 'Session' | 'Payment Follow-Up' | 'Review'>('Call');
  const [callNextActionDate, setCallNextActionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [callNextActionTime, setCallNextActionTime] = useState('11:00');
  const [callTelephonyProvider, setCallTelephonyProvider] = useState<'manual' | 'exotel' | 'knowlarity' | 'twilio'>('manual');

  useEffect(() => {
    if (isOpen) {
      if (initialPathway === 'mentor') {
        setSelectedOffering('ai-pm');
        setActiveActionTab('aipm-track');
      } else if (initialPathway === 'demo') {
        setActiveActionTab('webinar-invite');
      } else if (initialPathway === 'sale') {
        setSelectedOffering('workshop-3day');
        setActiveActionTab('workshop-sale');
      } else {
        setActiveActionTab('workshop-sale');
      }
    }
  }, [isOpen, initialPathway]);

  if (!isOpen || !lead) return null;

  const showNotification = (msg: string) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 3000);
  };

  const cleanPhone = (lead.phone || '').replace(/\D/g, '');
  const whatsAppPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
  const defaultWhatsAppUrl = `https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(
    `Hi ${lead.fullName.split(' ')[0]}, this is regarding your application for ${lead.programName || 'Aivalytics AI'}.`
  )}`;

  const sla = calculate48HourWorkingSla(lead.dateCaptured || lead.dateOfFillingForm);
  const callsAttempted = lead.outreachCadence?.callsAttempted ?? lead.numberOfCalls ?? 0;
  const waTouches = lead.outreachCadence?.whatsappAttempted ?? 0;

  // Handlers
  const handleStageChange = (newStage: Stage) => {
    updateLeadStage(lead.id, newStage);
    if (onStageChange) onStageChange(newStage);
    logCall(lead.id, newStage, `Stage updated to ${newStage}`);
    showNotification(`Stage changed to "${newStage}"`);
  };

  const handleConfirmWorkshopSale = () => {
    const payload: Omit<DirectSale, 'id' | 'createdAt'> = {
      programId: 'workshop-3day',
      programName: '3-Day AI Builder Workshop',
      tuitionFee: 5999,
      finalAmount: workshopFee,
      paymentPlan: 'Full Payment',
      paymentLink: workshopCheckoutLink,
      status: 'Payment Link Sent',
      notes: `Direct in-call close: ₹${workshopFee} for 3-Day AI Builder Workshop (Fri Evening - Sun Full Day)`
    };
    initiateDirectSale(lead.id, payload, 300, payload.notes);
    updateLeadStage(lead.id, 'Payment Pending');

    const msg = getWorkshopDirectSaleWhatsApp(lead.fullName, workshopBatch);
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');

    showNotification(`✓ 3-Day Workshop (₹${workshopFee}) in-call checkout sent to WhatsApp!`);
  };

  const handleConfirmWebinar = () => {
    const scheduledAt = `${demoDate} ${demoTime}`;
    const payload: Omit<DemoSession, 'id' | 'createdAt'> = {
      sessionTitle: 'Free Live AI Masterclass (Dual Program Proposal)',
      scheduledAt,
      durationMinutes: 75,
      sessionLink: demoLink,
      hostName: 'Lead AI Architect',
      status: 'Invited',
      notes: `Fallback invitation to Free Live AI Masterclass. In-call pitch was given, candidate invited to see live agent demos.`
    };
    inviteDemoSession(lead.id, payload, 180, payload.notes);
    updateLeadStage(lead.id, 'Demo Session Scheduled');

    const msg = getFreeWebinarWhatsApp(lead.fullName, scheduledAt, demoLink);
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');

    showNotification(`✓ Free Webinar pass sent to WhatsApp for ${scheduledAt}!`);
  };

  const handleSendAiPmBrochure = () => {
    const msg = getAiPmProgramWhatsApp(lead.fullName);
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');
    logCall(lead.id, 'Details Sent on WhatsApp', 'Sent AI-Native PM (4 Certifications in 3 Months) syllabus');
    updateLeadStage(lead.id, 'Details Sent on WhatsApp');
    showNotification('✓ AI-Native PM 4-Cert brochure sent to WhatsApp!');
  };

  const handleSendDualProposal = () => {
    const msg = getPostWebinarDualProposalWhatsApp(lead.fullName);
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');
    logCall(lead.id, 'Details Sent on WhatsApp', 'Sent post-webinar dual proposal (3-Day Workshop vs AI-PM Program)');
    showNotification('✓ Post-webinar dual proposal sent to WhatsApp!');
  };

  const handleConfirmMentor = () => {
    const scheduledAt = `${mentorDate} ${mentorTime}`;
    const preset = MENTOR_PRESETS.find((m) => m.name === mentorName) || MENTOR_PRESETS[0];
    const payload: Omit<MentorMeeting, 'id' | 'createdAt'> = {
      mentorName,
      mentorTitle: preset.title,
      scheduledAt,
      durationMinutes: mentorDuration,
      meetingLink: mentorLink,
      agenda: mentorAgenda,
      status: 'Scheduled',
      callDurationSeconds: mentorCallMinutes * 60,
      notes: `Discovery call: ${mentorCallMinutes}m. Scheduled 1-on-1 with ${mentorName}.`
    };
    scheduleMentorMeeting(lead.id, payload, mentorCallMinutes * 60, payload.notes);
    
    // Auto-open WhatsApp
    const msg = generateMentorWhatsAppMessage(lead.fullName, { ...payload, id: 'temp', createdAt: '' });
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');

    showNotification(`✓ Mentor meeting booked for ${scheduledAt} & WhatsApp sent!`);
  };

  const handleSaveFollowUp = () => {
    const dateTime = `${nextFollowUpDate} ${nextFollowUpTime}`;
    updateLeadFollowUp(lead.id, nextStage, dateTime, followUpNotes);
    if (onStageChange) onStageChange(nextStage);
    logCall(lead.id, nextStage, `Follow-up scheduled for ${dateTime}. Note: ${followUpNotes || 'None'}`);
    showNotification(`✓ Follow-up set for ${dateTime}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNoteText.trim()) return;
    addCallNote(lead.id, callNoteText.trim());
    logCall(lead.id, 'Note Added', callNoteText.trim());
    setCallNoteText('');
    showNotification('Note added to history');
  };

  const handleCompleteCallLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    const dueDateTime = `${callNextActionDate} ${callNextActionTime}`;
    const isClosed = callOutcome === 'Not interested';

    if (!isClosed && !callNextActionDate) {
      showNotification('⚠️ Mandatory next action date required unless closed.');
      return;
    }

    logCall(
      lead.id,
      callOutcome,
      callOutcomeNotes || `Call logged as ${callOutcome}`,
      isClosed ? undefined : {
        action: callNextActionType,
        dueDateTime,
        notes: callOutcomeNotes
      },
      {
        provider: callTelephonyProvider,
        durationSeconds: callDurationSec
      }
    );

    incrementCadenceTouch(lead.id, 'Call');
    setIsCallLogModalOpen(false);
    setCallOutcomeNotes('');
    showNotification(`✓ Call logged: ${callOutcome} (Next: ${isClosed ? 'Closed' : callNextActionType})`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Notification Toast */}
        {toastAlert && (
          <div className="bg-emerald-800 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between">
            <span>{toastAlert}</span>
            <button onClick={() => setToastAlert(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* 1. MINIMAL HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-850">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#133926] text-white font-bold text-lg flex items-center justify-center shrink-0">
              {lead.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {lead.fullName}
                </h2>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-200/70 dark:bg-gray-700 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                  {lead.programName || 'AI Cohort'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {lead.currentRole || 'Candidate'} • {lead.yearsOfExperience || lead.experience || '3+'}y exp
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {lead.phone && (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  onClick={() => {
                    setIsCallLogModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Open phone call dialer"
                >
                  <span>📞</span> Call
                </a>
                <button
                  type="button"
                  onClick={() => setIsCallLogModalOpen(true)}
                  className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Log call outcome & mandatory next action"
                >
                  <span>📝</span> Log Call
                </button>
                <a
                  href={defaultWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => incrementCadenceTouch(lead.id, 'WhatsApp')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>💬</span> WhatsApp
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Subtle SLA & Touch Strip */}
        <div className="px-6 py-2 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold">
              ⏰ SLA: {sla.isWithin48Hours ? `${sla.remainingHours.toFixed(1)}h remaining (7am–8pm)` : '48h Cycle Expired'}
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span>
              Outreach: <strong>{callsAttempted}/3 calls</strong> • <strong>{waTouches}/5 WA</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                incrementCadenceTouch(lead.id, 'Call');
                showNotification('+1 Call Touch Logged');
              }}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              + Record Call
            </button>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <button
              type="button"
              onClick={() => {
                incrementCadenceTouch(lead.id, 'WhatsApp');
                showNotification('+1 WhatsApp Touch Logged');
              }}
              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              + Record WA
            </button>
          </div>
        </div>

        {/* 2. MAIN 2-COLUMN MINIMAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Clean Lead Overview (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Status & Assigned Rep */}
            <div className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-850 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Current Status
                </label>
                <select
                  value={lead.crmStage}
                  onChange={(e) => handleStageChange(e.target.value as Stage)}
                  className="w-full px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {CRM_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Assigned Salesperson
                </label>
                <select
                  value={lead.assignedSalesperson || 'Alex Rivera'}
                  onChange={(e) => {
                    assignLead(lead.id, e.target.value);
                    showNotification(`Assigned to ${e.target.value}`);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {salespeople.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ingestion & Qualification Details */}
            <div className="p-4 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2.5 text-xs">
              <h3 className="font-bold text-xs text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-1.5">
                Qualification Context
              </h3>

              <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Mobile</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{lead.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Email</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 truncate block">{lead.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Experience</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{lead.yearsOfExperience || lead.experience || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Location</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{lead.city || 'India'}</span>
                </div>
              </div>

              {(lead.primaryGoal || lead.goal) && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Primary Goal</span>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    🎯 {String(lead.primaryGoal || lead.goal).replace(/_/g, ' ')}
                  </p>
                </div>
              )}

              {(lead.objection || lead.blocker || lead.mainChallenge) && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Challenge / Budget Objection</span>
                  <p className="font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded text-[11px] border border-amber-200 dark:border-amber-900">
                    ⚠️ {String(lead.objection || lead.blocker || lead.mainChallenge).replace(/_/g, ' ')}
                  </p>
                </div>
              )}

              {lead.preferredContactTime && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Preferred Call Time</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    ⏰ {lead.preferredContactTime.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              <div className="pt-1 text-[11px] text-gray-400">
                Captured: {formatDateTime(lead.dateCaptured)} • Source: {lead.source || 'Meta Ads'}
              </div>
            </div>

            {/* Delete button (quiet) */}
            <div className="pt-1">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Delete this lead
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-red-600 font-bold">Permanently delete?</span>
                  <button
                    onClick={() => {
                      deleteLead(lead.id);
                      if (onDelete) onDelete(lead.id);
                      onClose();
                    }}
                    className="px-2 py-1 bg-red-600 text-white rounded font-bold"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-gray-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Minimalist Action & History (7 cols) */}
          <div className="md:col-span-7 space-y-3.5">
            {/* Core Offering Selector Header */}
            <div className="flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                <span className="text-sm">🎯</span>
                <span>Offering:</span>
              </div>
              <div className="flex gap-1.5 font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOffering('workshop-3day');
                    setActiveActionTab('workshop-sale');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedOffering === 'workshop-3day'
                      ? 'bg-[#133926] text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ⚡ 3-Day Builder Workshop
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOffering('ai-pm');
                    setActiveActionTab('aipm-track');
                  }}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedOffering === 'ai-pm'
                      ? 'bg-[#133926] text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🎓 AI-Native PM (4 Certs / 3 Mo)
                </button>
              </div>
            </div>

            {/* Quick In-Call Script & Objection Guide Toggle */}
            <div className="border border-amber-200 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-2.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200">
                  {selectedOffering === 'workshop-3day'
                    ? '⚡ Fri Eve (7-10 PM), Sat Full Day (10-6 PM), Sun Full Day (10-6 PM)'
                    : '🎓 4 Industry Certifications across 12 Weeks (Weekend Masterclasses + Midweek Strategy)'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowScriptDrawer(!showScriptDrawer)}
                  className="text-amber-900 dark:text-amber-300 font-bold hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
                >
                  <span>{showScriptDrawer ? '▲ Hide Pitch Scripts' : '▼ Live Call Script & Objections'}</span>
                </button>
              </div>

              {showScriptDrawer && (
                <div className="pt-2 border-t border-amber-200 dark:border-amber-800/80 space-y-2">
                  <div className="flex gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setScriptTab('workshop')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        scriptTab === 'workshop' ? 'bg-amber-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                      }`}
                    >
                      ⚡ 3-Day In-Call Close
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptTab('webinar')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        scriptTab === 'webinar' ? 'bg-amber-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                      }`}
                    >
                      🎟️ Fallback Webinar Invite
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptTab('aipm')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        scriptTab === 'aipm' ? 'bg-amber-700 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                      }`}
                    >
                      🎓 AI-PM 4-Cert Pitch
                    </button>
                  </div>

                  {scriptTab === 'workshop' && (
                    <div className="space-y-1.5 text-[11px] text-gray-800 dark:text-gray-200 leading-relaxed bg-white/70 dark:bg-gray-900/60 p-2 rounded-lg border border-amber-200/60">
                      <p><strong>Opening Hook:</strong> &quot;{WORKSHOP_DIRECT_SALE_SCRIPT.hook.replace('[Name]', lead.fullName.split(' ')[0])}&quot;</p>
                      <p><strong>Value Pitch:</strong> &quot;{WORKSHOP_DIRECT_SALE_SCRIPT.valuePitch}&quot;</p>
                      <p className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded font-semibold text-emerald-900 dark:text-emerald-200 border border-emerald-200">
                        <strong>In-Call Close:</strong> &quot;{WORKSHOP_DIRECT_SALE_SCRIPT.inCallClose}&quot;
                      </p>
                      <div className="text-[10px] text-gray-500 pt-0.5 space-y-0.5">
                        <p>• <em>If &quot;No Time&quot;</em>: {WORKSHOP_DIRECT_SALE_SCRIPT.objectionNoTime}</p>
                        <p>• <em>If &quot;Too Expensive&quot;</em>: {WORKSHOP_DIRECT_SALE_SCRIPT.objectionBudget}</p>
                      </div>
                    </div>
                  )}

                  {scriptTab === 'webinar' && (
                    <div className="space-y-1.5 text-[11px] text-gray-800 dark:text-gray-200 leading-relaxed bg-white/70 dark:bg-gray-900/60 p-2 rounded-lg border border-amber-200/60">
                      <p><strong>Transition when not buying on call:</strong> &quot;{FREE_WEBINAR_FALLBACK_SCRIPT.transition}&quot;</p>
                      <p><strong>Masterclass Agenda:</strong> &quot;{FREE_WEBINAR_FALLBACK_SCRIPT.pitch}&quot;</p>
                      <p className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 rounded font-semibold text-indigo-900 dark:text-indigo-200 border border-indigo-200">
                        <strong>Webinar Pass Close:</strong> &quot;{FREE_WEBINAR_FALLBACK_SCRIPT.close}&quot;
                      </p>
                    </div>
                  )}

                  {scriptTab === 'aipm' && (
                    <div className="space-y-1.5 text-[11px] text-gray-800 dark:text-gray-200 leading-relaxed bg-white/70 dark:bg-gray-900/60 p-2 rounded-lg border border-amber-200/60">
                      <p><strong>Curriculum Value:</strong> &quot;{AI_PM_PROGRAM_SCRIPT.valuePitch}&quot;</p>
                      <p className="p-1.5 bg-purple-50 dark:bg-purple-950/50 rounded font-semibold text-purple-900 dark:text-purple-200 border border-purple-200">
                        <strong>Mentor Session Booking:</strong> &quot;{AI_PM_PROGRAM_SCRIPT.mentorPitch}&quot;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Segmented Action Tabs */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 bg-white dark:bg-gray-850 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Select Action / Next Step
                </span>
                {lead.nextTask && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                    Next: {lead.nextTask.taskType} ({lead.nextTask.dueDateTime})
                  </span>
                )}
              </div>

              {/* Segmented switcher */}
              <div className="grid grid-cols-4 gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveActionTab('workshop-sale')}
                  className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeActionTab === 'workshop-sale' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  ⚡ In-Call Buy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('webinar-invite')}
                  className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeActionTab === 'webinar-invite' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  🎟️ Free Webinar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('aipm-track')}
                  className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeActionTab === 'aipm-track' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  🎓 AI-PM (4 Certs)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('followup')}
                  className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                    activeActionTab === 'followup' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  📞 Follow-up
                </button>
              </div>

              {/* Tab 1 Content: In-Call Buy (3-Day Workshop) */}
              {activeActionTab === 'workshop-sale' && (
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                    <div>
                      <strong className="text-emerald-900 dark:text-emerald-200 block text-xs">3-Day AI Builder Workshop (Weekend Sprint)</strong>
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">
                        Friday Evening (7-10 PM) • Saturday Full Day (10-6 PM) • Sunday Full Day (10-6 PM)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-xs">
                      Weekend Cohort
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">In-Call Special Fee</label>
                      <select
                        value={workshopFee}
                        onChange={(e) => setWorkshopFee(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-semibold"
                      >
                        <option value={2999}>₹2,999 (Direct-Call 50% Off Special)</option>
                        <option value={3999}>₹3,999 (Standard Early Bird)</option>
                        <option value={5999}>₹5,999 (Regular Full Tuition)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Batch Schedule</label>
                      <input
                        type="text"
                        value={workshopBatch}
                        onChange={(e) => setWorkshopBatch(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmWorkshopSale}
                      className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>💳</span> Confirm In-Call Sale & Send ₹{workshopFee.toLocaleString('en-IN')} Checkout on WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2 Content: Free Webinar Fallback & Dual Proposal */}
              {activeActionTab === 'webinar-invite' && (
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                    <strong className="text-indigo-900 dark:text-indigo-200 block text-xs">Free Live AI Masterclass (Dual Program Proposal)</strong>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                      Did not buy on call? Invite them to the live masterclass where both the <strong>3-Day AI Builder Workshop</strong> and <strong>AI-Native PM Program</strong> will be proposed.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Choose Upcoming Session</label>
                      <select
                        value={selectedDemoIdx}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedDemoIdx(idx);
                          setDemoLink(DEMO_SESSION_PRESETS[idx].link);
                        }}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-semibold"
                      >
                        {DEMO_SESSION_PRESETS.map((d, i) => (
                          <option key={d.title} value={i}>
                            {d.title} ({d.dayTiming})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Custom Date & Time</label>
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={demoDate}
                          onChange={(e) => setDemoDate(e.target.value)}
                          className="w-2/3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                        />
                        <input
                          type="time"
                          value={demoTime}
                          onChange={(e) => setDemoTime(e.target.value)}
                          className="w-1/3 px-1.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleSendDualProposal}
                      className="text-xs text-indigo-700 dark:text-indigo-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>📢</span> Send Post-Webinar Dual Proposal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmWebinar}
                      className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🎟️</span> Send Free Webinar Guest Pass on WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3 Content: AI-Native PM (4 Certifications in 3 Months) */}
              {activeActionTab === 'aipm-track' && (
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-purple-950 dark:text-purple-200 block text-xs">AI-Native Product Management (3 Months)</strong>
                        <span className="text-[11px] text-gray-600 dark:text-gray-400">
                          Includes 4 Industry Certifications • Weekend Interactive Masterclasses + Weekly 1-on-1 Mentorship
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold text-[10px]">
                        ₹{aiPmFee.toLocaleString('en-IN')} (EMI ₹{aiPmEmi.toLocaleString('en-IN')}/mo)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] text-purple-900 dark:text-purple-300 font-medium">
                      <span>• Cert 1: AI PRD Engineering</span>
                      <span>• Cert 2: Multi-Agent PM Systems</span>
                      <span>• Cert 3: Data-Driven AI Metrics</span>
                      <span>• Cert 4: Production Capstone Defense</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Mentor for 1-on-1</label>
                      <select
                        value={mentorName}
                        onChange={(e) => setMentorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-semibold"
                      >
                        {MENTOR_PRESETS.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name} ({m.specialty.split('&')[0]})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Session Date & Time</label>
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={mentorDate}
                          onChange={(e) => setMentorDate(e.target.value)}
                          className="w-2/3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                        />
                        <input
                          type="time"
                          value={mentorTime}
                          onChange={(e) => setMentorTime(e.target.value)}
                          className="w-1/3 px-1.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleSendAiPmBrochure}
                      className="text-xs text-purple-700 dark:text-purple-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>📄</span> Send 4-Cert Syllabus on WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmMentor}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🎓</span> Confirm Mentor Session & WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4 Content: Standard Follow-up */}
              {activeActionTab === 'followup' && (
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Target Stage</label>
                      <select
                        value={nextStage}
                        onChange={(e) => setNextStage(e.target.value as Stage)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-semibold"
                      >
                        <option value="Interested">Interested</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Follow-Up 1">Follow-Up 1</option>
                        <option value="Follow-Up 2">Follow-Up 2</option>
                        <option value="Follow-Up 3">Follow-Up 3</option>
                        <option value="Call Later">Call Later</option>
                        <option value="Details Sent on WhatsApp">Details Sent on WhatsApp</option>
                        <option value="Did Not Pick The Call">Did Not Pick The Call</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Unqualified">Unqualified</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Callback Date & Time</label>
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={nextFollowUpDate}
                          onChange={(e) => setNextFollowUpDate(e.target.value)}
                          className="w-2/3 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                        />
                        <input
                          type="time"
                          value={nextFollowUpTime}
                          onChange={(e) => setNextFollowUpTime(e.target.value)}
                          className="w-1/3 px-1.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Instructions / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Call in evening, discuss pricing EMI..."
                      value={followUpNotes}
                      onChange={(e) => setFollowUpNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveFollowUp}
                      className="px-4 py-1.5 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg font-bold shadow-xs cursor-pointer"
                    >
                      Save Follow-Up
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Quick log a call note or discussion summary..."
                  value={callNoteText}
                  onChange={(e) => setCallNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#133926] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#1a4a33] shrink-0"
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* Lead Timeline History Stream */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Timeline Audit & Event History</span>
                <span className="text-emerald-600 font-semibold text-[10px]">Auto-Synced</span>
              </h4>

              <div className="max-h-72 overflow-y-auto pr-1">
                <LeadTimeline lead={lead} />
              </div>
            </div>
          </div>
        </div>

        {/* Post-Call Mandatory Logging Modal */}
        {isCallLogModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleCompleteCallLog}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  <div>
                    <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                      Log Call Result for {lead.fullName}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Mandatory next action & outcome tracking
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCallLogModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Outcome & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Call Outcome *
                    </label>
                    <select
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-semibold"
                    >
                      <option value="Connected">Connected (Spoke with lead)</option>
                      <option value="Interested">Interested (Strong buying intent)</option>
                      <option value="No answer">No answer (Rang, did not pick)</option>
                      <option value="Busy">Busy (Line busy)</option>
                      <option value="Call back later">Call back later (Requested recall)</option>
                      <option value="Wrong number">Wrong number / Invalid</option>
                      <option value="Not interested">Not interested (Close lead)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={callDurationSec}
                      onChange={(e) => setCallDurationSec(Number(e.target.value))}
                      placeholder="e.g. 120"
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* Call Notes */}
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Discussion Notes *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Summary of conversation, questions asked, objections, goals..."
                    value={callOutcomeNotes}
                    onChange={(e) => setCallOutcomeNotes(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-xs"
                  />
                </div>

                {/* Mandatory Next Action (Unless lead is closed) */}
                {callOutcome !== 'Not interested' && (
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                    <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">
                      📌 Mandatory Next Action & Due Date
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                          Action Type
                        </label>
                        <select
                          value={callNextActionType}
                          onChange={(e) => setCallNextActionType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 border rounded-lg bg-white dark:bg-gray-800 text-xs font-semibold"
                        >
                          <option value="Call">Phone Call</option>
                          <option value="WhatsApp">WhatsApp Message</option>
                          <option value="Session">Mentor Session / Webinar</option>
                          <option value="Payment Follow-Up">Payment Link Follow-up</option>
                          <option value="Review">Application Review</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                          Due Date & Time *
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="date"
                            required
                            value={callNextActionDate}
                            onChange={(e) => setCallNextActionDate(e.target.value)}
                            className="w-2/3 px-2 py-1.5 border rounded-lg bg-white dark:bg-gray-800 text-xs"
                          />
                          <input
                            type="time"
                            required
                            value={callNextActionTime}
                            onChange={(e) => setCallNextActionTime(e.target.value)}
                            className="w-1/3 px-1.5 py-1.5 border rounded-lg bg-white dark:bg-gray-800 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Telephony Integration Provider (Advanced extensible field) */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                  <span>Telephony Integration:</span>
                  <select
                    value={callTelephonyProvider}
                    onChange={(e) => setCallTelephonyProvider(e.target.value as any)}
                    className="px-2 py-1 border rounded bg-transparent text-gray-700 dark:text-gray-300 text-[10px]"
                  >
                    <option value="manual">Manual Call (tel: dialer)</option>
                    <option value="exotel">Exotel Telephony</option>
                    <option value="knowlarity">Knowlarity Cloud</option>
                    <option value="twilio">Twilio Voice</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsCallLogModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg shadow-sm cursor-pointer"
                >
                  Save Call & Next Action
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
