// src/components/LeadDetailModal.tsx
import React, { useState, useEffect } from 'react';
import type { Lead, Stage, MentorMeeting, DemoSession, DirectSale } from '../types';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  MENTOR_PRESETS,
  DEMO_SESSION_PRESETS,
  calculate48HourWorkingSla,
  generateMentorWhatsAppMessage,
  generateDemoWhatsAppMessage,
  generateDirectSaleWhatsAppMessage
} from '../utils/cadenceUtils';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange?: (newStage: Stage) => void;
  onDelete?: (leadId: string) => void;
  initialPathway?: 'none' | 'mentor' | 'demo' | 'sale';
}

function formatCollectionDateTime(dateStr?: string): string {
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
    setSelectedLeadId,
    deleteLead,
    logCall,
    salespeople = [],
    assignLead,
    updatePaymentState,
    scheduleMentorMeeting,
    inviteDemoSession,
    initiateDirectSale,
    incrementCadenceTouch
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'notes'>('details');
  const [callNoteText, setCallNoteText] = useState('');
  const [showStatusAlert, setShowStatusAlert] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 3 Core Conversion Pathways State: 'none' | 'mentor' | 'demo' | 'sale'
  const [activePathway, setActivePathway] = useState<'none' | 'mentor' | 'demo' | 'sale'>(initialPathway);

  useEffect(() => {
    if (isOpen) {
      setActivePathway(initialPathway || 'none');
    }
  }, [isOpen, initialPathway]);

  // Pathway 1: Mentor Meeting Form
  const [mentorName, setMentorName] = useState(MENTOR_PRESETS[0].name);
  const [mentorMeetingDate, setMentorMeetingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [mentorMeetingTime, setMentorMeetingTime] = useState('16:00');
  const [mentorDurationMinutes, setMentorDurationMinutes] = useState(30);
  const [mentorCallDurationMinutes, setMentorCallDurationMinutes] = useState(5); // user: "talked for around five to six minutes"
  const [mentorMeetingLink, setMentorMeetingLink] = useState('https://meet.google.com/aiv-mentor-session');
  const [mentorAgenda, setMentorAgenda] = useState('1-on-1 AI Transition Strategy & Curriculum Alignment');

  // Pathway 2: Demo Session Form
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [demoDate, setDemoDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [demoTime, setDemoTime] = useState('11:00');
  const [demoLink, setDemoLink] = useState(DEMO_SESSION_PRESETS[0].link);
  const [demoNotes, setDemoNotes] = useState('Invited prospect to live cohort demo masterclass');

  // Pathway 3: Direct Sale Form
  const baseProgramFee =
    lead?.programId === 'ai-fellowship' ? 99999 : lead?.programId === 'ai-gtm' ? 54999 : 34999;
  const [salePaymentPlan, setSalePaymentPlan] = useState<
    'Full Payment' | 'Token Deposit (₹5,000)' | '3-Month No-Cost EMI'
  >('Full Payment');
  const [saleAmount, setSaleAmount] = useState(baseProgramFee);
  const [salePaymentLink, setSalePaymentLink] = useState(
    lead?.paymentLink || 'https://pages.razorpay.com/aivalytics-checkout'
  );
  const [saleActionStatus, setSaleActionStatus] = useState<'Payment Link Sent' | 'Deposit Received' | 'Paid in Full'>(
    'Payment Link Sent'
  );
  const [saleNotes, setSaleNotes] = useState('Direct course sale pitch conducted on phone call');

  // Follow-Up Scheduler State
  const [selectedFollowUpStage, setSelectedFollowUpStage] = useState<Stage | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [followUpTime, setFollowUpTime] = useState<string>('11:00');
  const [followUpNotesInput, setFollowUpNotesInput] = useState<string>('');

  if (!isOpen || !lead) return null;

  // Status Radio Options matching user screenshot
  const statusOptions: { stage: Stage; label: string; icon: string; isDanger?: boolean }[] = [
    { stage: 'Qualified', label: 'Qualified', icon: '☀️' },
    { stage: 'Interested', label: 'Interested', icon: '💬' },
    { stage: 'Details Sent on WhatsApp', label: 'Details Sent', icon: '📲' },
    { stage: 'Did Not Pick The Call', label: 'Did Not Pick The Call', icon: '🚫', isDanger: true },
    { stage: 'Not Interested', label: 'Not Interested', icon: '🔴', isDanger: true },
    { stage: 'Unqualified', label: 'Unqualified', icon: '🚫', isDanger: true },
  ];

  const secondaryStages: Stage[] = [
    'New Lead',
    'Connected',
    'Follow-Up 1',
    'Follow-Up 2',
    'Follow-Up 3',
    'Call Later',
    'Payment Pending',
    'Joined Session',
    'Converted',
    'Lost'
  ];

  const handleStageClick = (stage: Stage) => {
    updateLeadStage(lead.id, stage);
    if (onStageChange) onStageChange(stage);
    setSelectedFollowUpStage(null);
    logCall(lead.id, stage, `Stage updated to "${stage}"`);
    setShowStatusAlert(`Status updated to "${stage}" & logged to daily calls!`);
    setTimeout(() => setShowStatusAlert(null), 3000);
  };

  const handleOpenFollowUpScheduler = (stage: Stage) => {
    setSelectedFollowUpStage(stage);
    const d = new Date();
    if (stage === 'Follow-Up 1') d.setDate(d.getDate() + 1);
    else if (stage === 'Follow-Up 2') d.setDate(d.getDate() + 2);
    else if (stage === 'Follow-Up 3') d.setDate(d.getDate() + 3);
    else if (stage === 'Call Later') d.setDate(d.getDate() + 1);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  const handleSaveFollowUpWithNotes = () => {
    if (!selectedFollowUpStage) return;
    if (!followUpDate) {
      setShowStatusAlert('Please pick a date for the follow-up.');
      return;
    }
    const combinedDate = followUpTime ? `${followUpDate} ${followUpTime}` : followUpDate;
    updateLeadFollowUp(lead.id, selectedFollowUpStage, combinedDate, followUpNotesInput);
    if (onStageChange) onStageChange(selectedFollowUpStage);
    logCall(lead.id, selectedFollowUpStage, `Follow-up set for ${combinedDate}. Notes: ${followUpNotesInput || 'None'}`);
    setShowStatusAlert(`🎉 Follow-up scheduled for ${combinedDate} & logged to daily calls`);
    setSelectedFollowUpStage(null);
    setFollowUpNotesInput('');
    setTimeout(() => setShowStatusAlert(null), 3500);
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNoteText.trim()) return;
    addCallNote(lead.id, callNoteText.trim());
    logCall(lead.id, 'Call Note Added', callNoteText.trim());
    setCallNoteText('');
    setShowStatusAlert('Note saved & logged to daily calls!');
    setTimeout(() => setShowStatusAlert(null), 3000);
  };

  const handleOpenFullProfile = () => {
    setSelectedLeadId(lead.id);
    onClose();
    navigate('/profile');
  };

  const handleConfirmMentorMeeting = () => {
    if (!mentorMeetingDate) {
      setShowStatusAlert('Please pick a date for the mentor session.');
      return;
    }
    const combinedDateTime = `${mentorMeetingDate} ${mentorMeetingTime || '16:00'}`;
    const selectedPreset = MENTOR_PRESETS.find((m) => m.name === mentorName) || MENTOR_PRESETS[0];
    const meetingPayload: Omit<MentorMeeting, 'id' | 'createdAt'> = {
      mentorName,
      mentorTitle: selectedPreset.title,
      scheduledAt: combinedDateTime,
      durationMinutes: Number(mentorDurationMinutes) || 30,
      meetingLink: mentorMeetingLink,
      agenda: mentorAgenda,
      status: 'Scheduled',
      callDurationSeconds: Number(mentorCallDurationMinutes) * 60,
      notes: `Spoke for ${mentorCallDurationMinutes} mins. Scheduled 1-on-1 Mentor Strategy Session.`
    };
    scheduleMentorMeeting(lead.id, meetingPayload, Number(mentorCallDurationMinutes) * 60, meetingPayload.notes);
    setShowStatusAlert(`🎉 Mentor Session with ${mentorName} booked for ${combinedDateTime}!`);
    setActivePathway('none');
    setTimeout(() => setShowStatusAlert(null), 4000);
  };

  const handleConfirmDemoSession = () => {
    const preset = DEMO_SESSION_PRESETS[selectedDemoIndex] || DEMO_SESSION_PRESETS[0];
    const combinedDateTime = `${demoDate} ${demoTime || '11:00'}`;
    const demoPayload: Omit<DemoSession, 'id' | 'createdAt'> = {
      sessionTitle: preset.title,
      scheduledAt: combinedDateTime,
      durationMinutes: preset.durationMinutes,
      sessionLink: demoLink || preset.link,
      hostName: preset.host,
      status: 'Invited',
      notes: demoNotes
    };
    inviteDemoSession(lead.id, demoPayload, 180, demoNotes);
    setShowStatusAlert(`🎉 Candidate invited to Demo Session (${preset.title})!`);
    setActivePathway('none');
    setTimeout(() => setShowStatusAlert(null), 4000);
  };

  const handleConfirmDirectSale = () => {
    const finalAmt =
      salePaymentPlan === 'Token Deposit (₹5,000)'
        ? 5000
        : salePaymentPlan === '3-Month No-Cost EMI'
        ? Math.round(baseProgramFee / 3)
        : saleAmount;

    const salePayload: Omit<DirectSale, 'id' | 'createdAt'> = {
      programId: lead.programId,
      programName: lead.programName || 'AI Cohort Program',
      tuitionFee: baseProgramFee,
      finalAmount: finalAmt,
      paymentPlan: salePaymentPlan,
      paymentLink: salePaymentLink,
      status:
        saleActionStatus === 'Paid in Full'
          ? 'Paid in Full'
          : saleActionStatus === 'Deposit Received'
          ? 'Deposit Received'
          : 'Payment Link Sent',
      notes: saleNotes
    };
    initiateDirectSale(lead.id, salePayload, 300, saleNotes);
    setShowStatusAlert(`🎉 Direct Sale transaction saved (${salePaymentPlan} - ${saleActionStatus})!`);
    setActivePathway('none');
    setTimeout(() => setShowStatusAlert(null), 4000);
  };

  const handleSendMentorWhatsApp = () => {
    const meeting = lead.mentorMeeting || {
      mentorName,
      mentorTitle: MENTOR_PRESETS.find((m) => m.name === mentorName)?.title,
      scheduledAt: `${mentorMeetingDate} ${mentorMeetingTime}`,
      durationMinutes: Number(mentorDurationMinutes) || 30,
      meetingLink: mentorMeetingLink
    };
    const msg = generateMentorWhatsAppMessage(lead.fullName, meeting);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');
    setShowStatusAlert('Opening WhatsApp with Mentor Session confirmation!');
    setTimeout(() => setShowStatusAlert(null), 3000);
  };

  const handleSendDemoWhatsApp = () => {
    const preset = DEMO_SESSION_PRESETS[selectedDemoIndex] || DEMO_SESSION_PRESETS[0];
    const demo = lead.demoSession || {
      sessionTitle: preset.title,
      scheduledAt: `${demoDate} ${demoTime}`,
      sessionLink: demoLink || preset.link
    };
    const msg = generateDemoWhatsAppMessage(lead.fullName, demo);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');
    setShowStatusAlert('Opening WhatsApp with Live Demo Session invitation!');
    setTimeout(() => setShowStatusAlert(null), 3000);
  };

  const handleSendSaleWhatsApp = () => {
    const sale = lead.directSale || {
      programName: lead.programName || 'AI Cohort Program',
      finalAmount: salePaymentPlan === 'Token Deposit (₹5,000)' ? 5000 : baseProgramFee,
      paymentPlan: salePaymentPlan,
      paymentLink: salePaymentLink
    };
    const msg = generateDirectSaleWhatsAppMessage(lead.fullName, sale);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');
    setShowStatusAlert('Opening WhatsApp with Checkout & Payment details!');
    setTimeout(() => setShowStatusAlert(null), 3000);
  };

  const cleanPhone = (lead.phone || '').replace(/\D/g, '');
  const whatsAppUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
    `Hi ${lead.fullName.split(' ')[0]}, I am reaching out from Aivalytics regarding your interest in ${lead.programName || 'our AI program'}.`
  )}`;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#f8fafc] dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. HEADER SECTION MATCHING EXACT SCREENSHOT */}
        <div className="p-6 bg-white dark:bg-gray-800/90 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Dark green rounded avatar badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#264e36] text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
              {lead.fullName.charAt(0).toUpperCase()}
            </div>
            
            <div className="min-w-0 space-y-1.5">
              {/* Name & Stage & Program Pills */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight truncate">
                  {lead.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {lead.crmStage}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {lead.programName || 'AI-Native Project Management'}
                </span>
              </div>

              {/* Prominent Contact Row: Mobile Number & Email */}
              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                {lead.phone ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs shadow-2xs">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">📱 Mobile:</span>
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={() => {
                        logCall(lead.id, 'Connected', 'Outgoing phone call placed');
                        setShowStatusAlert('📞 Call initiated & logged to Daily Calling Tracker!');
                        setTimeout(() => setShowStatusAlert(null), 3000);
                      }}
                      className="font-black text-gray-900 dark:text-gray-100 hover:text-emerald-700 dark:hover:text-emerald-400 tracking-wide text-xs"
                      title="Click to dial candidate"
                    >
                      {lead.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(lead.phone);
                        setShowStatusAlert(`Copied ${lead.phone} to clipboard!`);
                        setTimeout(() => setShowStatusAlert(null), 2500);
                      }}
                      className="text-[11px] text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ml-1 cursor-pointer"
                      title="Copy phone number"
                    >
                      📋
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 font-medium">
                    📱 No phone number listed
                  </span>
                )}
                {lead.email && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs shadow-2xs">
                    <span className="text-gray-500 font-semibold">✉️ Email:</span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-semibold text-gray-700 dark:text-gray-300 hover:underline max-w-[220px] truncate"
                      title="Click to email candidate"
                    >
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Subtitle details row: Role | Experience | Collected Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2.5 flex-wrap font-medium pt-0.5">
                <span className="flex items-center gap-1.5">
                  <span>💼</span> {lead.professionalStatus || lead.currentRole || 'Professional'}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1.5">
                  <span>⏳</span> {lead.yearsOfExperience || 11} yrs exp
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1.5">
                  <span>📅</span> Collected: {formatCollectionDateTime(lead.dateCaptured)}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/80 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-500 font-bold">👤 Rep:</span>
                  <select
                    value={lead.assignedSalesperson || 'Alex Rivera'}
                    onChange={(e) => {
                      if (assignLead) assignLead(lead.id, e.target.value);
                      setShowStatusAlert(`Assigned to ${e.target.value}!`);
                      setTimeout(() => setShowStatusAlert(null), 3000);
                    }}
                    className="font-bold text-gray-800 dark:text-gray-200 bg-transparent focus:outline-hidden cursor-pointer text-xs"
                  >
                    {salespeople.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </span>
              </div>

            </div>
          </div>

          {/* Action buttons: Call, WhatsApp, Delete, More */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            {lead.phone && (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  onClick={() => {
                    logCall(lead.id, 'Connected', 'Outgoing phone call placed');
                    setShowStatusAlert('📞 Call initiated & logged to Daily Calling Tracker!');
                    setTimeout(() => setShowStatusAlert(null), 3000);
                  }}
                  className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
                  title={`Direct Phone Call to ${lead.phone}`}
                >
                  <span>📞</span> Call <span className="font-black text-emerald-800 dark:text-emerald-300">{lead.phone}</span>
                </a>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#264e36] hover:bg-[#1c3a29] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  title="Open WhatsApp Chat"
                >
                  <span>💬</span> WhatsApp
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 bg-red-50/80 hover:bg-red-100 text-red-600 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Delete this lead"
            >
              <span>🗑️</span> Delete
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-base cursor-pointer transition-all"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {showStatusAlert && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2 animate-in fade-in">
            <span>✅</span> {showStatusAlert}
          </div>
        )}

        {/* 2. BODY CONTENT (SCROLLABLE CONTAINER) */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* 48-HOUR WORKING CADENCE & SLA STRIP */}
          {(() => {
            const sla = calculate48HourWorkingSla(lead.dateCaptured || lead.dateOfFillingForm);
            const calls = lead.outreachCadence?.callsAttempted ?? lead.numberOfCalls ?? 0;
            const wa = lead.outreachCadence?.whatsappAttempted ?? 0;

            return (
              <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-[#133926] text-white p-4 rounded-2xl border border-emerald-800/80 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⏳</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black tracking-tight text-white">
                          48-Hour Working Cycle Engine
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            sla.isExpired
                              ? 'bg-rose-950 text-rose-300 border-rose-700'
                              : sla.remainingWorkingHours < 12
                              ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                          }`}
                        >
                          {sla.statusLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        Active Window: <strong className="text-white">Morning 7:00 AM – Evening 8:00 PM</strong> (13 Working Hours/Day)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
                    <span className="text-[11px] text-emerald-200">
                      Elapsed: <strong>{sla.elapsedWorkingHours}h</strong> / 48h
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Cadence Counters */}
                <div className="space-y-2">
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full transition-all duration-300 ${
                        sla.isExpired ? 'bg-rose-500' : sla.percentElapsed > 75 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, sla.percentElapsed))}%` }}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Cadence Indicators */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📞</span>
                        <span className="text-gray-300 text-[11px]">Calls:</span>
                        <span className="font-black text-white px-2 py-0.5 bg-white/10 rounded-md">
                          {calls} / 3 Attempts
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            incrementCadenceTouch(lead.id, 'Call');
                            logCall(lead.id, 'Connected', 'Direct cadence call logged');
                            setShowStatusAlert('Recorded call attempt in 48h cadence!');
                            setTimeout(() => setShowStatusAlert(null), 2500);
                          }}
                          className="text-[10px] px-2 py-0.5 bg-emerald-700/60 hover:bg-emerald-600 rounded text-emerald-100 font-bold border border-emerald-500/50 cursor-pointer"
                        >
                          + Attempt
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">💬</span>
                        <span className="text-gray-300 text-[11px]">WhatsApp:</span>
                        <span className="font-black text-white px-2 py-0.5 bg-white/10 rounded-md">
                          {wa} / 5 Touches
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            incrementCadenceTouch(lead.id, 'WhatsApp');
                            window.open(whatsAppUrl, '_blank');
                            setShowStatusAlert('Recorded WhatsApp touch in 48h cadence!');
                            setTimeout(() => setShowStatusAlert(null), 2500);
                          }}
                          className="text-[10px] px-2 py-0.5 bg-emerald-700/60 hover:bg-emerald-600 rounded text-emerald-100 font-bold border border-emerald-500/50 cursor-pointer"
                        >
                          + Touch
                        </button>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-300/80 italic">
                      Target Cadence: 3 Calls + 5 WhatsApp Touches within 48h
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ⚡ 3 CORE SALES CONVERSION PATHWAYS */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-emerald-600/30 dark:border-emerald-500/20 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight">
                    Sales Conversion Action Engine (3 Core Pathways)
                  </h2>
                </div>
                <p className="text-[11px] text-gray-500">
                  Select the primary conversion outcome for this prospect after call discovery:
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  3 Pathways Ready
                </span>
              </div>
            </div>

            {/* 3 Pathway Action Cards / Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pathway 1 */}
              <button
                type="button"
                onClick={() => setActivePathway(activePathway === 'mentor' ? 'none' : 'mentor')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activePathway === 'mentor' || lead.mentorMeeting
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-500/30'
                    : 'bg-gray-50/70 hover:bg-gray-100/80 dark:bg-gray-750 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🎓</span>
                    {lead.mentorMeeting && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-600 text-white rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 mt-1.5">
                    1. Schedule Mentor 1-on-1
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Spoke 5-6 mins → Arrange meeting with mentor on specific date
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-2 block">
                  {activePathway === 'mentor' ? '▾ Close Config' : 'Configure & Book →'}
                </span>
              </button>

              {/* Pathway 2 */}
              <button
                type="button"
                onClick={() => setActivePathway(activePathway === 'demo' ? 'none' : 'demo')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activePathway === 'demo' || lead.demoSession
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/30'
                    : 'bg-gray-50/70 hover:bg-gray-100/80 dark:bg-gray-750 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🖥️</span>
                    {lead.demoSession && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-600 text-white rounded-full">
                        Invited
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 mt-1.5">
                    2. Invite to Demo Session
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Invite candidate to upcoming live cohort demo / masterclass
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 mt-2 block">
                  {activePathway === 'demo' ? '▾ Close Config' : 'Configure & Invite →'}
                </span>
              </button>

              {/* Pathway 3 */}
              <button
                type="button"
                onClick={() => setActivePathway(activePathway === 'sale' ? 'none' : 'sale')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activePathway === 'sale' || lead.directSale
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-500/30'
                    : 'bg-gray-50/70 hover:bg-gray-100/80 dark:bg-gray-750 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg">💳</span>
                    {lead.directSale && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-purple-600 text-white rounded-full">
                        {lead.directSale.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 mt-1.5">
                    3. Direct Course Sale
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Directly close admission, share Razorpay link or EMI plan
                  </p>
                </div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 mt-2 block">
                  {activePathway === 'sale' ? '▾ Close Config' : 'Checkout & Payment →'}
                </span>
              </button>
            </div>

            {/* EXPANDED PANEL: PATHWAY 1 (MENTOR MEETING) */}
            {activePathway === 'mentor' && (
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/60 pb-2">
                  <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                    <span>🎓</span> Configure Mentor 1-on-1 Strategy Session
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    Auto-schedules task & stage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Select Mentor
                    </label>
                    <select
                      value={mentorName}
                      onChange={(e) => setMentorName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-bold"
                    >
                      {MENTOR_PRESETS.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name} — {m.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Meeting Date & Time
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={mentorMeetingDate}
                        onChange={(e) => setMentorMeetingDate(e.target.value)}
                        className="w-2/3 px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-medium"
                      />
                      <input
                        type="time"
                        value={mentorMeetingTime}
                        onChange={(e) => setMentorMeetingTime(e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Call Discovery Duration (User Reference: ~5-6 mins)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={mentorCallDurationMinutes}
                        onChange={(e) => setMentorCallDurationMinutes(Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-bold"
                      />
                      <span className="text-gray-500 font-semibold">minutes talked</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Mentor Session Duration
                    </label>
                    <select
                      value={mentorDurationMinutes}
                      onChange={(e) => setMentorDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-bold"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Meeting Link (Google Meet / Zoom)
                    </label>
                    <input
                      type="url"
                      value={mentorMeetingLink}
                      onChange={(e) => setMentorMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Discussion Summary & Agenda
                    </label>
                    <input
                      type="text"
                      value={mentorAgenda}
                      onChange={(e) => setMentorAgenda(e.target.value)}
                      placeholder="e.g. Evaluated candidate's 6y experience, looking to transition into AI PM role..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
                  <button
                    type="button"
                    onClick={handleSendMentorWhatsApp}
                    className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Confirmation
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmMentorMeeting}
                    className="px-4 py-1.5 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    ✓ Confirm Mentor Session & Move Stage
                  </button>
                </div>
              </div>
            )}

            {/* EXPANDED PANEL: PATHWAY 2 (DEMO SESSION) */}
            {activePathway === 'demo' && (
              <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-800 rounded-xl space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800/60 pb-2">
                  <h4 className="text-xs font-black text-blue-950 dark:text-blue-200 flex items-center gap-2">
                    <span>🖥️</span> Invite to Live Cohort Demo Session / Masterclass
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    Interactive Hands-On Walkthrough
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Choose Upcoming Demo Session
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {DEMO_SESSION_PRESETS.map((demo, idx) => (
                        <button
                          key={demo.title}
                          type="button"
                          onClick={() => {
                            setSelectedDemoIndex(idx);
                            setDemoLink(demo.link);
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            selectedDemoIndex === idx
                              ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-500 font-bold'
                              : 'bg-white dark:bg-gray-800 border-gray-200'
                          }`}
                        >
                          <div className="font-black text-[11px] text-gray-900 dark:text-gray-100 truncate">
                            {demo.title}
                          </div>
                          <div className="text-[10px] text-blue-700 dark:text-blue-300 mt-1">{demo.dayTiming}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">Host: {demo.host}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Custom Session Date & Time (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={demoDate}
                        onChange={(e) => setDemoDate(e.target.value)}
                        className="w-2/3 px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-medium"
                      />
                      <input
                        type="time"
                        value={demoTime}
                        onChange={(e) => setDemoTime(e.target.value)}
                        className="w-1/3 px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Live Webinar / Demo Joining Link
                    </label>
                    <input
                      type="url"
                      value={demoLink}
                      onChange={(e) => setDemoLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Invitation Notes & Candidate Focus
                    </label>
                    <input
                      type="text"
                      value={demoNotes}
                      onChange={(e) => setDemoNotes(e.target.value)}
                      placeholder="e.g. Highlighted AI agent sprint tracking workflows to candidate"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-blue-200 dark:border-blue-800/60">
                  <button
                    type="button"
                    onClick={handleSendDemoWhatsApp}
                    className="px-3.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-400 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Demo Invite
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDemoSession}
                    className="px-4 py-1.5 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    ✓ Confirm Demo Invitation
                  </button>
                </div>
              </div>
            )}

            {/* EXPANDED PANEL: PATHWAY 3 (DIRECT SALE) */}
            {activePathway === 'sale' && (
              <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-300 dark:border-purple-800 rounded-xl space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-800/60 pb-2">
                  <h4 className="text-xs font-black text-purple-950 dark:text-purple-200 flex items-center gap-2">
                    <span>💳</span> Direct Course Sale & Checkout Options
                  </h4>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    Tuition Base: ₹{baseProgramFee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Payment Plan Option
                    </label>
                    <select
                      value={salePaymentPlan}
                      onChange={(e) => {
                        const plan = e.target.value as any;
                        setSalePaymentPlan(plan);
                        if (plan === 'Token Deposit (₹5,000)') setSaleAmount(5000);
                        else if (plan === '3-Month No-Cost EMI') setSaleAmount(Math.round(baseProgramFee / 3));
                        else setSaleAmount(baseProgramFee);
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-bold"
                    >
                      <option value="Full Payment">Full Tuition (₹{baseProgramFee.toLocaleString('en-IN')})</option>
                      <option value="Token Deposit (₹5,000)">Token Seat Reservation Deposit (₹5,000)</option>
                      <option value="3-Month No-Cost EMI">
                        3-Month No-Cost EMI (₹{Math.round(baseProgramFee / 3).toLocaleString('en-IN')}/mo)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Transaction Action Status
                    </label>
                    <select
                      value={saleActionStatus}
                      onChange={(e) => setSaleActionStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-bold"
                    >
                      <option value="Payment Link Sent">Payment Link Sent (Pending Payment)</option>
                      <option value="Deposit Received">Deposit Received (₹5,000 Verified)</option>
                      <option value="Paid in Full">Paid in Full (Full Enrollment Completed)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Razorpay Checkout Payment Link
                    </label>
                    <input
                      type="url"
                      value={salePaymentLink}
                      onChange={(e) => setSalePaymentLink(e.target.value)}
                      placeholder="https://pages.razorpay.com/..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Sale Notes & Discussion Context
                    </label>
                    <input
                      type="text"
                      value={saleNotes}
                      onChange={(e) => setSaleNotes(e.target.value)}
                      placeholder="e.g. Addressed budget objection with 3-month no-cost EMI plan"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-purple-200 dark:border-purple-800/60">
                  <button
                    type="button"
                    onClick={handleSendSaleWhatsApp}
                    className="px-3.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-400 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>💬</span> WhatsApp Payment Link
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDirectSale}
                    className="px-4 py-1.5 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    ✓ Save Sale & Move to {saleActionStatus === 'Paid in Full' ? 'Converted' : 'Payment Pending'}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmed Badges if already scheduled/sold */}
            {(lead.mentorMeeting || lead.demoSession || lead.directSale) && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 flex-wrap text-xs">
                {lead.mentorMeeting && (
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 rounded-lg font-bold flex items-center gap-1.5">
                    <span>🎓</span> Mentor Meeting Booked: {lead.mentorMeeting.mentorName} ({lead.mentorMeeting.scheduledAt})
                  </span>
                )}
                {lead.demoSession && (
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 border border-blue-300 rounded-lg font-bold flex items-center gap-1.5">
                    <span>🖥️</span> Demo Invited: {lead.demoSession.sessionTitle}
                  </span>
                )}
                {lead.directSale && (
                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300 rounded-lg font-bold flex items-center gap-1.5">
                    <span>💳</span> Direct Sale: {lead.directSale.paymentPlan} ({lead.directSale.status})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CARD 1: LEAD STATUS (RADIO TILES MATCHING SCREENSHOT) */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">Lead Status</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Update the lead status and move to the appropriate stage</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 font-semibold">Current Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-[11px]">
                  {lead.crmStage}
                </span>
              </div>
            </div>

            {/* 6 Radio Style Status Cards - 3x2 Grid for optimal readability */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {statusOptions.map((item) => {
                const isSelected = lead.crmStage === item.stage || (item.stage === 'Did Not Pick The Call' && lead.crmStage === 'Did Not Receive Call');
                return (
                  <button
                    key={item.stage}
                    type="button"
                    onClick={() => handleStageClick(item.stage)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500/80 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-200 shadow-xs ring-1 ring-emerald-500/30'
                        : 'bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Radio Button Indicator */}
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1.5 ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-600' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 2: FOLLOW-UP & CALL NOTES (MATCHING SCREENSHOT) */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">Follow-Up & Call Notes</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Schedule your next follow-up and add notes</p>
                </div>
              </div>
              {lead.nextFollowUp && (
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  ⏰ Next: {lead.nextFollowUp}
                </span>
              )}
            </div>

            {/* 4 Follow-up Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Follow-Up 1 */}
              <button
                type="button"
                onClick={() => handleOpenFollowUpScheduler('Follow-Up 1')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  lead.crmStage === 'Follow-Up 1' || selectedFollowUpStage === 'Follow-Up 1'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/30'
                    : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#264e36] text-white font-black text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-gray-900 dark:text-gray-100">Follow-Up 1</div>
                    <div className="text-[10px] text-gray-400">1st Touch</div>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">📅</span>
              </button>

              {/* Follow-Up 2 */}
              <button
                type="button"
                onClick={() => handleOpenFollowUpScheduler('Follow-Up 2')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  lead.crmStage === 'Follow-Up 2' || selectedFollowUpStage === 'Follow-Up 2'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/30'
                    : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-400 dark:bg-gray-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-gray-900 dark:text-gray-100">Follow-Up 2</div>
                    <div className="text-[10px] text-gray-400">2nd Touch</div>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">📅</span>
              </button>

              {/* Follow-Up 3 */}
              <button
                type="button"
                onClick={() => handleOpenFollowUpScheduler('Follow-Up 3')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  lead.crmStage === 'Follow-Up 3' || selectedFollowUpStage === 'Follow-Up 3'
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/30'
                    : 'bg-white dark:bg-gray-800 border-gray-200/80 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-400 dark:bg-gray-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-gray-900 dark:text-gray-100">Follow-Up 3</div>
                    <div className="text-[10px] text-gray-400">3rd Touch</div>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">📅</span>
              </button>

              {/* Call Later */}
              <button
                type="button"
                onClick={() => handleOpenFollowUpScheduler('Call Later')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  lead.crmStage === 'Call Later' || selectedFollowUpStage === 'Call Later'
                    ? 'bg-amber-100/80 border-amber-500 ring-1 ring-amber-500/30'
                    : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60 hover:bg-amber-100/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center justify-center shrink-0">
                    📞
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-gray-900 dark:text-gray-100">Call Later</div>
                    <div className="text-[10px] text-amber-800/80 dark:text-amber-400">Callback</div>
                  </div>
                </div>
                <span className="text-gray-400 text-xs">📅</span>
              </button>
            </div>

            {/* Interactive Scheduler Drawer */}
            {selectedFollowUpStage && (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200">
                    🗓️ Schedule {selectedFollowUpStage} & Add Notes
                  </span>
                  <button
                    onClick={() => setSelectedFollowUpStage(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                      Choose Follow-Up Date *
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                      Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase mb-1">
                    Call Notes / Reason:
                  </label>
                  <textarea
                    rows={2}
                    value={followUpNotesInput}
                    onChange={(e) => setFollowUpNotesInput(e.target.value)}
                    placeholder={`e.g. Lead requested a callback for ${selectedFollowUpStage}. Discussed syllabus depth, fee options...`}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedFollowUpStage(null)}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFollowUpWithNotes}
                    className="px-4 py-1.5 bg-[#264e36] hover:bg-[#1a3827] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    Save & Move to {selectedFollowUpStage}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: PAYMENT & TRANSACTION STATE */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">💳</span>
                <div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-gray-100">Payment & Transaction State</h2>
                  <p className="text-[11px] text-gray-400 font-medium">Decoupled transaction lifecycle (independent of outreach stage)</p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  lead.paymentState === 'Paid in full' || lead.paymentStatus === 'Paid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : lead.paymentState === 'Payment link sent' || lead.paymentState === 'Deposit pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-gray-50 text-gray-700 border-gray-300'
                }`}
              >
                {lead.paymentState || lead.paymentStatus || 'No payment request'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (updatePaymentState) {
                    updatePaymentState(lead.id, 'Payment link sent', lead.amountPaid || 0);
                    setShowStatusAlert('Razorpay Payment link marked as Sent!');
                    setTimeout(() => setShowStatusAlert(null), 3000);
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  lead.paymentState === 'Payment link sent'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-2xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span>🔗 Link Sent</span>
                <span className="text-[10px] text-gray-400">Checkout Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (updatePaymentState) {
                    updatePaymentState(lead.id, 'Deposit received', 5000);
                    setShowStatusAlert('Recorded ₹5,000 Deposit Received!');
                    setTimeout(() => setShowStatusAlert(null), 3000);
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  lead.paymentState === 'Deposit received'
                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span>💵 Deposit (₹5k)</span>
                <span className="text-[10px] text-gray-400">Seat Reserved</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (updatePaymentState) {
                    const fullFee = lead.programId === 'ai-fellowship' ? 99999 : lead.programId === 'ai-gtm' ? 54999 : 34999;
                    updatePaymentState(lead.id, 'Paid in full', fullFee);
                    setShowStatusAlert(`Marked Paid in Full (₹${fullFee.toLocaleString('en-IN')})!`);
                    setTimeout(() => setShowStatusAlert(null), 3000);
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  lead.paymentState === 'Paid in full' || lead.paymentStatus === 'Paid'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span>✅ Paid in Full</span>
                <span className="text-[10px] text-gray-400">Enrolled Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (updatePaymentState) {
                    updatePaymentState(lead.id, 'Refunded', 0);
                    setShowStatusAlert('Transaction marked as Refunded.');
                    setTimeout(() => setShowStatusAlert(null), 3000);
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  lead.paymentState === 'Refunded'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-2xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                <span>↩️ Refunded</span>
                <span className="text-[10px] text-gray-400">Cancelled Deal</span>
              </button>
            </div>
          </div>

          {/* 3. NAVIGATION TABS */}
          <div className="flex items-center gap-6 border-b border-gray-200/80 dark:border-gray-800 px-2 pt-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'border-[#264e36] text-[#264e36] dark:text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>👤</span> Profile & Background
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'border-[#264e36] text-[#264e36] dark:text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>🧠</span> AI Intelligence & Scores
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-[#264e36] text-[#264e36] dark:text-emerald-400'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>📝</span> Notes & Activities ({lead.callNotesHistory?.length || 0})
            </button>
          </div>

          {/* 4. TAB CONTENT: PROFILE & BACKGROUND */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Feature: Dedicated Meta Form Qualifying Questions Card */}
              <div className="bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-750 p-5 rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 dark:border-gray-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs font-black">
                      📋
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Form Qualifying Questions & Responses
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                          Verified Meta Form
                        </span>
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Exact candidate answers to the 13 inbound qualification questions
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-gray-500 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Submitted: </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      {lead.dateOfFillingForm || (lead.dateCaptured ? lead.dateCaptured.substring(0, 10) : 'Recent')}
                    </span>
                    {lead.createdTime && (
                      <span className="text-gray-400 ml-1">({lead.createdTime.split(' ')[1] || lead.createdTime})</span>
                    )}
                  </div>
                </div>

                {/* 13 Qualifying Questions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 1. Date of Filling the Form */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      📅 Date of Filling the Form
                    </span>
                    <div className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                      {lead.dateOfFillingForm || (lead.dateCaptured ? lead.dateCaptured.substring(0, 10) : '2026-09-26')}
                    </div>
                  </div>

                  {/* 2. Created Time */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      ⏰ Created Time
                    </span>
                    <div className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                      {lead.createdTime || lead.dateCaptured || '11:30 AM'}
                    </div>
                  </div>

                  {/* 3. Full Name */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      👤 Full Name
                    </span>
                    <div className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                      {lead.fullName}
                    </div>
                  </div>

                  {/* 4. Phone Number */}
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                      📞 Mobile Phone
                    </span>
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-xs font-black text-emerald-900 dark:text-emerald-200 hover:underline block"
                    >
                      {lead.phone}
                    </a>
                  </div>

                  {/* 5. Email */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      ✉️ Email Address
                    </span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs font-bold text-gray-800 dark:text-gray-200 hover:underline truncate block"
                    >
                      {lead.email}
                    </a>
                  </div>

                  {/* 6. Current Role */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      💼 Current Role
                    </span>
                    <div className="text-xs font-extrabold text-gray-800 dark:text-gray-200 capitalize">
                      {String(lead.currentRole || '---').replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* 7. Experience */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      ⏳ Experience
                    </span>
                    <div className="text-xs font-extrabold text-gray-800 dark:text-gray-200 capitalize">
                      {lead.experience ? lead.experience.replace(/_/g, ' ') : `${lead.yearsOfExperience || 5} years`}
                    </div>
                  </div>

                  {/* 8. AI Usage */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      🤖 AI Usage
                    </span>
                    <div className="text-xs font-extrabold text-blue-800 dark:text-blue-300 capitalize">
                      {String(lead.aiUsage || lead.currentAiUsageLevel || 'Not using AI professionally yet').replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* 9. City */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      📍 City
                    </span>
                    <div className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                      {lead.city || 'Bengaluru'}
                    </div>
                  </div>

                  {/* 10. Education */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      🎓 Education
                    </span>
                    <div className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                      {lead.education || 'Graduate / Professional'}
                    </div>
                  </div>

                  {/* 11. Timeline / When */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      ⚡ Desired Timeline
                    </span>
                    <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 capitalize">
                      {lead.expectedTimeline ? lead.expectedTimeline.replace(/_/g, ' ') : 'Immediately'}
                    </div>
                  </div>

                  {/* 12. Preferred Contact Time */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/90 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      ⏰ Preferred Contact Time
                    </span>
                    <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300">
                      {lead.preferredContactTime ? lead.preferredContactTime.replace(/_/g, ' ') : '6 PM – 9 PM'}
                    </div>
                  </div>
                </div>

                {/* 3 High-Impact Qualification Highlight Rows: Goal, Blocker & Investment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Goal */}
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 dark:text-emerald-200">
                      <span>🎯</span> Primary Goal
                    </div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 capitalize">
                      {String(lead.goal || lead.primaryGoal || 'Increase my earning potential').replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Blocker */}
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-900 dark:text-rose-200">
                      <span>⚠️</span> Main Blocker
                    </div>
                    <div className="text-xs font-bold text-rose-800 dark:text-rose-300 capitalize">
                      {String(lead.blocker || lead.mainChallenge || "Don't know what AI skills are actually relevant").replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Investment / Budget */}
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-200">
                      <span>💰</span> Investment / Budget
                    </div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200 capitalize">
                      {String(lead.investment || '₹34,999 is currently outside my budget').replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Standard Lead Profile Details Container */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs">
                      📇
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">Company & Role Overview</h3>
                      <p className="text-[11px] text-gray-400 font-medium">Professional background and current organization</p>
                    </div>
                  </div>
                  
                  <select
                    value={lead.crmStage}
                    onChange={(e) => handleStageClick(e.target.value as Stage)}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-100 cursor-pointer"
                  >
                    <option value={lead.crmStage}>{lead.crmStage}</option>
                    {secondaryStages.filter(s => s !== lead.crmStage).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                      🏢
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-gray-400">Current Company</div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {lead.currentCompany || 'Digital Operations'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                      🔗
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-gray-400">Source Channel</div>
                      <div className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
                        {lead.source || 'Meta Lead Ads Form'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open 360 Profile Guided Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenFullProfile}
                    className="px-4 py-2.5 bg-[#f0fdf4] hover:bg-[#dcfce7] dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
                  >
                    <span>✨</span> Open 360° AI Profile & Guided Call Script <span>❯</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI INTELLIGENCE & SCORES */}
          {activeTab === 'ai' && (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                  AI Fit & Urgency Intelligence
                </h3>
                <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                  Fit Score: {lead.fitScore}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Career Relevance Fit</div>
                  <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{lead.fitScore}%</div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    High mapping between {lead.yearsOfExperience}y experience and agentic orchestration.
                  </p>
                </div>
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-200">Buying Intent Score</div>
                  <div className="text-2xl font-black text-blue-900 dark:text-blue-100">{lead.intentScore || 75}%</div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Urgent career transition timeline indicates strong conversion readiness.
                  </p>
                </div>
              </div>

              {lead.recommendedOpening && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-1">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-200">🎯 AI Opening Hook for Call</div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{lead.recommendedOpening}"</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NOTES & ACTIVITIES */}
          {activeTab === 'notes' && (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-4">
              <form onSubmit={handleAddQuickNote} className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Add Call Note / Discussion Update
                </label>
                <textarea
                  rows={3}
                  value={callNoteText}
                  onChange={(e) => setCallNoteText(e.target.value)}
                  placeholder="e.g. Spoke to lead. Very interested in AI-PM curriculum. Scheduled next follow-up call..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#264e36] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    💾 Save Note to Database
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="text-xs font-bold text-gray-400 uppercase">Past Notes ({lead.callNotesHistory?.length || 0})</div>
                {(!lead.callNotesHistory || lead.callNotesHistory.length === 0) ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-xs text-gray-400 text-center">
                    No notes recorded yet.
                  </div>
                ) : (
                  lead.callNotesHistory.map((n, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                        <span>👤 {n.salesperson || 'Sales Team'}</span>
                        <span>🕒 {n.date || 'Recent'}</span>
                      </div>
                      <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{n.rawNotes}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 dark:border-red-900/60 space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-xl font-bold shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Permanently Delete Lead?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-gray-100 font-bold">{lead.fullName}</strong> from the database and CRM pipeline? All associated notes and follow-up schedules will be removed.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteLead(lead.id);
                  if (onDelete) onDelete(lead.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                🗑️ Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
