// src/components/LeadDetailModal.tsx
import React, { useState, useEffect } from 'react';
import type { Lead, Stage, MentorMeeting, DemoSession, DirectSale } from '../types';
import { useApp } from '../context/AppContext';
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

  const [activeActionTab, setActiveActionTab] = useState<'mentor' | 'demo' | 'sale' | 'followup' | 'notes'>('followup');
  const [callNoteText, setCallNoteText] = useState('');
  const [toastAlert, setToastAlert] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Pathway 1: Mentor Form State
  const [mentorName, setMentorName] = useState(MENTOR_PRESETS[0].name);
  const [mentorDate, setMentorDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [mentorTime, setMentorTime] = useState('16:00');
  const [mentorCallMinutes, setMentorCallMinutes] = useState(5);
  const [mentorLink, setMentorLink] = useState('https://meet.google.com/aiv-mentor-session');
  const mentorDuration = 30;
  const mentorAgenda = '1-on-1 AI Career Transition & Curriculum Alignment';

  // Pathway 2: Demo Form State
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(0);
  const [demoDate, setDemoDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [demoTime, setDemoTime] = useState('11:00');
  const [demoLink, setDemoLink] = useState(DEMO_SESSION_PRESETS[0].link);

  // Pathway 3: Direct Sale Form State
  const baseProgramFee =
    lead?.programId === 'ai-fellowship' ? 99999 : lead?.programId === 'ai-gtm' ? 54999 : 34999;
  const [salePlan, setSalePlan] = useState<'Full Payment' | 'Token Deposit (₹5,000)' | '3-Month No-Cost EMI'>('Full Payment');
  const [saleStatus, setSaleStatus] = useState<'Payment Link Sent' | 'Deposit Received' | 'Paid in Full'>('Payment Link Sent');
  const [saleLink, setSaleLink] = useState(lead?.paymentLink || 'https://pages.razorpay.com/aivalytics-checkout');

  // Custom Follow-up State
  const [nextStage, setNextStage] = useState<Stage>('Interested');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [nextFollowUpTime, setNextFollowUpTime] = useState('11:00');
  const [followUpNotes, setFollowUpNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialPathway === 'mentor') setActiveActionTab('mentor');
      else if (initialPathway === 'demo') setActiveActionTab('demo');
      else if (initialPathway === 'sale') setActiveActionTab('sale');
      else setActiveActionTab('followup');
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

  const handleConfirmDemo = () => {
    const scheduledAt = `${demoDate} ${demoTime}`;
    const preset = DEMO_SESSION_PRESETS[selectedDemoIdx] || DEMO_SESSION_PRESETS[0];
    const payload: Omit<DemoSession, 'id' | 'createdAt'> = {
      sessionTitle: preset.title,
      scheduledAt,
      durationMinutes: preset.durationMinutes,
      sessionLink: demoLink || preset.link,
      hostName: preset.host,
      status: 'Invited',
      notes: `Invited to ${preset.title}`
    };
    inviteDemoSession(lead.id, payload, 120, payload.notes);

    const msg = generateDemoWhatsAppMessage(lead.fullName, { ...payload, id: 'temp', createdAt: '' });
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');

    showNotification(`✓ Demo invite scheduled & WhatsApp sent!`);
  };

  const handleConfirmSale = () => {
    const amount = salePlan === 'Token Deposit (₹5,000)' ? 5000 : salePlan === '3-Month No-Cost EMI' ? Math.round(baseProgramFee / 3) : baseProgramFee;
    const payload: Omit<DirectSale, 'id' | 'createdAt'> = {
      programId: lead.programId,
      programName: lead.programName || 'AI Cohort',
      tuitionFee: baseProgramFee,
      finalAmount: amount,
      paymentPlan: salePlan,
      paymentLink: saleLink,
      status: saleStatus,
      notes: `Direct sale: ${salePlan} - ${saleStatus}`
    };
    initiateDirectSale(lead.id, payload, 300, payload.notes);

    const msg = generateDirectSaleWhatsAppMessage(lead.fullName, { ...payload, id: 'temp', createdAt: '' });
    window.open(`https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    incrementCadenceTouch(lead.id, 'WhatsApp');

    showNotification(`✓ Direct sale saved & checkout link sent!`);
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
                    logCall(lead.id, 'Connected', 'Outgoing call');
                    incrementCadenceTouch(lead.id, 'Call');
                    showNotification('Call logged');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>📞</span> Call
                </a>
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
          <div className="md:col-span-7 space-y-4">
            {/* Segmented Action Tabs */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-850 space-y-3">
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
                  onClick={() => setActiveActionTab('followup')}
                  className={`py-1.5 rounded-md transition-colors ${
                    activeActionTab === 'followup' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  📞 Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('mentor')}
                  className={`py-1.5 rounded-md transition-colors ${
                    activeActionTab === 'mentor' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  🎓 Mentor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('demo')}
                  className={`py-1.5 rounded-md transition-colors ${
                    activeActionTab === 'demo' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  🖥️ Demo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveActionTab('sale')}
                  className={`py-1.5 rounded-md transition-colors ${
                    activeActionTab === 'sale' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-2xs' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  💳 Sale
                </button>
              </div>

              {/* Tab 1 Content: Standard Follow-up */}
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

              {/* Tab 2 Content: Pathway 1 (Mentor 1-on-1) */}
              {activeActionTab === 'mentor' && (
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Mentor</label>
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
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Date & Time</label>
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Call Duration</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={mentorCallMinutes}
                        onChange={(e) => setMentorCallMinutes(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-semibold"
                        placeholder="5 minutes talked"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Meeting Link</label>
                      <input
                        type="url"
                        value={mentorLink}
                        onChange={(e) => setMentorLink(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmMentor}
                      className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🎓</span> Confirm & Open WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3 Content: Pathway 2 (Demo Session) */}
              {activeActionTab === 'demo' && (
                <div className="space-y-2.5 text-xs pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Choose Upcoming Demo</label>
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

                  <div className="grid grid-cols-2 gap-2">
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
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Webinar Link</label>
                      <input
                        type="url"
                        value={demoLink}
                        onChange={(e) => setDemoLink(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmDemo}
                      className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🖥️</span> Confirm & Open WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4 Content: Pathway 3 (Direct Sale) */}
              {activeActionTab === 'sale' && (
                <div className="space-y-2.5 text-xs pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Payment Plan</label>
                      <select
                        value={salePlan}
                        onChange={(e) => setSalePlan(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-semibold"
                      >
                        <option value="Full Payment">Full Tuition (₹{baseProgramFee.toLocaleString('en-IN')})</option>
                        <option value="Token Deposit (₹5,000)">Token Deposit (₹5,000)</option>
                        <option value="3-Month No-Cost EMI">3-Month No-Cost EMI (₹{Math.round(baseProgramFee / 3).toLocaleString('en-IN')}/mo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Payment Status</label>
                      <select
                        value={saleStatus}
                        onChange={(e) => setSaleStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-semibold"
                      >
                        <option value="Payment Link Sent">Payment Link Sent</option>
                        <option value="Deposit Received">Deposit Received (₹5,000)</option>
                        <option value="Paid in Full">Paid in Full (Enrolled)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Razorpay Checkout Link</label>
                    <input
                      type="url"
                      value={saleLink}
                      onChange={(e) => setSaleLink(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmSale}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>💳</span> Save Sale & Open WhatsApp
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

            {/* Clean Timeline History */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Activity & Notes History ({lead.callNotesHistory?.length || 0})
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(!lead.callNotesHistory || lead.callNotesHistory.length === 0) ? (
                  <p className="text-xs text-gray-400 italic py-2">No notes logged yet for this lead.</p>
                ) : (
                  lead.callNotesHistory.map((note) => (
                    <div
                      key={note.id}
                      className="p-2.5 bg-gray-50/70 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{note.salesperson || 'Rep'}</span>
                        <span>{formatDateTime(note.date)}</span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-xs leading-relaxed">
                        {note.rawNotes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
