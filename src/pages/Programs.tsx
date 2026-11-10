// src/pages/Programs.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CORE_OFFERINGS,
  WORKSHOP_DIRECT_SALE_SCRIPT,
  FREE_WEBINAR_FALLBACK_SCRIPT,
  getWorkshopDirectSaleWhatsApp,
  getFreeWebinarWhatsApp,
  getAiPmProgramWhatsApp,
  getPostWebinarDualProposalWhatsApp
} from '../utils/offeringTemplates';

export default function Programs() {
  const { allLeads, leads } = useApp();
  const leadsPool = allLeads || leads;

  const [activeTab, setActiveTab] = useState<'workshop-3day' | 'ai-pm' | 'templates'>('workshop-3day');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  // Compute live pipeline numbers for each offering
  const workshopLeads = leadsPool.filter(
    (l) => l.programId === 'workshop-3day' || l.programName?.toLowerCase().includes('workshop') || l.programName?.toLowerCase().includes('3-day') || l.programName?.toLowerCase().includes('builder')
  );
  const aiPmLeads = leadsPool.filter(
    (l) => l.programId === 'ai-pm' || (!l.programId?.includes('workshop') && !l.programName?.toLowerCase().includes('workshop'))
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(label);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const workshopDef = CORE_OFFERINGS['workshop-3day'];
  const aiPmDef = CORE_OFFERINGS['ai-pm'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Programs & Offerings Engine</h1>
          <p className="text-xs text-gray-500">
            Official operational curricula, sales motion templates, and lead tracking for our two core offerings.
          </p>
        </div>
      </div>

      {/* Main Offering Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('workshop-3day')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'workshop-3day'
              ? 'bg-[#133926] text-white border-[#133926] shadow-sm'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${activeTab === 'workshop-3day' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-50 text-emerald-800'}`}>
              Weekend Intensive
            </span>
            <span className="text-xs font-mono font-bold">₹{workshopDef.price.toLocaleString('en-IN')}</span>
          </div>
          <h3 className="font-bold text-sm mt-2">1. 3-Day AI Builder Workshop</h3>
          <p className={`text-xs mt-1 line-clamp-2 ${activeTab === 'workshop-3day' ? 'text-gray-200' : 'text-gray-500'}`}>
            Fri Evening (7-10 PM) • Sat Full Day (10-6 PM) • Sun Full Day (10-6 PM)
          </p>
          <div className="mt-3 pt-2 border-t border-white/20 dark:border-gray-700 flex justify-between text-[11px]">
            <span>Active Pipeline:</span>
            <strong className="font-bold">{workshopLeads.length} Leads</strong>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai-pm')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'ai-pm'
              ? 'bg-[#133926] text-white border-[#133926] shadow-sm'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${activeTab === 'ai-pm' ? 'bg-purple-800 text-purple-100' : 'bg-purple-50 text-purple-800'}`}>
              Flagship 3 Months
            </span>
            <span className="text-xs font-mono font-bold">₹{aiPmDef.price.toLocaleString('en-IN')}</span>
          </div>
          <h3 className="font-bold text-sm mt-2">2. AI-Native PM Program</h3>
          <p className={`text-xs mt-1 line-clamp-2 ${activeTab === 'ai-pm' ? 'text-gray-200' : 'text-gray-500'}`}>
            4 Industry Certifications in 3 Months • Weekend Masterclasses + Weekly Mentorship
          </p>
          <div className="mt-3 pt-2 border-t border-white/20 dark:border-gray-700 flex justify-between text-[11px]">
            <span>Active Pipeline:</span>
            <strong className="font-bold">{aiPmLeads.length} Leads</strong>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'templates'
              ? 'bg-[#133926] text-white border-[#133926] shadow-sm'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${activeTab === 'templates' ? 'bg-amber-800 text-amber-100' : 'bg-amber-50 text-amber-800'}`}>
              Sales Rep Hub
            </span>
            <span className="text-xs font-mono font-bold">5 Templates</span>
          </div>
          <h3 className="font-bold text-sm mt-2">3. Sales Scripts & Pitch Library</h3>
          <p className={`text-xs mt-1 line-clamp-2 ${activeTab === 'templates' ? 'text-gray-200' : 'text-gray-500'}`}>
            In-Call Direct Selling, Webinar Fallback, 4-Cert AI PM, and Dual Proposals.
          </p>
          <div className="mt-3 pt-2 border-t border-white/20 dark:border-gray-700 flex justify-between text-[11px]">
            <span>WhatsApp Ready:</span>
            <strong className="font-bold text-emerald-400">1-Click Actions</strong>
          </div>
        </button>
      </div>

      {/* Tab 1: 3-Day AI Builder Workshop */}
      {activeTab === 'workshop-3day' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{workshopDef.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Weekend Intensive
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{workshopDef.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 line-through mr-2">₹{workshopDef.regularPrice.toLocaleString('en-IN')}</span>
                <span className="text-xl font-black text-[#133926] dark:text-emerald-400">
                  ₹{workshopDef.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-500 block">Direct In-Call Enrollment Fee</span>
              </div>
            </div>

            {/* Weekend Schedule Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Day 1 • Friday Evening</span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">7:00 PM – 10:00 PM IST</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  AI Foundations, LLM Context Engineering, System Prompt Architectures, and Framework Environment Setup.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Day 2 • Saturday Full Day</span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">10:00 AM – 6:00 PM IST</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Building Autonomous Market Research Agent & n8n Multi-Step Workflow Automation Engine with live debugging.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Day 3 • Sunday Full Day</span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">10:00 AM – 6:00 PM IST</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Building Production Multi-Modal AI Assistant, Webhook Integration, Cloud Deployment & Capstone Showcase.
                </p>
              </div>
            </div>

            {/* The 2-Way Sales Motion Explained */}
            <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Two-Way Sales Enrollment Motion
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <span>⚡ Pathway A:</span>
                    <span>Direct In-Call Sale (Primary Goal)</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    The rep calls the candidate directly, pitches the intensive Friday-Sunday hands-on build, and asks them to buy on the call for ₹2,999 with instant WhatsApp checkout link.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                    <span>🎟️ Pathway B:</span>
                    <span>Free Webinar Invitation (Fallback)</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    If the candidate is hesitant to buy directly on the call, the rep immediately transitions to giving them a free guest pass to the upcoming Live AI Masterclass where both programs are proposed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI-Native PM Program (4 Certifications) */}
      {activeTab === 'ai-pm' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{aiPmDef.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                    4 Certifications in 3 Months
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{aiPmDef.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 line-through mr-2">₹{aiPmDef.regularPrice.toLocaleString('en-IN')}</span>
                <span className="text-xl font-black text-purple-700 dark:text-purple-400">
                  ₹{aiPmDef.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-500 block">No-Cost EMI starting ₹4,500/mo</span>
              </div>
            </div>

            {/* The 4 Industry Certifications */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-3">
                The 4 Industry Certifications Included
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiPmDef.certifications?.map((cert, idx) => (
                  <div key={idx} className="p-4 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">Module & Certificate #{idx + 1}</span>
                    <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100">{cert}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-300 pt-1">
                      {idx === 0 && 'Mastering custom GPTs, Claude 3.5 Sonnet context architectures, and engineering comprehensive AI PRDs.'}
                      {idx === 1 && 'Architecting multi-agent systems, automated backlog risk audits, and n8n orchestration for agile squads.'}
                      {idx === 2 && 'Evaluating LLM hallucination rates, RAG latency & cost metrics, and continuous deployment analytics.'}
                      {idx === 3 && 'Deploying a live production portfolio AI agent and defending architecture before senior industry tech leaders.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Program Logistics & Mentorship */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl space-y-1">
                <span className="text-gray-500 font-semibold">Cohort Duration:</span>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">3 Months (12 Weeks)</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl space-y-1">
                <span className="text-gray-500 font-semibold">Live Timing:</span>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Sat & Sun (10 AM - 1 PM IST)</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl space-y-1">
                <span className="text-gray-500 font-semibold">Mentorship:</span>
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Weekly 1-on-1 Coaching</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sales Scripts & Templates Library */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Template 1: 3-Day Workshop In-Call Close */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Offering 1: 3-Day Workshop
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">
                  Direct In-Call Close Script & WhatsApp Checkout
                </h4>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(getWorkshopDirectSaleWhatsApp('Alex Candidate'), 'workshop-wa')}
                className="px-3 py-1.5 bg-[#133926] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#1a4a33]"
              >
                {copiedTemplate === 'workshop-wa' ? '✓ Copied WhatsApp!' : '📋 Copy WhatsApp Template'}
              </button>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-xs space-y-1.5 text-gray-700 dark:text-gray-300">
              <p><strong>Opening Hook:</strong> &quot;{WORKSHOP_DIRECT_SALE_SCRIPT.hook.replace('[Name]', 'John')}&quot;</p>
              <p><strong>Value Pitch:</strong> &quot;{WORKSHOP_DIRECT_SALE_SCRIPT.valuePitch}&quot;</p>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                <strong>In-Call Close:</strong> &quot;{WORKSHOP_DIRECT_SALE_SCRIPT.inCallClose}&quot;
              </p>
            </div>
          </div>

          {/* Template 2: Fallback Free Webinar Invitation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Fallback: Did Not Buy on Call
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">
                  Free Live Masterclass Invitation (Where Both Offerings Are Proposed)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(getFreeWebinarWhatsApp('Alex Candidate'), 'webinar-wa')}
                className="px-3 py-1.5 bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-indigo-800"
              >
                {copiedTemplate === 'webinar-wa' ? '✓ Copied WhatsApp!' : '📋 Copy WhatsApp Pass'}
              </button>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-xs space-y-1.5 text-gray-700 dark:text-gray-300">
              <p><strong>Transition:</strong> &quot;{FREE_WEBINAR_FALLBACK_SCRIPT.transition}&quot;</p>
              <p><strong>Webinar Value:</strong> &quot;{FREE_WEBINAR_FALLBACK_SCRIPT.pitch}&quot;</p>
              <p className="font-semibold text-indigo-800 dark:text-indigo-300">
                <strong>Invitation Close:</strong> &quot;{FREE_WEBINAR_FALLBACK_SCRIPT.close}&quot;
              </p>
            </div>
          </div>

          {/* Template 3: Post-Webinar Dual Program Proposal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Post-Webinar Follow-Up
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">
                  Dual Program Proposal (Proposing 3-Day Workshop + AI-Native PM Program)
                </h4>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(getPostWebinarDualProposalWhatsApp('Alex Candidate'), 'dual-wa')}
                className="px-3 py-1.5 bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-amber-800"
              >
                {copiedTemplate === 'dual-wa' ? '✓ Copied WhatsApp!' : '📋 Copy Dual Proposal'}
              </button>
            </div>
            <pre className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-[11px] font-sans whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {getPostWebinarDualProposalWhatsApp('Alex Candidate')}
            </pre>
          </div>

          {/* Template 4: AI-Native PM 4-Certifications Syllabus */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Offering 2: AI-Native PM (3 Months)
                </span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mt-1">
                  Full 4-Certifications Syllabus & Mentorship Brochure
                </h4>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(getAiPmProgramWhatsApp('Alex Candidate'), 'aipm-wa')}
                className="px-3 py-1.5 bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-purple-800"
              >
                {copiedTemplate === 'aipm-wa' ? '✓ Copied WhatsApp!' : '📋 Copy 4-Cert Syllabus'}
              </button>
            </div>
            <pre className="p-3 bg-gray-50 dark:bg-gray-750 rounded-lg text-[11px] font-sans whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {getAiPmProgramWhatsApp('Alex Candidate')}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
