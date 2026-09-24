// @ts-nocheck\n// src/pages/LeadProfile.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead } from '../types';

export default function LeadProfile() {
  const channel: string = 'WhatsApp';
  const tone: string = 'Professional';
  const { leads, selectedLeadId, setSelectedLeadId, updateLeadStage, addCallNote } = useApp();
  
  // Find current lead or default to Rahul Sharma
  const lead: Lead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Component local states
  const [rawNoteInput, setRawNoteInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questions, setQuestions] = useState<string[]>(lead.discoveryQuestions);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  // Follow-up Generator local state


  const [copied, setCopied] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleSelectLead = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLeadId(e.target.value);
  };

  const handleRegenerateQuestions = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setQuestions([
        `Rahul, given your ${lead.yearsOfExperience} years in ${lead.industry}, how are AI agents currently being evaluated in your sprints?`,
        `If you could automate 3 manual project workflows tomorrow, which would impact your team most?`,
        `What is the main criteria your leadership or prospective employers look for in an AI-capable Project Lead?`,
        `What timeline is ideal for you to complete your capstone agent project?`,
        `What would prevent you from starting this upskilling transition this week?`
      ]);
      setIsRegenerating(false);
    }, 600);
  };

  const handleAnalyzeCall = () => {
    if (!rawNoteInput.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      addCallNote(lead.id, rawNoteInput);
      setRawNoteInput('');
      setIsAnalyzing(false);
    }, 800);
  };

  const handleTriggerAction = (actionName: string) => {
    setActionMessage(`Triggered: ${actionName} for ${lead.fullName}`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Generate contextual follow-up message draft
  const getFollowUpText = () => {
    if (channel === 'WhatsApp') {
      if (tone === 'Short') {
        return `Hi ${lead.fullName.split(' ')[0]}, quick follow up from Aivalytics! Here is the AI Agent execution roadmap we discussed for your ${lead.currentRole} transition: https://aivalytics.io/pm-curriculum`;
      }
      if (tone === 'Urgent') {
        return `Hi ${lead.fullName.split(' ')[0]}, seat availability for the upcoming ${lead.programName} cohort is closing soon. Let's confirm your enrollment before Saturday! Link: https://aivalytics.io/pay/pm-seat`;
      }
      return `Hi ${lead.fullName.split(' ')[0]}, thanks for chatting earlier! Based on your goal to position your ${lead.yearsOfExperience} yrs experience for ${lead.primaryGoal}, I've attached our practical AI Agent capstone breakdown. Let me know if Saturday at 11am works for a quick follow-up!`;
    }
    if (channel === 'Email') {
      return `Subject: AI Execution Layer for your ${lead.currentRole} role at ${lead.currentCompany}\n\nHi ${lead.fullName.split(' ')[0]},\n\nFollowing up on our conversation regarding the ${lead.programName} program.\n\nRather than teaching basic project management, our 3-month program focuses on building multi-agent workflow engines and automation SOPs directly on top of your existing domain expertise.\n\nKey highlights tailored for you:\n- AI Agent Orchestration (n8n & custom agents)\n- Automated Sprint Auditing Capstone\n- Resume & Portfolio positioning for AI Leadership roles\n\nWould you have 10 minutes this Saturday to review the advanced module breakdown?\n\nBest regards,\n${lead.assignedSalesperson}\nAivalytics Admissions`;
    }
    return `[Call Script - ${tone} Tone]\n"Hi ${lead.fullName.split(' ')[0]}, this is ${lead.assignedSalesperson} from Aivalytics. Following up on your interest in adding AI agent orchestration to your ${lead.yearsOfExperience} years of ${lead.currentRole} experience. I wanted to verify if you had a chance to review the practical capstone projects we sent over?"`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFollowUpText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Notification Toast for Actions */}
      {actionMessage && (
        <div className="fixed top-4 right-4 z-50 bg-primary-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <span>⚡</span> {actionMessage}
        </div>
      )}

      {/* LEAD HEADER & LEAD SELECTOR BAR */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{lead.fullName}</h1>
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 border border-primary-200">
              Meta Lead ID: {lead.id}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {lead.currentRole} • {lead.yearsOfExperience} Years Exp • {lead.industry} • Interested in <span className="font-semibold text-gray-900 dark:text-gray-100">{lead.programName}</span>
          </p>
        </div>

        {/* Lead Switcher & Stage Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col text-xs text-gray-500">
            <span>Select Lead for Preview:</span>
            <select
              value={lead.id}
              onChange={handleSelectLead}
              className="mt-0.5 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500 font-medium"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.currentRole} - {l.crmStage})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col text-xs text-gray-500">
            <span>CRM Stage:</span>
            <select
              value={lead.crmStage}
              onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
              className="mt-0.5 px-3 py-1.5 border border-primary-500 rounded-lg bg-primary-50 text-primary-800 dark:bg-primary-950 dark:text-primary-200 text-sm font-semibold focus:ring-2 focus:ring-primary-500"
            >
              <option value="New Lead">New Lead</option>
              <option value="Call Pending">Call Pending</option>
              <option value="Did Not Receive Call">Did Not Receive Call</option>
              <option value="Connected">Connected</option>
              <option value="Interested">Interested</option>
              <option value="Details Sent on WhatsApp">Details Sent on WhatsApp</option>
              <option value="Follow-Up 1">Follow-Up 1</option>
              <option value="Follow-Up 2">Follow-Up 2</option>
              <option value="Follow-Up 3">Follow-Up 3</option>
              <option value="Qualified">Qualified</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Joined Session">Joined Session</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Unqualified">Unqualified</option>
              <option value="Lost">Lost</option>
              <option value="Converted">Converted</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP METRIC BADGES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Program Fit Score</p>
            <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 mt-1">{lead.fitScore}<span className="text-base text-gray-400 font-normal">/100</span></p>
          </div>
          <span className="text-3xl">🎯</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Purchase Intent Score</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{lead.intentScore}<span className="text-base text-gray-400 font-normal">/100</span></p>
          </div>
          <span className="text-3xl">🔥</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Assigned Salesperson</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{lead.assignedSalesperson}</p>
          </div>
          <span className="text-3xl">👤</span>
        </div>
      </div>

      {/* LEAD OVERVIEW */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>📋</span> Lead Overview
        </h2>
        
        {/* AI Summary Banner */}
        <div className="bg-primary-50 dark:bg-primary-950/30 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
          <span className="font-bold text-primary-900 dark:text-primary-300 text-sm block mb-1">✨ AI Summary</span>
          <p className="text-sm text-gray-800 dark:text-gray-200">{lead.aiSummary || 'AI Summary not generated yet.'}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Goal</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.primaryGoal}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Blocker</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.mainChallenge || 'None'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">AI Usage</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.currentAiUsageLevel}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Investment Readiness</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.investment || 'Unknown'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Education</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.education || 'Unknown'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Program Interest</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.programName}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Lead Source</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.source}</span>
          </div>
        </div>
      </div>

      {/* SALES INTELLIGENCE */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🧠</span> Sales Intelligence
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Lead Score</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.leadScore || lead.fitScore} / 100</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Lead Health</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.leadHealthScore || 0} / 100</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Temperature</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.temperature === 'Hot' ? '🔥 Hot' : lead.temperature === 'Warm' ? '🟠 Warm' : '🔵 Cold'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Conversion Prob.</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.conversionProbability || lead.intentScore}%</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Priority</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.priority || 'P2'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Qualification Status</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{lead.qualificationStatus || 'Unknown'}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg col-span-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">Recommended Action</span>
            <span className="font-semibold text-primary-700 dark:text-primary-400">{lead.nextBestAction || lead.recommendedNextAction || 'No action determined'}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2 — DESIRED OUTCOME */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>💡</span> SECTION 2 — DESIRED OUTCOME
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            AI Inference
          </span>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
          <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Likely Desired Outcome</h3>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
            "{lead.likelyDesiredOutcome}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Lead Provided
              </span>
              <span className="text-xs text-gray-500">Confirmed Fact</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 dark:text-gray-300">
              {lead.evidenceLeadProvided.map((ev, idx) => (
                <li key={idx}>{ev}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                AI Inference
              </span>
              <span className="text-xs text-gray-500 font-medium text-amber-600 dark:text-amber-400">Needs Verification</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-gray-700 dark:text-gray-300">
              {lead.evidenceAiInterpretation.map((ev, idx) => (
                <li key={idx}>{ev}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 3 — SALES STRATEGY */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🧠</span> SECTION 3 — SALES STRATEGY
        </h2>

        <div className="p-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-xl space-y-2">
          <h3 className="text-sm font-bold text-primary-900 dark:text-primary-300">Recommended Positioning</h3>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
            {lead.recommendedPositioning}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl space-y-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🗣️</span> Recommended Opening Script
          </h3>
          <blockquote className="p-3 bg-white dark:bg-gray-800 border-l-4 border-primary-500 rounded text-sm text-gray-700 dark:text-gray-300 italic">
            "{lead.recommendedOpening}"
          </blockquote>
        </div>
      </div>

      {/* SECTION 4 — DISCOVERY QUESTIONS */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>❓</span> SECTION 4 — DISCOVERY QUESTIONS
          </h2>
          <button
            onClick={handleRegenerateQuestions}
            disabled={isRegenerating}
            className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 rounded-lg text-xs font-semibold border border-primary-300 transition-all flex items-center gap-1.5"
          >
            <span className={isRegenerating ? 'animate-spin' : ''}>🔄</span>
            {isRegenerating ? 'Generating...' : 'Regenerate Questions'}
          </button>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx} className="p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5 — SKILL GAP MAP */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🗺️</span> SECTION 5 — SKILL GAP MAP
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Column 1 */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Existing / Likely Experience</h3>
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 rounded font-medium border border-amber-200">
                Possible based on profile — verify
              </span>
            </div>
            <div className="space-y-2">
              {lead.existingSkills.map((sk, idx) => (
                <div key={idx} className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-medium flex items-center justify-between">
                  <span>{sk}</span>
                  <span className="text-gray-400">➡️</span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 */}
          <div className="p-4 border border-primary-200 dark:border-primary-800 rounded-xl space-y-3 bg-primary-50/30 dark:bg-primary-950/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary-900 dark:text-primary-300">AI-Native Skills to Develop</h3>
              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded font-medium">
                Program Curriculum Focus
              </span>
            </div>
            <div className="space-y-2">
              {lead.aiSkillsToDevelop.map((sk, idx) => (
                <div key={idx} className="p-2.5 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 rounded text-sm font-semibold border border-primary-200 dark:border-primary-800 shadow-xs flex items-center justify-between">
                  <span>✨ {sk}</span>
                  <span className="text-xs text-primary-500 font-normal">Next Gen</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6 — PROGRAM FIT */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🎓</span> SECTION 6 — PROGRAM FIT
        </h2>

        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Why {lead.programName} May Fit</h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {lead.whyProgramFits}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Relevant Program Modules Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-extrabold text-primary-600">Month 1</span>
              <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">AI Foundations & Custom GPTs</h5>
              <p className="text-xs text-gray-500 mt-1">Prompt engineering, PRD automation, ChatGPT/Claude for managers.</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-extrabold text-primary-600">Month 2</span>
              <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">AI Agents & Orchestration</h5>
              <p className="text-xs text-gray-500 mt-1">Multi-agent design, n8n workflow engines, sprint audit automation.</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-xs font-extrabold text-primary-600">Month 3</span>
              <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">AI Execution Capstone</h5>
              <p className="text-xs text-gray-500 mt-1">SOP engineering, delegation models, portfolio project creation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7 — CAREER PATHWAYS */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🚀</span> SECTION 7 — CAREER PATHWAYS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Path A — Internal Growth</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Current Company ➔ Build AI Capability ➔ Apply to Internal Sprint Workflows ➔ Demonstrate ROI ➔ Seek Expanded AI Responsibility
            </p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Path B — External Transition</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Build AI Skills ➔ Complete Practical Capstone ➔ Update Resume & Portfolio ➔ Leverage Placement Support ➔ Explore AI PM Roles
            </p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Path C — Hybrid</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Build Skills while Employed ➔ Attempt Internal Growth ➔ Simultaneously Prepare for External Market Opportunities
            </p>
          </div>
        </div>

        {/* AI Safety Policy Note */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <span>⚠️</span>
          <span><strong>AI Safety Guideline:</strong> We never guarantee salary increments or job placement. Always frame outcomes using potential, possible, position for, and prepare for.</span>
        </div>
      </div>

      {/* SECTION 8 — OBJECTIONS */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🛡️</span> SECTION 8 — OBJECTIONS & RECOMMENDED RESPONSES
        </h2>

        <div className="space-y-4">
          {lead.objections.map((obj, idx) => (
            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
              <h3 className="font-bold text-sm text-red-600 dark:text-red-400">Objection: "{obj.objection}"</h3>
              <p className="text-xs text-gray-500"><strong>Why it exists:</strong> {obj.whyExists}</p>
              <div className="p-3 bg-white dark:bg-gray-800 rounded border-l-4 border-primary-500 text-xs text-gray-800 dark:text-gray-200">
                <strong>Recommended Response:</strong> {obj.recommendedResponse}
              </div>
              <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">
                <strong>Ask Before Answering:</strong> "{obj.questionToAsk}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 9 — NEXT BEST ACTION & CTA BUTTONS */}
      <div className="bg-primary-900 text-white p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-300">SECTION 9 — NEXT BEST ACTION</span>
            <h2 className="text-xl font-extrabold mt-1">Recommended Next Action</h2>
            <p className="text-sm text-primary-100 mt-1 leading-relaxed max-w-3xl font-medium">
              "{lead.recommendedNextAction}"
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => handleTriggerAction('Calling Lead')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            <span>📞</span> Call Lead
          </button>
          <button
            onClick={() => handleTriggerAction('Opening WhatsApp')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            <span>💬</span> WhatsApp
          </button>
          <button
            onClick={() => handleTriggerAction('Sending Email')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            <span>✉️</span> Send Email
          </button>
          <button
            onClick={() => handleTriggerAction('Scheduling Follow-Up')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            <span>📅</span> Schedule Follow-Up
          </button>
          <button
            onClick={() => {
              updateLeadStage(lead.id, 'Qualified');
              handleTriggerAction('Marked Lead as Qualified');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            <span>✅</span> Mark Qualified
          </button>
          <button
            onClick={() => {
              updateLeadStage(lead.id, 'Payment Pending');
              handleTriggerAction('Razorpay Payment Link Generated & Sent');
            }}
            className="px-4 py-2 bg-white text-primary-900 hover:bg-primary-50 font-bold text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            <span>💳</span> Send Payment Link
          </button>
        </div>
      </div>

      {/* CALL NOTES & AI ANALYSIS PANEL */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>📝</span> CALL NOTES & AI INTELLIGENCE ANALYSIS
        </h2>

        {/* Input box */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Enter Call Notes after Call with Prospect:
          </label>
          <textarea
            value={rawNoteInput}
            onChange={(e) => setRawNoteInput(e.target.value)}
            rows={3}
            placeholder="e.g. Interested in switching within six months. Currently earning well. Main concern is program depth. Follow up Saturday..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAnalyzeCall}
            disabled={isAnalyzing || !rawNoteInput.trim()}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center gap-2"
          >
            <span>{isAnalyzing ? '🔄' : '🤖'}</span>
            {isAnalyzing ? 'Analyzing Call with AI...' : 'Analyze Call with AI'}
          </button>
        </div>

                {/* Universal Activity Timeline */}
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>⏱️</span> Universal Activity Timeline
          </h3>

          <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6 pb-4">
            
            {/* New Timeline Items */}
            {lead.callNotesHistory.map((note) => (
              <div key={note.id} className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary-500 ring-4 ring-white dark:ring-gray-800" />
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">📞 Call Logged</span>
                    <span className="text-xs font-medium text-gray-500">{note.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">"{note.rawNotes}"</p>
                  <p className="text-xs text-gray-500 mt-2">By {note.salesperson}</p>
                  
                  {note.aiAnalysis && (
                    <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">✨ AI Intelligence Analysis</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-500 block">Primary Objection:</span><span className="font-bold text-red-600 dark:text-red-400">{note.aiAnalysis.primaryObjection}</span></div>
                        <div><span className="text-gray-500 block">Purchase Intent:</span><span className="font-bold text-emerald-600">{note.aiAnalysis.purchaseIntent}/100</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Mocked historical events based on lead state */}
            {lead.crmStage !== 'New Lead' && (
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-800" />
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-gray-900 dark:text-gray-100">📌 Stage Changed</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Moved to <span className="font-bold">{lead.crmStage}</span></p>
                    </div>
                    <span className="text-xs font-medium text-gray-500">Recently</span>
                  </div>
                </div>
              </div>
            )}

            <div className="relative pl-6">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-400 ring-4 ring-white dark:ring-gray-800" />
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-gray-900 dark:text-gray-100">📥 Lead Created</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sourced from <span className="font-bold">{lead.source}</span></p>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{new Date(lead.dateCaptured).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* AI SALES ASSISTANT (COPILOT) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🤖</span> AI SALES ASSISTANT (COPILOT)
          </h2>
          <button
            onClick={() => handleTriggerAction('Generating Sales Strategy')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-sm shadow-md transition-all flex items-center gap-2"
          >
            <span>✨</span> Generate AI Sales Strategy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">📞 Suggested Opening Line</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"Hi {lead.fullName.split(' ')[0]}, this is {lead.assignedSalesperson || 'Alex'} from Aivalytics. Following up on your interest in adding AI to your {lead.yearsOfExperience} years of {lead.currentRole} experience. Do you have 2 minutes?"</p>
          </div>

          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40 space-y-2">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm flex justify-between">
              <span>💬 Best WhatsApp Message</span>
              <button onClick={copyToClipboard} className="text-xs text-emerald-600 hover:underline">{copied ? 'Copied!' : 'Copy'}</button>
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{getFollowUpText()}</p>
          </div>
          
          <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2 md:col-span-2">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">🛡️ Key Objections & Handling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-amber-100 dark:border-amber-900/50">
                <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">Objection: "No time / Too busy"</span>
                <span className="text-gray-600 dark:text-gray-400">Response: Emphasize that the program requires only 4 hours/week and builds automations that will actually *save* them time in their current {lead.currentRole} role.</span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-amber-100 dark:border-amber-900/50">
                <span className="font-semibold text-gray-800 dark:text-gray-200 block mb-1">Objection: "Price is too high"</span>
                <span className="text-gray-600 dark:text-gray-400">Response: Frame it as an investment in career future-proofing. Mention EMI options. Calculate the ROI of a 20% salary bump in the next 12 months.</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/40 space-y-2 md:col-span-2">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm">🎯 Recommended Next Step</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{lead.nextBestAction || lead.recommendedNextAction || 'Send curriculum on WhatsApp and schedule a 10-minute discovery call.'}</p>
          </div>
        </div>
      </div>

      {/* LEAD SCORING BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fit Score */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Program Fit Score Breakdown</h3>
            <span className="text-2xl font-extrabold text-primary-600">{lead.fitScore}/100</span>
          </div>
          <p className="text-xs text-gray-500">Measures professional situation & domain alignment with program.</p>
          <div className="space-y-2 pt-2">
            {lead.fitScoreBreakdown.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded text-xs space-y-1">
                <div className="flex justify-between font-bold text-gray-800 dark:text-gray-200">
                  <span>{item.factor}</span>
                  <span className="text-primary-600">{item.score}%</span>
                </div>
                <p className="text-gray-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Intent Score */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">Purchase Intent Score Breakdown</h3>
            <span className="text-2xl font-extrabold text-emerald-600">{lead.intentScore}/100</span>
          </div>
          <p className="text-xs text-gray-500">Measures urgency, timeline, interactions, & buying signals.</p>
          <div className="space-y-2 pt-2">
            {lead.intentScoreBreakdown.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded text-xs space-y-1">
                <div className="flex justify-between font-bold text-gray-800 dark:text-gray-200">
                  <span>{item.factor}</span>
                  <span className="text-emerald-600">{item.score}%</span>
                </div>
                <p className="text-gray-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
