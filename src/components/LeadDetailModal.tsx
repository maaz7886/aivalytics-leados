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
}

export default function LeadDetailModal({ lead, isOpen, onClose, onStageChange }: LeadDetailModalProps) {
  const { updateLeadStage, addCallNote, setSelectedLeadId } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'details' | 'ai' | 'notes'>('details');
  const [callNoteText, setCallNoteText] = useState('');
  const [showStatusAlert, setShowStatusAlert] = useState<string | null>(null);
  const [callbackDateTime, setCallbackDateTime] = useState('');
  const [showCallbackInput, setShowCallbackInput] = useState(false);

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
      stage: 'Call Later',
      label: 'Call Later',
      icon: '📞',
      activeClass: 'bg-amber-600 text-white ring-2 ring-amber-400 font-black shadow-md',
      hoverClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
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

  const secondaryStages: Stage[] = [
    'New Lead',
    'Connected',
    'Details Sent on WhatsApp',
    'Follow-Up 1',
    'Follow-Up 2',
    'Follow-Up 3',
    'Payment Pending',
    'Joined Session',
    'Converted',
    'Lost'
  ];

  const handleStageClick = (stage: Stage) => {
    updateLeadStage(lead.id, stage);
    if (onStageChange) onStageChange(stage);
    
    if (stage === 'Call Later') {
      setShowCallbackInput(true);
    } else {
      setShowCallbackInput(false);
    }

    setShowStatusAlert(`Moved to "${stage}" column successfully!`);
    setTimeout(() => setShowStatusAlert(null), 3500);
  };

  const handleSaveCallbackSchedule = () => {
    if (!callbackDateTime) return;
    addCallNote(lead.id, `Scheduled Callback: ${callbackDateTime}`);
    setShowStatusAlert(`Callback reminder scheduled for ${callbackDateTime}`);
    setShowCallbackInput(false);
    setTimeout(() => setShowStatusAlert(null), 3500);
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
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-3 flex-wrap">
                <span>{lead.currentRole || 'Professional'} {lead.currentCompany ? `@ ${lead.currentCompany}` : ''}</span>
                {lead.city && <span>• 📍 {lead.city}</span>}
                <span>• ⏳ {lead.yearsOfExperience || 0} yrs experience</span>
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
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-all ml-1"
              title="Close (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PROMINENT STAGE MOVER BAR (User Requirement) */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800/50 dark:via-gray-900 dark:to-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <span>🎯 Move Lead to Pipeline Column:</span>
              <span className="text-gray-400 font-normal normal-case">(Click any option to move instantly)</span>
            </div>
            {lead.crmStage && (
              <span className="text-xs text-gray-500 font-medium">
                Current Column: <strong className="text-primary-600 dark:text-primary-400">{lead.crmStage}</strong>
              </span>
            )}
          </div>

          {/* 6 Primary Requested Options */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {primaryStages.map((item) => {
              const isCurrent = lead.crmStage === item.stage || 
                (item.stage === 'Did Not Pick The Call' && lead.crmStage === 'Did Not Receive Call') ||
                (item.stage === 'Call Later' && lead.crmStage === 'Call Pending');

              return (
                <button
                  key={item.stage}
                  onClick={() => handleStageClick(item.stage)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isCurrent ? item.activeClass : item.hoverClass
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="truncate w-full text-center leading-tight">{item.label}</span>
                  {isCurrent && <span className="text-[10px] font-black uppercase opacity-90">✓ Current</span>}
                </button>
              );
            })}
          </div>

          {/* Optional Callback Scheduler for Call Later */}
          {showCallbackInput && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 shrink-0">
                ⏰ Schedule Callback Reminder:
              </span>
              <input
                type="text"
                placeholder="e.g. Tomorrow 11:00 AM or Saturday 4 PM"
                value={callbackDateTime}
                onChange={(e) => setCallbackDateTime(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 rounded-lg text-xs text-gray-900 dark:text-gray-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={handleSaveCallbackSchedule}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                Save Callback
              </button>
            </div>
          )}

          {/* Secondary Stages Dropdown */}
          <div className="mt-2.5 flex items-center justify-between text-xs">
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
            <div className="mt-2.5 p-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
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
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
          <button
            onClick={handleOpenFullProfile}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span> Open 360° AI Profile & Guided Call Script
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
  );
}
