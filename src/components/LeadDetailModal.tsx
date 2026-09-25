// @ts-nocheck
// src/components/LeadDetailModal.tsx
import React, { useState } from 'react';
import type { Lead, Stage } from '../types';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStageChange?: (newStage: Stage) => void;
  onDelete?: (leadId: string) => void;
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

export default function LeadDetailModal({ lead, isOpen, onClose, onStageChange, onDelete }: LeadDetailModalProps) {
  const { updateLeadStage, addCallNote, updateLeadFollowUp, setSelectedLeadId, deleteLead } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'notes'>('details');
  const [callNoteText, setCallNoteText] = useState('');
  const [showStatusAlert, setShowStatusAlert] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    { stage: 'Did Not Pick The Call', label: 'Did Not Pick The Call', icon: '🚫', isDanger: true },
    { stage: 'Not Interested', label: 'Not Interested', icon: '🔴', isDanger: true },
    { stage: 'Unqualified', label: 'Unqualified', icon: '🚫', isDanger: true },
  ];

  const secondaryStages: Stage[] = [
    'New Lead',
    'Connected',
    'Details Sent on WhatsApp',
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
    setShowStatusAlert(`Status updated to "${stage}"!`);
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
    setShowStatusAlert(`🎉 Follow-up scheduled for ${combinedDate}`);
    setSelectedFollowUpStage(null);
    setFollowUpNotesInput('');
    setTimeout(() => setShowStatusAlert(null), 3500);
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNoteText.trim()) return;
    addCallNote(lead.id, callNoteText.trim());
    setCallNoteText('');
    setShowStatusAlert('Note saved to database!');
    setTimeout(() => setShowStatusAlert(null), 3000);
  };

  const handleOpenFullProfile = () => {
    setSelectedLeadId(lead.id);
    onClose();
    navigate('/profile');
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
            
            <div className="min-w-0 space-y-1">
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

              {/* Subtitle details row: Role | Experience | Collected Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 flex-wrap font-medium">
                <span className="flex items-center gap-1.5">
                  <span>💼</span> {lead.professionalStatus || lead.currentRole || 'Professional'}
                </span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1.5">
                  <span>⏳</span> {lead.yearsOfExperience || 11} yrs exp
                </span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="flex items-center gap-1.5">
                  <span>📅</span> Collected: {formatCollectionDateTime(lead.dateCaptured)}
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
                  className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 shadow-2xs transition-all"
                  title="Direct Phone Call"
                >
                  <span>📞</span> Call
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

            {/* 5 Radio Style Status Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {statusOptions.map((item) => {
                const isSelected = lead.crmStage === item.stage || (item.stage === 'Did Not Pick The Call' && lead.crmStage === 'Did Not Receive Call');
                return (
                  <button
                    key={item.stage}
                    type="button"
                    onClick={() => handleStageClick(item.stage)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500/80 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-200 shadow-xs'
                        : 'bg-white dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-sm">{item.icon}</span>
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
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs">
                    📇
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">Lead Information</h3>
                    <p className="text-[11px] text-gray-400 font-medium">Key details about this lead</p>
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

              {/* 6 Key Detail Boxes in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Job Role */}
                <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                    👤
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-gray-400">Job Role</div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      {lead.currentRole || '---'}
                    </div>
                  </div>
                </div>

                {/* 2. Company */}
                <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                    🏢
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-gray-400">Company</div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      {lead.currentCompany || '---'}
                    </div>
                  </div>
                </div>

                {/* 3. Education */}
                <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                    🎓
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-gray-400">Education</div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      {lead.education || '---'}
                    </div>
                  </div>
                </div>

                {/* 4. Graduate / Professional */}
                <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                    👥
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-gray-400">Graduate / Professional</div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      {lead.professionalStatus || '---'}
                    </div>
                  </div>
                </div>

                {/* 5. Investment Budget */}
                <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    ₹
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-gray-400">Investment Budget</div>
                    <div className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
                      {lead.investment || '₹25k - ₹50k'}
                    </div>
                  </div>
                </div>

                {/* 6. Lead Source */}
                <div className="p-3 bg-gray-50/70 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                    🔗
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-gray-400">Lead Source</div>
                    <div className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
                      {lead.source || 'CSV Import'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 Highlight Banners: Primary Goal & Main Blocker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Primary Goal Banner */}
                <div className="p-4 bg-[#f0fdf4] dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800/80 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center text-sm shrink-0">
                    🎯
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                      Primary Goal
                    </div>
                    <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 break-words font-mono text-[11px]">
                      {lead.primaryGoal || 'become_capable_of_managing_ai-powered_teams_and_agents'}
                    </div>
                  </div>
                </div>

                {/* Main Blocker / Challenge Banner */}
                <div className="p-4 bg-[#fef2f2] dark:bg-rose-950/40 border border-red-200/90 dark:border-rose-900/80 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-rose-900 text-red-700 dark:text-rose-200 flex items-center justify-center text-sm shrink-0">
                    ⚠️
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-extrabold text-red-700 dark:text-red-300">
                      Main Blocker / Challenge
                    </div>
                    <div className="text-xs font-semibold text-red-600 dark:text-rose-300 break-words font-mono text-[11px]">
                      {lead.mainChallenge || 'i_lack_practical_ai_skills'}
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
