// src/components/ProgramCrmKanban.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import { evaluateLeadWithGrok } from '../lib/aiEngine';
import LeadDetailModal from './LeadDetailModal';

const REQUIRED_STAGES: { stage: Stage; label: string; badgeColor: string }[] = [
  { stage: 'New Lead', label: '1. New Lead', badgeColor: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  { stage: 'Call Later', label: '2. Call Later', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  { stage: 'Did Not Pick The Call', label: '3. Did Not Pick The Call', badgeColor: 'bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  { stage: 'Connected', label: '4. Connected', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  { stage: 'Interested', label: '5. Interested', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  { stage: 'Details Sent on WhatsApp', label: '6. Details Sent', badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
  { stage: 'Follow-Up 1', label: '7. Follow-Up 1', badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  { stage: 'Follow-Up 2', label: '8. Follow-Up 2', badgeColor: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300' },
  { stage: 'Follow-Up 3', label: '9. Follow-Up 3', badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300' },
  { stage: 'Qualified', label: '10. Qualified', badgeColor: 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300' },
  { stage: 'Payment Pending', label: '11. Payment Pending', badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  { stage: 'Joined Session', label: '12. Joined Session', badgeColor: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
  { stage: 'Not Interested', label: 'Terminal: Not Interested', badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  { stage: 'Unqualified', label: 'Terminal: Unqualified', badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  { stage: 'Lost', label: 'Terminal: Lost', badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  { stage: 'Converted', label: 'Terminal: Converted', badgeColor: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' }
];

interface ProgramCrmKanbanProps {
  programId: string;
}

export default function ProgramCrmKanban({ programId }: ProgramCrmKanbanProps) {
  const { leads, updateLeadStage, addCallNote, programs, deleteLead, deleteBulkLeads, logCall } = useApp();

  // Full Lead Detail Modal State (User Requirement)
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<Lead | null>(null);
  const activeModalLead = selectedLeadForModal
    ? leads.find((l) => l.id === selectedLeadForModal.id) || selectedLeadForModal
    : null;

  // Filters & Selections
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Due' | 'HighFit' | 'Qualified'>('All');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkStageTarget, setBulkStageTarget] = useState<Stage>('Qualified');

  // Drag & Drop
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Active Call Modal State
  const [activeCallLead, setActiveCallLead] = useState<Lead | null>(null);
  const [callNotesInput, setCallNotesInput] = useState<string>('');
  const [selectedCallOutcome, setSelectedCallOutcome] = useState<Stage>('Interested');
  const [lastContactedDate, setLastContactedDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>(new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10));

  // In-Modal AI Copilot State
  const [isGeneratingPitch, setIsGeneratingPitch] = useState<boolean>(false);
  const [aiScriptOutput, setAiScriptOutput] = useState<{
    openingHook: string;
    valuePitch: string;
    priceObjection: string;
    closingQuestion: string;
  } | null>(null);

  const currentProgram = programs.find((p) => p.id === programId) || programs[0];
  const programFee = currentProgram.price || 49999;

  // Filter leads for this program
  const programLeads = leads.filter((l) => {
    const pName = (l.programName || '').toLowerCase();
    if (programId === 'ai-pm') return l.programId === 'ai-pm' || pName.includes('project');
    if (programId === 'ai-gtm') return l.programId === 'ai-gtm' || pName.includes('gtm');
    if (programId === 'ai-fellowship') return l.programId === 'ai-fellowship' || pName.includes('fellowship');
    return true;
  });

  const todayStr = new Date().toISOString().substring(0, 10);

  // Compute follow-up status
  const getFollowUpStatus = (lead: Lead) => {
    const fDate = lead.nextFollowUp ? lead.nextFollowUp.substring(0, 10) : todayStr;
    if (fDate < todayStr) return { isOverdue: true, isDueToday: false, text: '🔥 OVERDUE', color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300' };
    if (fDate === todayStr) return { isOverdue: false, isDueToday: true, text: '⏰ DUE TODAY', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' };
    return { isOverdue: false, isDueToday: false, text: `📅 ${fDate}`, color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300' };
  };

  // Apply Quick Filters & Search
  const filteredLeads = programLeads.filter((l) => {
    // 1. Search Query Filter (Name or Mobile Number or Company)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const qDigits = searchQuery.replace(/\D/g, '');
      const leadDigits = (l.phone || '').replace(/\D/g, '');

      const nameMatch = (l.fullName || '').toLowerCase().includes(q);
      const phoneMatch =
        (l.phone || '').toLowerCase().includes(q) ||
        (qDigits.length > 0 && leadDigits.includes(qDigits));
      const emailMatch = (l.email || '').toLowerCase().includes(q);
      const companyMatch = (l.currentCompany || '').toLowerCase().includes(q);
      const roleMatch = (l.currentRole || '').toLowerCase().includes(q);

      if (!nameMatch && !phoneMatch && !emailMatch && !companyMatch && !roleMatch) {
        return false;
      }
    }

    // 2. Active Quick Filter Tab
    if (activeFilter === 'Due') {
      const status = getFollowUpStatus(l);
      return status.isOverdue || status.isDueToday;
    }
    if (activeFilter === 'HighFit') return l.fitScore >= 85;
    if (activeFilter === 'Qualified') return l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp';
    return true;
  });

  // Calculate Pipeline Metrics
  const qualifiedLeads = programLeads.filter((l) => l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp');
  const pipelineValue = qualifiedLeads.length * programFee;
  const conversionRate = programLeads.length > 0 ? Math.round((qualifiedLeads.length / programLeads.length) * 100) : 0;
  const dueCount = programLeads.filter((l) => getFollowUpStatus(l).isOverdue || getFollowUpStatus(l).isDueToday).length;

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (id) {
      updateLeadStage(id, targetStage);
      setDraggedLeadId(null);
    }
  };

  // Bulk Operations
  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkStageUpdate = () => {
    selectedLeadIds.forEach((id) => updateLeadStage(id, bulkStageTarget));
    setSelectedLeadIds([]);
  };

  // Call Modal Actions
  const handleStartCall = (lead: Lead) => {
    setActiveCallLead(lead);
    setCallNotesInput('');
    setSelectedCallOutcome(lead.crmStage === 'New Lead' ? 'Interested' : lead.crmStage);
    setLastContactedDate(todayStr);
    setNextFollowUpDate(new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 10));
    setAiScriptOutput(null);
  };

  const handleSaveCallOutcome = () => {
    if (!activeCallLead) return;
    const noteText = callNotesInput.trim()
      ? `[Call Date: ${lastContactedDate}] [Next Follow-Up: ${nextFollowUpDate}] ${callNotesInput}`
      : `Call logged with outcome: ${selectedCallOutcome}`;
    if (callNotesInput.trim()) {
      addCallNote(activeCallLead.id, noteText);
    }
    updateLeadStage(activeCallLead.id, selectedCallOutcome);
    logCall(activeCallLead.id, selectedCallOutcome, noteText);
    setActiveCallLead(null);
  };

  // Feature 3: In-Modal AI Sales Copilot Generator
  const handleGenerateAiCopilot = async (lead: Lead) => {
    setIsGeneratingPitch(true);
    try {
      const grokEval = await evaluateLeadWithGrok(
        {
          fullName: lead.fullName,
          currentRole: lead.currentRole,
          currentCompany: lead.currentCompany,
          yearsOfExperience: lead.yearsOfExperience,
          primaryGoal: lead.primaryGoal,
          programName: lead.programName
        }
      );

      const openingHook = grokEval.recommendedOpening || `Hi ${lead.fullName.split(' ')[0]}, with your ${lead.yearsOfExperience} years of experience as ${lead.currentRole} at ${lead.currentCompany}, how is AI currently transforming your team's workflow?`;
      const valuePitch = grokEval.recommendedPositioning || `Position ${lead.programName} as an immediate execution multiplier for senior ${lead.currentRole}s.`;
      const priceObjection = `For ₹${programFee.toLocaleString('en-IN')}, frame this not as a course cost, but as an ROI multiplier for a ${lead.currentRole} targeting rapid salary & capability growth.`;
      const closingQuestion = grokEval.discoveryQuestions[0] || `If you could automate your top 3 manual project workflows by next month, what impact would that have on your deliverability?`;

      setAiScriptOutput({
        openingHook,
        valuePitch,
        priceObjection,
        closingQuestion
      });
    } catch {
      setAiScriptOutput({
        openingHook: `Hi ${lead.fullName.split(' ')[0]}, looking at your ${lead.yearsOfExperience} years in ${lead.currentRole}, how are AI agents currently impacting your delivery cycles?`,
        valuePitch: `Add an AI execution layer to your existing ${lead.yearsOfExperience} years of domain experience.`,
        priceObjection: `At ₹${programFee.toLocaleString('en-IN')}, the program pays for itself when automating 50%+ of manual project tracking.`,
        closingQuestion: `Are you looking for growth in your current role or actively planning a career transition?`
      });
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Feature 2: Export Calendar Event (.ics)
  const handleExportIcsCalendar = (lead: Lead, fDate: string) => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Aivalytics LeadOS//EN
BEGIN:VEVENT
SUMMARY:Follow-up Call with ${lead.fullName} (${lead.programName})
DESCRIPTION:Call lead ${lead.fullName} (${lead.phone}). Goal: ${lead.primaryGoal}. Role: ${lead.currentRole} at ${lead.currentCompany}.
DTSTART:${fDate.replace(/-/g, '')}T100000Z
DTEND:${fDate.replace(/-/g, '')}T103000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Followup_${lead.fullName.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Feature 4: Live Pipeline Revenue & Conversion Analytics Header */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Calling CRM & Pipeline Operations
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              8-stage lead journey tracking, automated WhatsApp outreach, overdue follow-up alerts & AI sales script copilot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Revenue Pipeline Metric */}
            <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Qualified Pipeline Value
              </span>
              <span className="text-base font-black text-emerald-800 dark:text-emerald-200">
                ₹{pipelineValue.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Total Pipeline Count */}
            <div className="px-3.5 py-2 bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                Total Pipeline Leads
              </span>
              <span className="text-base font-black text-primary-800 dark:text-primary-200">
                {programLeads.length} Candidates
              </span>
            </div>

            {/* Stage Conversion Rate */}
            <div className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
              <span className="block text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Qualification Rate
              </span>
              <span className="text-base font-black text-blue-800 dark:text-blue-200">
                {conversionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Visual Funnel Progress Bar */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-500">
            <span>Stage Volume Funnel</span>
            <span>{qualifiedLeads.length} Qualified / {programLeads.length} Total</span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {REQUIRED_STAGES.map(({ stage, badgeColor }) => {
              const count = programLeads.filter((l) => l.crmStage === stage).length;
              const pct = programLeads.length > 0 ? (count / programLeads.length) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={stage}
                  style={{ width: `${pct}%` }}
                  title={`${stage}: ${count} (${pct.toFixed(0)}%)`}
                  className={`h-full ${badgeColor.split(' ')[0]} border-r border-white dark:border-gray-800`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature 5: Search & Quick Filter Bar & Bulk Actions */}
      <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Live Search Bar for Name or Mobile Number */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or mobile number (e.g. 9790808200)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'All'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              All Leads ({programLeads.length})
            </button>
            <button
              onClick={() => setActiveFilter('Due')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'Due'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <span>⚡ Follow-Up Queue</span>
              {dueCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-extrabold">
                  {dueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('HighFit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'HighFit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              🌟 High Fit (&gt;85%)
            </button>
            <button
              onClick={() => setActiveFilter('Qualified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeFilter === 'Qualified'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              ✅ Qualified Leads ({qualifiedLeads.length})
            </button>
          </div>
        </div>

        {/* Active Search / Bulk Actions sub-row */}
        {(searchQuery.trim() || selectedLeadIds.length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-200 dark:border-gray-700/60">
            {searchQuery.trim() ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400">Search results for:</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                  "{searchQuery}"
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  • {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'} found
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline font-bold cursor-pointer ml-1"
                >
                  Clear search
                </button>
              </div>
            ) : <div />}

            {/* Bulk Actions Bar */}
            {selectedLeadIds.length > 0 && (
              <div className="flex items-center gap-2 bg-primary-900 text-white px-3.5 py-1.5 rounded-lg text-xs animate-fade-in">
                <span className="font-bold">{selectedLeadIds.length} Selected</span>
                <select
                  value={bulkStageTarget}
                  onChange={(e) => setBulkStageTarget(e.target.value as Stage)}
                  className="bg-primary-800 text-white font-bold border border-primary-700 rounded px-2 py-1 text-xs"
                >
                  {REQUIRED_STAGES.map((s) => (
                    <option key={s.stage} value={s.stage}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkStageUpdate}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded cursor-pointer"
                >
                  Apply Stage
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete ${selectedLeadIds.length} selected lead(s)? This cannot be undone.`)) {
                      deleteBulkLeads(selectedLeadIds);
                      setSelectedLeadIds([]);
                    }
                  }}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded cursor-pointer flex items-center gap-1"
                >
                  🗑️ Delete ({selectedLeadIds.length})
                </button>
                <button
                  onClick={() => setSelectedLeadIds([])}
                  className="text-gray-300 hover:text-white font-bold px-1.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 8-Stage Kanban Board Grid */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {REQUIRED_STAGES.map(({ stage, label, badgeColor }) => {
          const stageLeads = filteredLeads.filter((l) => {
            if (stage === 'Call Later') return l.crmStage === 'Call Later' || l.crmStage === 'Call Pending';
            if (stage === 'Did Not Pick The Call') return l.crmStage === 'Did Not Pick The Call' || l.crmStage === 'Did Not Receive Call';
            return l.crmStage === stage;
          });

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="w-68 shrink-0 bg-gray-100 dark:bg-gray-800/80 rounded-xl p-3 border border-gray-200 dark:border-gray-700 flex flex-col min-h-[460px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate">{label}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-xs ${badgeColor}`}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-xs text-gray-400">
                    {searchQuery.trim() ? 'No matches' : 'No leads in this stage'}
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const status = getFollowUpStatus(lead);
                    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                    const waMessage = encodeURIComponent(
                      `Hi ${lead.fullName}, following up from Aivalytics regarding the ${lead.programName} cohort. Do you have 5 minutes to connect?`
                    );

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedLeadForModal(lead)}
                        className={`bg-white dark:bg-gray-700 p-3.5 rounded-xl border shadow-2xs hover:shadow-md cursor-pointer transition-all space-y-2.5 group ${
                          selectedLeadIds.includes(lead.id)
                            ? 'border-primary-500 ring-2 ring-primary-500/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-primary-400'
                        }`}
                      >
                        {/* Indicators Bar */}
                        <div className="flex flex-wrap gap-1 mb-1">
                          {status.isOverdue && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded">Overdue</span>}
                          {lead.intentScore >= 80 && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">High Intent</span>}
                          {lead.numberOfCalls > 2 && lead.crmStage === 'Did Not Receive Call' && <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-[9px] font-bold rounded">No Response</span>}
                          {lead.paymentStatus === 'Unpaid' && lead.crmStage === 'Payment Pending' && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold rounded">Payment Pending</span>}
                          {lead.leadHealthScore < 40 && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded">Stale Lead</span>}
                          {lead.leadHealthScore > 80 && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded">Recently Engaged</span>}
                        </div>

                        {/* Top row: Avatar, Name, Role & Temperature */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={selectedLeadIds.includes(lead.id)}
                              onChange={() => toggleSelectLead(lead.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer shrink-0"
                            />
                            <div className="w-7 h-7 rounded-lg bg-[#264e36] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {lead.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLeadForModal(lead);
                                }}
                                className="font-extrabold text-xs text-gray-900 dark:text-gray-100 hover:text-emerald-700 cursor-pointer truncate max-w-[110px]"
                              >
                                {lead.fullName}
                              </h4>
                              <div className="text-[10px] font-medium text-gray-400 truncate max-w-[130px]">
                                {lead.currentRole || 'Professional'} • {lead.yearsOfExperience || 0}y exp
                              </div>
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    logCall(lead.id, 'Connected', 'Outgoing phone call placed');
                                  }}
                                  className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                                  title={`Click to call ${lead.phone}`}
                                >
                                  <span>📱</span> {lead.phone}
                                </a>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold shrink-0" title="Temperature">
                            {lead.temperature === 'Hot' ? '🔥 Hot' : lead.temperature === 'Warm' ? '🟠 Warm' : '🔵 Cold'}
                          </span>
                        </div>

                        {/* Core Metrics: Score & Probability */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded font-bold">
                            Score: {lead.leadScore || lead.fitScore}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded font-bold">
                            Conv: {lead.conversionProbability || lead.intentScore}%
                          </span>
                        </div>

                        {/* Goals & Blockers */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg space-y-1 mt-1">
                          <div className="text-[9px] text-gray-600 dark:text-gray-400 line-clamp-1">
                            <span className="font-bold">Goal:</span> {lead.primaryGoal}
                          </div>
                          <div className="text-[9px] text-gray-600 dark:text-gray-400 line-clamp-1">
                            <span className="font-bold">Blocker:</span> {lead.mainChallenge || 'None specified'}
                          </div>
                        </div>

                        {/* Timing & Owner */}
                        <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1">
                          <div className="flex flex-col">
                            <span className="font-semibold" title="Next Follow-Up">📅 Next: {lead.nextFollowUp ? lead.nextFollowUp.substring(0,10) : 'None'}</span>
                            <span title="Last Interaction">🔄 Last: {lead.lastContacted ? lead.lastContacted.substring(0,10) : 'Never'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-right">
                            <span>👤 {lead.assignedSalesperson?.split(' ')[0] || 'Unassigned'}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-600 flex items-center justify-between gap-1.5">
                          {/* Instant WhatsApp Button */}
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                            title="Open direct WhatsApp conversation"
                          >
                            <span>💬</span>
                          </a>

                          {/* Direct Call & Log Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartCall(lead);
                            }}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                            title="Call & Log Outcome"
                          >
                            <span>📞</span>
                          </button>

                          {/* Quick Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to permanently delete lead "${lead.fullName}"?`)) {
                                deleteLead(lead.id);
                              }
                            }}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-bold text-[10px] rounded-lg border border-red-200 dark:border-red-900/60 cursor-pointer transition-all"
                            title="Delete Lead"
                          >
                            🗑️
                          </button>

                          {/* Full Details & Move Modal Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadForModal(lead);
                            }}
                            className="px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-[10px] rounded-lg shadow-2xs cursor-pointer flex-1 text-center truncate"
                          >
                            Details & Move →
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calling CRM Modal with Features 1, 2 & 3 Built-In */}
      {activeCallLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 relative my-8">
            <button
              onClick={() => setActiveCallLead(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            {/* Lead Header Box */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-2xs flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                  {activeCallLead.fullName}
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  {activeCallLead.currentRole} at {activeCallLead.currentCompany} ({activeCallLead.yearsOfExperience}y experience)
                </p>
              </div>
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-200 font-extrabold rounded-lg text-xs">
                Fit Score: {activeCallLead.fitScore}%
              </span>
            </div>

            {/* Lead Details Grid */}
            <div className="space-y-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {/* City */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">City</label>
                <div className="col-span-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-gray-100">
                  {activeCallLead.city || 'Bhubaneswar'}
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Professional Status</label>
                <div className="col-span-2 flex items-center">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    {activeCallLead.professionalStatus || 'Working Professional'}
                  </span>
                </div>
              </div>

              {/* Mobile Number with Feature 1 Deep Linking */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Mobile Number</label>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="p-2 flex-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-gray-900 dark:text-gray-100">
                    p:{activeCallLead.phone}
                  </div>
                  <a
                    href={`https://wa.me/${activeCallLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${activeCallLead.fullName}, following up from Aivalytics regarding ${activeCallLead.programName}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${activeCallLead.phone.replace(/[^0-9]/g, '')}`}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    📞 Call
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Email Address</label>
                <div className="col-span-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium underline">
                  {activeCallLead.email}
                </div>
              </div>

              {/* Feature 3: In-Modal AI Sales Pitch & Objection Copilot */}
              <div className="p-4 bg-primary-50/80 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/80 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-primary-900 dark:text-primary-200 flex items-center gap-1.5">
                    ✨ Real-Time AI Sales Pitch & Objection Copilot
                  </span>
                  <button
                    onClick={() => handleGenerateAiCopilot(activeCallLead)}
                    disabled={isGeneratingPitch}
                    className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPitch ? 'Generating Pitch...' : '✨ Generate AI Script'}
                  </button>
                </div>

                {aiScriptOutput && (
                  <div className="space-y-2 text-xs bg-white dark:bg-gray-800 p-3 rounded-lg border border-primary-200 dark:border-primary-800 font-normal">
                    <div>
                      <strong className="text-primary-800 dark:text-primary-300">🎯 Opening Hook: </strong>
                      <span className="text-gray-800 dark:text-gray-200">{aiScriptOutput.openingHook}</span>
                    </div>
                    <div>
                      <strong className="text-emerald-700 dark:text-emerald-300">💡 Value Pitch & ROI: </strong>
                      <span className="text-gray-800 dark:text-gray-200">{aiScriptOutput.valuePitch}</span>
                    </div>
                    <div>
                      <strong className="text-amber-700 dark:text-amber-300">💰 Price Objection Handler: </strong>
                      <span className="text-gray-800 dark:text-gray-200">{aiScriptOutput.priceObjection}</span>
                    </div>
                    <div>
                      <strong className="text-blue-700 dark:text-blue-300">❓ Closing Question: </strong>
                      <span className="text-gray-800 dark:text-gray-200">{aiScriptOutput.closingQuestion}</span>
                    </div>
                    <button
                      onClick={() =>
                        setCallNotesInput(
                          (prev) =>
                            `${prev ? prev + '\n' : ''}[AI Sales Copilot Script]: Hook: ${aiScriptOutput.openingHook} | Pitch: ${aiScriptOutput.valuePitch}`
                        )
                      }
                      className="mt-2 text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                    >
                      📋 Paste AI Script into Call Notes below
                    </button>
                  </div>
                )}
              </div>

              {/* Call Outcome Dropdown */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Call Outcome</label>
                <select
                  value={selectedCallOutcome}
                  onChange={(e) => setSelectedCallOutcome(e.target.value as Stage)}
                  className="col-span-2 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
                >
                  {REQUIRED_STAGES.map((s) => (
                    <option key={s.stage} value={s.stage}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Call Notes */}
              <div className="grid grid-cols-3 items-start gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200 pt-2">Call Notes</label>
                <textarea
                  rows={2}
                  value={callNotesInput}
                  onChange={(e) => setCallNotesInput(e.target.value)}
                  placeholder="Record conversation outcome, objections raised, decision maker info..."
                  className="col-span-2 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                />
              </div>

              {/* Objection */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Objection</label>
                <select
                  className="col-span-2 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
                >
                  <option value="">None</option>
                  <option value="Price">Price</option>
                  <option value="Need time">Need time</option>
                  <option value="Need family approval">Need family approval</option>
                  <option value="Employer approval">Employer approval</option>
                  <option value="Wants job guarantee">Wants job guarantee</option>
                  <option value="Wants more program information">Wants more program information</option>
                  <option value="Timing issue">Timing issue</option>
                  <option value="Already doing another course">Already doing another course</option>
                  <option value="Doesn't understand program value">Doesn't understand program value</option>
                  <option value="Wants demo">Wants demo</option>
                  <option value="Wants trainer information">Wants trainer information</option>
                  <option value="Wants career clarity">Wants career clarity</option>
                  <option value="Cannot afford currently">Cannot afford currently</option>
                  <option value="Comparing alternatives">Comparing alternatives</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Next Action */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Next Action</label>
                <select
                  className="col-span-2 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
                >
                  <option value="Call later">Call later</option>
                  <option value="Send WhatsApp">Send WhatsApp</option>
                  <option value="Send program brochure">Send program brochure</option>
                  <option value="Send curriculum">Send curriculum</option>
                  <option value="Send projects information">Send projects information</option>
                  <option value="Send testimonial">Send testimonial</option>
                  <option value="Explain career transition">Explain career transition</option>
                  <option value="Address price objection">Address price objection</option>
                  <option value="Send payment link">Send payment link</option>
                  <option value="Ask qualification question">Ask qualification question</option>
                  <option value="Schedule consultation">Schedule consultation</option>
                  <option value="Wait">Wait</option>
                  <option value="Long-term nurture">Long-term nurture</option>
                  <option value="Close as lost">Close as lost</option>
                </select>
              </div>

              {/* Last Contacted Date */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Last Contacted Date</label>
                <input
                  type="date"
                  value={lastContactedDate}
                  onChange={(e) => setLastContactedDate(e.target.value)}
                  className="col-span-2 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
                />
              </div>

              {/* Next Follow-Up Date & Feature 2 Calendar Export */}
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">Next Follow-Up Date</label>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => handleExportIcsCalendar(activeCallLead, nextFollowUpDate)}
                    className="px-3 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-1"
                    title="Download Google / Outlook Calendar .ics file"
                  >
                    <span>📅 Calendar .ics</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setActiveCallLead(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300 rounded-lg text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCallOutcome}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs shadow-md cursor-pointer"
              >
                Save Call Log & Follow-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAD DETAILS & STAGE MOVER MODAL (User Requirement) */}
      <LeadDetailModal
        lead={activeModalLead}
        isOpen={!!selectedLeadForModal}
        onClose={() => setSelectedLeadForModal(null)}
        onStageChange={(newStage) => updateLeadStage(selectedLeadForModal!.id, newStage)}
        onDelete={() => setSelectedLeadForModal(null)}
      />
    </div>
  );
}
