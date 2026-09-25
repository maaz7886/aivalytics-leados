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

function formatCollectionDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch {}
  return String(dateStr).split('T')[0] || String(dateStr);
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

  // Follow-Up Scheduler State (User Requirement)
  const [selectedFollowUpStage, setSelectedFollowUpStage] = useState<Stage | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [followUpTime, setFollowUpTime] = useState<string>('11:00');
  const [followUpNotesInput, setFollowUpNotesInput] = useState<string>('');

  if (!isOpen || !lead) return null;

  const primaryStages: { stage: Stage; label: string; icon: string; activeClass: string; hoverClass: string }[] = [
    {
      stage: 'Qualified',
      label: 'Qualified',
      icon: '🌟',
      activeClass: 'bg-emerald-600 text-white ring-2 ring-emerald-400 font-black shadow-md',
      hoverClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
    },
    {
      stage: 'Interested',
      label: 'Interested',
      icon: '💬',
      activeClass: 'bg-blue-600 text-white ring-2 ring-blue-400 font-black shadow-md',
      hoverClass: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-100'
    },
    {
      stage: 'Did Not Pick The Call',
      label: 'Did Not Pick The Call',
      icon: '📵',
      activeClass: 'bg-orange-600 text-white ring-2 ring-orange-400 font-black shadow-md',
      hoverClass: 'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-700 hover:bg-orange-100'
    },
    {
      stage: 'Not Interested',
      label: 'Not Interested',
      icon: '🔴',
      activeClass: 'bg-rose-600 text-white ring-2 ring-rose-400 font-black shadow-md',
      hoverClass: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-100'
    },
    {
      stage: 'Unqualified',
      label: 'Unqualified',
      icon: '🚫',
      activeClass: 'bg-gray-700 text-white ring-2 ring-gray-400 font-black shadow-md',
      hoverClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200'
    }
  ];

  const followUpStages: { stage: Stage; label: string; icon: string; countLabel: string; bgClass: string; activeClass: string }[] = [
    {
      stage: 'Follow-Up 1',
      label: 'Follow-Up 1',
      icon: '1️⃣',
      countLabel: '1st Touch',
      bgClass: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-100',
      activeClass: 'bg-purple-600 text-white ring-2 ring-purple-400 font-black shadow-md'
    },
    {
      stage: 'Follow-Up 2',
      label: 'Follow-Up 2',
      icon: '2️⃣',
      countLabel: '2nd Touch',
      bgClass: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-100',
      activeClass: 'bg-indigo-600 text-white ring-2 ring-indigo-400 font-black shadow-md'
    },
    {
      stage: 'Follow-Up 3',
      label: 'Follow-Up 3',
      icon: '3️⃣',
      countLabel: '3rd Touch',
      bgClass: 'bg-pink-50 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border-pink-300 dark:border-pink-700 hover:bg-pink-100',
      activeClass: 'bg-pink-600 text-white ring-2 ring-pink-400 font-black shadow-md'
    },
    {
      stage: 'Call Later',
      label: 'Call Later',
      icon: '📞',
      countLabel: 'Callback',
      bgClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100',
      activeClass: 'bg-amber-600 text-white ring-2 ring-amber-400 font-black shadow-md'
    }
  ];

  const secondaryStages: Stage[] = [
    'New Lead',
    'Connected',
    'Details Sent on WhatsApp',
    'Payment Pending',
    'Joined Session',
    'Converted',
    'Lost'
  ];

  const handleStageClick = (stage: Stage) => {
    updateLeadStage(lead.id, stage);
    if (onStageChange) onStageChange(stage);
    setSelectedFollowUpStage(null);
    setShowStatusAlert(`Moved to "${stage}" column successfully!`);
    setTimeout(() => setShowStatusAlert(null), 3500);
  };

  const handleOpenFollowUpScheduler = (stage: Stage) => {
    setSelectedFollowUpStage(stage);
    if (stage === 'Follow-Up 1') handleSetPresetDate(1);
    else if (stage === 'Follow-Up 2') handleSetPresetDate(2);
    else if (stage === 'Follow-Up 3') handleSetPresetDate(3);
    else if (stage === 'Call Later') handleSetPresetDate(1);
  };

  const handleSetPresetDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
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
    setShowStatusAlert(`🎉 Moved to "${selectedFollowUpStage}"! Follow-up scheduled for ${combinedDate}`);
    setSelectedFollowUpStage(null);
    setFollowUpNotesInput('');
    setTimeout(() => setShowStatusAlert(null), 4000);
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNoteText.trim()) return;
    addCallNote(lead.id, callNoteText.trim());
    setCallNoteText('');
    setShowStatusAlert('Call note saved & synced to Supabase database!');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
              {lead.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 truncate">
                  {lead.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {lead.crmStage}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                  {lead.programName || 'AI Program'}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2.5 flex-wrap">
                <span>{lead.currentRole || 'Professional'} {lead.currentCompany ? `@ ${lead.currentCompany}` : ''}</span>
                {lead.city && <span>• 📍 {lead.city}</span>}
                <span>• ⏳ {lead.yearsOfExperience || 0} yrs exp</span>
                <span className="text-primary-700 dark:text-primary-300 font-bold bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800">
                  📥 Collected: {formatCollectionDateTime(lead.dateCaptured)}
                </span>
                {lead.nextFollowUp && (
                  <span className="text-amber-700 dark:text-amber-300 font-extrabold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    ⏰ Follow-Up: {lead.nextFollowUp}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Contact Buttons & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {lead.phone && (
              <>
                <a
                  href={`tel:${lead.phone}`}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  title="Direct Phone Call"
                >
                  📞 Call
                </a>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
                  title="Open WhatsApp Chat"
                >
                  💬 WhatsApp
                </a>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-200 dark:border-red-800/80 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Delete this lead permanently"
            >
              🗑️ Delete
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-all ml-1"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PROMINENT STAGE MOVER & FOLLOW-UP SCHEDULER BAR (User Requirement) */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800/50 dark:via-gray-900 dark:to-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-800 space-y-3.5">
          {/* Section A: Direct Status Column Movers */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <span>🎯 Move to Status Column:</span>
              </div>
              {lead.crmStage && (
                <span className="text-xs text-gray-500 font-medium">
                  Current: <strong className="text-primary-600 dark:text-primary-400">{lead.crmStage}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {primaryStages.map((item) => {
                const isCurrent = lead.crmStage === item.stage || 
                  (item.stage === 'Did Not Pick The Call' && lead.crmStage === 'Did Not Receive Call');

                return (
                  <button
                    key={item.stage}
                    onClick={() => handleStageClick(item.stage)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrent ? item.activeClass : item.hoverClass
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                    {isCurrent && <span className="text-[10px] font-black uppercase opacity-90">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Follow-Up Buttons with Date & Call Notes (User Requirement) */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700/60">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <span>📅 Schedule Follow-Up & Log Call Notes:</span>
                <span className="text-gray-400 font-normal normal-case">(Click to choose date & add notes)</span>
              </div>
              {lead.nextFollowUp && (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  ⏰ Next: {lead.nextFollowUp}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {followUpStages.map((item) => {
                const isCurrent = lead.crmStage === item.stage ||
                  (item.stage === 'Call Later' && lead.crmStage === 'Call Pending');
                const isSelected = selectedFollowUpStage === item.stage;

                return (
                  <button
                    key={item.stage}
                    onClick={() => handleOpenFollowUpScheduler(item.stage)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md'
                        : isCurrent
                        ? item.activeClass
                        : item.bgClass
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] opacity-80 font-medium">
                      {isCurrent ? '✓ Current Stage' : item.countLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section C: Interactive Follow-Up Scheduler Drawer */}
          {selectedFollowUpStage && (
            <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200">
                    🗓️ Schedule {selectedFollowUpStage}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Pick date & add call notes to move lead into column
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFollowUpStage(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {/* Date & Time Row with Quick Presets */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(0)}
                    className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 border border-indigo-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-indigo-800 dark:text-indigo-300 cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(1)}
                    className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 border border-indigo-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-indigo-800 dark:text-indigo-300 cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(2)}
                    className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 border border-indigo-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-indigo-800 dark:text-indigo-300 cursor-pointer"
                  >
                    In 2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(3)}
                    className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 border border-indigo-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-indigo-800 dark:text-indigo-300 cursor-pointer"
                  >
                    In 3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(7)}
                    className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-gray-700 border border-indigo-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-indigo-800 dark:text-indigo-300 cursor-pointer"
                  >
                    In 1 Week
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Choose Follow-Up Date *
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-gray-900 dark:text-gray-100 font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Preferred Time (Optional)
                    </label>
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-gray-900 dark:text-gray-100 font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Call Notes Input */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Call Notes / Follow-Up Reason & Discussion Summary:
                </label>
                <textarea
                  rows={2}
                  value={followUpNotesInput}
                  onChange={(e) => setFollowUpNotesInput(e.target.value)}
                  placeholder={`e.g. Lead requested a callback for ${selectedFollowUpStage}. Discussed syllabus depth, fee options, and need to follow up...`}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedFollowUpStage(null)}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFollowUpWithNotes}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <span>💾</span> Save Follow-Up & Move to {selectedFollowUpStage}
                </button>
              </div>
            </div>
          )}

          {/* Secondary Stages Dropdown */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-gray-400">Other Pipeline Columns:</span>
            <select
              value={lead.crmStage}
              onChange={(e) => handleStageClick(e.target.value as Stage)}
              className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <option disabled value="">Select other column...</option>
              {secondaryStages.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Animated Success Banner */}
          {showStatusAlert && (
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
              <span>✅</span> {showStatusAlert}
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-6 bg-white dark:bg-gray-900">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'details'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            📋 Profile & Background
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>🧠</span> AI Intelligence & Scores
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>📝</span> Notes & Activities ({lead.callNotesHistory?.length || 0})
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50 dark:bg-gray-900/50">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Row 1: Contact & Profile Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-primary-50/60 dark:bg-primary-950/40 rounded-xl border border-primary-200 dark:border-primary-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 flex items-center gap-1">
                    <span>📥</span> Date of Collecting
                  </div>
                  <div className="text-sm font-extrabold text-primary-950 dark:text-primary-100 mt-1">
                    {formatCollectionDateTime(lead.dateCaptured)}
                  </div>
                </div>
                <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <span>⏰</span> Next Follow-Up Date
                  </div>
                  <div className="text-sm font-extrabold text-amber-950 dark:text-amber-100 mt-1">
                    {lead.nextFollowUp || 'Not scheduled yet'}
                  </div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Phone Number</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.phone || 'Not Provided'}</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Email Address</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1 truncate">{lead.email || 'Not Provided'}</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Location</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.city || 'India'} {lead.state ? `, ${lead.state}` : ''}</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Current Role</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.currentRole || 'Professional'}</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Experience</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.yearsOfExperience || 0} Years</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">AI Usage Level</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.currentAiUsageLevel || 'Beginner'}</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Education</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.education || 'Graduate / Professional'}</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Investment Budget</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.investment || '₹25k - ₹50k'}</div>
                </div>
                <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Lead Source</div>
                  <div className="text-sm font-extrabold text-gray-900 dark:text-gray-100 mt-1">{lead.source || 'Meta Lead Ads'}</div>
                </div>
              </div>

              {/* Row 2: Aspirations & Blockers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                    <span>🎯</span> Primary Goal
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {lead.primaryGoal || 'Upskill in current role and transition to AI operations'}
                  </p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <span>⚠️</span> Main Blocker / Challenge
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {lead.mainChallenge || 'Lacks hands-on AI workflow experience to stay competitive'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-5">
              {/* Scores Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">AI Fit Score</div>
                    <div className="text-2xl font-black text-primary-600 dark:text-primary-400 mt-0.5">{lead.fitScore || 85}/100</div>
                  </div>
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Intent Score</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{lead.intentScore || 75}/100</div>
                  </div>
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Temperature</div>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{lead.leadTemperature || 'Hot'}</div>
                  </div>
                  <span className="text-2xl">🌡️</span>
                </div>
              </div>

              {/* Positioning & Pitch */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  💡 Recommended Positioning
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                  {lead.recommendedPositioning || `Position ${lead.programName} as an AI execution multiplier for their ${lead.currentRole || 'domain'} background rather than beginner education.`}
                </p>
              </div>

              {/* Recommended Opening Line */}
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  📞 Recommended Call Opening
                </div>
                <p className="text-sm text-indigo-950 dark:text-indigo-100 font-semibold italic">
                  "{lead.recommendedOpening || `Hi ${lead.fullName.split(' ')[0]}, seeing your experience in ${lead.currentRole || 'tech'}, the question is how you add AI agent orchestration on top of your existing domain knowledge.`}"
                </p>
              </div>

              {/* Discovery Questions */}
              {lead.discoveryQuestions && lead.discoveryQuestions.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    ❓ Top Discovery Questions to Ask
                  </div>
                  <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 list-disc list-inside">
                    {lead.discoveryQuestions.map((q, idx) => (
                      <li key={idx} className="leading-relaxed">{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-5">
              {/* Add Note Input */}
              <form onSubmit={handleAddQuickNote} className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Add Call Note / Meeting Update
                </label>
                <textarea
                  rows={3}
                  value={callNoteText}
                  onChange={(e) => setCallNoteText(e.target.value)}
                  placeholder="e.g. Lead called back. Interested in upcoming Saturday cohort. Discussed fee and payment options..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer transition-all"
                  >
                    💾 Save Note to Database
                  </button>
                </div>
              </form>

              {/* Notes History */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Past Notes & Timeline ({lead.callNotesHistory?.length || 0})
                </div>
                {(!lead.callNotesHistory || lead.callNotesHistory.length === 0) ? (
                  <div className="text-xs text-gray-400 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                    No notes recorded yet. Add your first call update above.
                  </div>
                ) : (
                  lead.callNotesHistory.map((n, idx) => (
                    <div key={n.id || idx} className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                        <span>👤 {n.salesperson || 'Sales Team'}</span>
                        <span>🕒 {n.date || 'Recent'}</span>
                      </div>
                      <p className="text-xs text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">
                        {n.rawNotes}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={handleOpenFullProfile}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span> Open 360° AI Profile & Guided Call Script
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl border border-red-200 dark:border-red-800/80 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              🗑️ Delete Lead
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
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
