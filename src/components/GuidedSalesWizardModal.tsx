// src/components/GuidedSalesWizardModal.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  lead?: Lead;
}

export default function GuidedSalesWizardModal({ isOpen, onClose, leadId, lead: propLead }: Props) {
  const { leads, updateLeadStage, addCallNote, setSelectedLeadId, selectedLeadId } = useApp();

  const targetId = leadId || propLead?.id || selectedLeadId;
  const lead = propLead || leads.find((l) => l.id === targetId) || leads[0];

  // Guided Sales Decision Engine Wizard State (Phases 1 - 24)
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [role, setRole] = useState<string>(lead.currentRole || 'Project Manager');
  const [experience, setExperience] = useState<number>(lead.yearsOfExperience || 5);
  const [seniority, setSeniority] = useState<string>('Manager');
  const [interestReason, setInterestReason] = useState<string>('Career Growth');
  const [aiMaturity, setAiMaturity] = useState<string>('Basic ChatGPT / Claude prompts');
  const [aiGap, setAiGap] = useState<string>('Multi-Agent Orchestration');
  const [primaryPain, setPrimaryPain] = useState<string>('Too much repetitive manual work');
  const [costOfInaction, setCostOfInaction] = useState<string>('Career stagnation & flat salary');
  const [desiredOutcome, setDesiredOutcome] = useState<string>('Senior AI Project Manager (₹35+ LPA)');
  const [careerDirection, setCareerDirection] = useState<string>('Move into AI & Automation');
  const [dominantBarrier, setDominantBarrier] = useState<string>('Lack of practical agent portfolio projects');
  const [urgency, setUrgency] = useState<string>('Immediately (Next 30 days)');
  const [timeCommitment, setTimeCommitment] = useState<string>('6–8 hours/week');
  const [learningFormat, setLearningFormat] = useState<string>('Weekend Batch (Sat & Sun 10 AM - 1 PM)');
  const [decisionAuthority, setDecisionAuthority] = useState<string>('Independent Decision Maker');
  const [budgetReadiness, setBudgetReadiness] = useState<string>('Ready for ₹5,000 Seat Reservation');
  const [selectedObjection, setSelectedObjection] = useState<string>('');
  const [fitCheck, setFitCheck] = useState<string>('Yes - Complete Alignment');

  // Payment Link & Copy Status
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen || !lead) return null;

  // Calculate Algorithmic Lead Score (Phase 21)
  const calculateLeadScore = () => {
    let score = 50; // base
    if (experience >= 3) score += 10;
    if (experience >= 8) score += 5;
    if (urgency.includes('Immediately')) score += 15;
    else if (urgency.includes('1–3 months')) score += 10;
    if (dominantBarrier.includes('practical') || dominantBarrier.includes('agent')) score += 10;
    if (decisionAuthority.includes('Independent')) score += 5;
    if (budgetReadiness.includes('Ready')) score += 5;
    return Math.min(98, score);
  };

  const calculatedScore = calculateLeadScore();

  // Dynamic Position Teleprompter (Phase 13)
  const getTeleprompterScript = () => {
    if (role.toLowerCase().includes('sales')) {
      return `"${lead.fullName.split(' ')[0]}, your sales background gives you elite communication. By adding n8n automation and custom AI agents, you become an AI Growth Architect who builds high-volume pipelines."`;
    }
    if (role.toLowerCase().includes('dev') || role.toLowerCase().includes('tech')) {
      return `"${lead.fullName.split(' ')[0]}, you already understand logic. This 3-month program bridges the gap between raw code and leading enterprise AI transformation projects as a Technical Product Manager."`;
    }
    if (role.toLowerCase().includes('ops')) {
      return `"${lead.fullName.split(' ')[0]}, instead of spending 15 hours a week manually coordinating workflows, we build custom AI agents that automate 50% of your operational bottlenecks."`;
    }
    return `"${lead.fullName.split(' ')[0]}, at ${experience} years of experience, your value isn't writing sprint cards manually. It’s architecting multi-agent workflows that audit sprint health automatically. We position you for a Senior AI-PM role."`;
  };

  // Dynamic Value Stack (Phase 15)
  const getValueStackItems = () => {
    if (dominantBarrier.includes('practical') || dominantBarrier.includes('agent')) {
      return ['7 Production Capstone Projects', '1 Custom AI Agent per Participant', '1-on-1 Code & Architecture Reviews'];
    }
    if (dominantBarrier.includes('job') || dominantBarrier.includes('career')) {
      return ['3 Professional Certifications', '100% Job Assistance & Resume Positioning', 'Executive Career Direction Mapping'];
    }
    return ['Weekend Batch Working Professional Format', 'AI Learning-Tracking Assistant', '100% 2-Week Money-Back Guarantee'];
  };

  // Objection Resolution Engine (Phase 17)
  const getObjectionResponse = (obj: string) => {
    switch (obj) {
      case 'PRICE':
        return {
          question: 'Compared to remaining in your current salary bracket for another year, or compared to basic online courses?',
          response: '₹39,499 breaks down to just ₹438/day over 3 months. Plus, you can lock in your seat today with just ₹5,000.',
          proof: '100% 2-Week Money-Back Guarantee + Flexible No-Cost EMI options available.'
        };
      case 'TIME':
        return {
          question: 'How many hours on weekends do you currently spend on unstructured tasks or social media?',
          response: '90% of our weekend attendees are full-time working managers. All sessions are recorded with lifetime access and supported by your AI Learning Assistant.',
          proof: 'Recorded sessions + 3-hour Sat/Sun timing designed specifically for busy professionals.'
        };
      case 'JOB_GUARANTEE':
        return {
          question: 'Are you looking for an honest institute that provides 100% job assistance and portfolio building, or fake placement promises?',
          response: 'No genuine institute can guarantee employment. We provide 100% job placement support, resume optimization, portfolio reviews, and top referral networks.',
          proof: '7 production capstone projects on GitHub that demonstrate real execution to hiring managers.'
        };
      default:
        return {
          question: 'What specific aspect remains uncertain—is it the time commitment, curriculum depth, or investment structure?',
          response: 'Let us address that directly so you can evaluate whether the 3-month program fits your career goals.',
          proof: '100% 2-Week Money-Back Guarantee (Subject to T&C).'
        };
    }
  };

  const handleSendPaymentLink = () => {
    setIsLinkSent(true);
    updateLeadStage(lead.id, 'Payment Link Sent' as Stage);
    addCallNote(
      lead.id,
      `Guided Sales System Call Completed. Score: ${calculatedScore}/100. Goal: "${desiredOutcome}". Sent ₹5,000 Razorpay Seat Reservation Link (https://rzp.io/rzp/dXXePYb).`
    );
    setTimeout(() => setIsLinkSent(false), 4000);
  };

  const copyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center text-xl font-black">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Guided Sales Decision System — {lead.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
                  Score: {calculatedScore}/100
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Phase {currentPhase} of 6 • Real-time consultative teleprompter & dynamic value equation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Phase Stepper Header */}
        <div className="py-3 px-1 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center justify-between text-xs overflow-x-auto gap-2">
          {[
            { phase: 1, title: '1. Frame & Profile' },
            { phase: 2, title: '2. Pain & Maturity' },
            { phase: 3, title: '3. Outcome & Gap' },
            { phase: 4, title: '4. Positioning Engine' },
            { phase: 5, title: '5. Objection Matrix' },
            { phase: 6, title: '6. Close & Reservation' }
          ].map((step) => (
            <button
              key={step.phase}
              onClick={() => setCurrentPhase(step.phase)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                currentPhase === step.phase
                  ? 'bg-primary-600 text-white shadow-xs'
                  : currentPhase > step.phase
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 text-xs min-h-0">
          {/* PHASE 1 — RAPPORT & CURRENT PROFILE */}
          {currentPhase === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-primary-50 dark:bg-primary-950/50 rounded-2xl border border-primary-200 dark:border-primary-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-primary-900 dark:text-primary-200 uppercase tracking-wider text-[11px]">
                    🗣️ Spoken Opening Frame (Phase 1)
                  </span>
                  <button
                    onClick={() => copyScript(getTeleprompterScript())}
                    className="text-primary-600 dark:text-primary-400 font-bold underline cursor-pointer"
                  >
                    {copiedScript ? '✅ Copied' : '📋 Copy Teleprompter'}
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 italic leading-relaxed">
                  "Hi {lead.fullName.split(' ')[0]}, this is Alex from Aivalytics. Before I give you a generic explanation of the curriculum, I want to understand your background and what caught your attention, so I can tell you honestly whether the program is relevant for you. Fair enough?"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Current Candidate Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Project Manager">Project Manager</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Operations Lead">Operations Lead</option>
                    <option value="Sales / Business Development">Sales / Business Development</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Software Developer / Engineer">Software Developer / Engineer</option>
                    <option value="IT / Technology Manager">IT / Technology Manager</option>
                    <option value="Healthcare / Pharma Manager">Healthcare / Pharma Manager</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Founders' Office">Founders' Office</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Years of Experience:
                  </label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Seniority Level:
                  </label>
                  <select
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Individual Contributor">Individual Contributor</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Senior Manager">Senior Manager</option>
                    <option value="Leadership / Director">Leadership / Director</option>
                    <option value="Founder / Owner">Founder / Owner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Primary Reason for Form Submission (Phase 3):
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Career Growth', 'Better Salary', 'AI Relevance', 'Automation Skills', 'Career Switch', 'Better Role', 'Upskilling', 'Job Opportunities'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInterestReason(r)}
                      className={`p-2 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                        interestReason === r
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PHASE 2 — PAIN & AI MATURITY */}
          {currentPhase === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Current AI Usage Maturity (Phase 4):
                  </label>
                  <select
                    value={aiMaturity}
                    onChange={(e) => setAiMaturity(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                  >
                    <option value="I don't use AI regularly">I don't use AI regularly (Level 0)</option>
                    <option value="Basic ChatGPT / Claude prompts">Basic ChatGPT / Claude prompts (Level 1)</option>
                    <option value="Use AI tools occasionally at work">Use AI tools occasionally at work (Level 1)</option>
                    <option value="Use multiple AI tools daily">Use multiple AI tools daily (Level 2)</option>
                    <option value="Use automation tools (Zapier, n8n)">Use automation tools (Zapier, n8n) (Level 3)</option>
                    <option value="Built AI agents & custom workflows">Built AI agents & custom workflows (Level 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Single Biggest AI Capability Gap:
                  </label>
                  <select
                    value={aiGap}
                    onChange={(e) => setAiGap(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                  >
                    <option value="Understanding AI & LLM Architecture">Understanding AI & LLM Architecture</option>
                    <option value="Workflow Automation (n8n & Zapier)">Workflow Automation (n8n & Zapier)</option>
                    <option value="Multi-Agent Orchestration">Multi-Agent Orchestration</option>
                    <option value="SOP Engineering & Prompting">SOP Engineering & Prompting</option>
                    <option value="Applying AI to My Specific Role">Applying AI to My Specific Role</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Primary Operational Bottleneck / Pain (Phase 5):
                </label>
                <select
                  value={primaryPain}
                  onChange={(e) => setPrimaryPain(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                >
                  <option value="Too much repetitive manual work">Too much repetitive manual work (Status tracking, PRDs)</option>
                  <option value="Endless status follow-ups & coordination">Endless status follow-ups & coordination</option>
                  <option value="Lack of AI skills & technical confidence">Lack of AI skills & technical confidence</option>
                  <option value="Fear of obsolescence & falling behind tech-native peers">Fear of obsolescence & falling behind tech-native peers</option>
                  <option value="Career stagnation & flat salary growth">Career stagnation & flat salary growth</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cost of Inaction (If Nothing Changes in 12 Months):
                </label>
                <input
                  type="text"
                  value={costOfInaction}
                  onChange={(e) => setCostOfInaction(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                />
              </div>
            </div>
          )}

          {/* PHASE 3 — OUTCOME & DOMINANT GAP */}
          {currentPhase === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    6–12 Month Desired Outcome (Phase 6):
                  </label>
                  <input
                    type="text"
                    value={desiredOutcome}
                    onChange={(e) => setDesiredOutcome(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Target Career Direction (Phase 7):
                  </label>
                  <select
                    value={careerDirection}
                    onChange={(e) => setCareerDirection(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Stay in current domain (Add AI layer)">Stay in current domain (Add AI layer)</option>
                    <option value="Move into AI Project Management">Move into AI Project Management</option>
                    <option value="Move into AI & Automation">Move into AI & Automation</option>
                    <option value="Move into AI Operations">Move into AI Operations</option>
                    <option value="Move into Consulting / Founders' Office">Move into Consulting / Founders' Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Dominant Barrier Stopping Goal (Phase 8):
                </label>
                <select
                  value={dominantBarrier}
                  onChange={(e) => setDominantBarrier(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold text-red-600 dark:text-red-400"
                >
                  <option value="Lack of practical agent portfolio projects">Lack of practical agent portfolio projects</option>
                  <option value="Lack of formal PM & n8n automation framework">Lack of formal PM & n8n automation framework</option>
                  <option value="Lack of recognized certifications & career placement support">Lack of recognized certifications & career placement support</option>
                  <option value="Lack of time & structured guidance">Lack of time & structured guidance</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Urgency Level (Phase 9):
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Immediately (Next 30 days)">Immediately (Next 30 days)</option>
                    <option value="Within 1–3 months">Within 1–3 months</option>
                    <option value="3–6 months">3–6 months</option>
                    <option value="6–12 months">6–12 months</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Weekly Time Investment (Phase 10):
                  </label>
                  <select
                    value={timeCommitment}
                    onChange={(e) => setTimeCommitment(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="4–6 hours/week">4–6 hours/week</option>
                    <option value="6–8 hours/week">6–8 hours/week</option>
                    <option value="8+ hours/week">8+ hours/week</option>
                    <option value="2–3 hours/week (Low)">2–3 hours/week (Low)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 4 — PERSONALIZED POSITIONING ENGINE & VALUE STACK */}
          {currentPhase === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-primary-900 text-white rounded-2xl shadow-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-primary-300 uppercase tracking-widest text-[11px]">
                    🧠 Algorithmic Spoken Positioning Script (Phase 13)
                  </span>
                  <button
                    onClick={() => copyScript(getTeleprompterScript())}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedScript ? '✅ Copied' : '📋 Copy Script'}
                  </button>
                </div>
                <p className="text-sm font-medium leading-relaxed italic">
                  {getTeleprompterScript()}
                </p>
              </div>

              {/* Hormozi Value Stack Engine (Phase 15) */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h3 className="font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>⚡</span> Contextual Value Stack (Matched to Candidate Barrier)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getValueStackItems().map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold"
                    >
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PHASE 5 — OBJECTION RESOLUTION MATRIX */}
          {currentPhase === 5 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
                <h3 className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
                  🛡️ Phase 17 — 11-Objection Resolution Matrix
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Select the prospect's primary objection to view the exact clarifying question and non-manipulative response:
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'PRICE', label: 'Price (₹39,499)' },
                    { id: 'TIME', label: 'Time / Busy Schedule' },
                    { id: 'JOB_GUARANTEE', label: 'Job Guarantee vs Assistance' }
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedObjection(o.id)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                        selectedObjection === o.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-gray-800 border border-amber-300 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedObjection && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <span className="font-bold text-gray-400 block text-[10px] uppercase">
                      Clarifying Question to Ask Prospect:
                    </span>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      "{getObjectionResponse(selectedObjection).question}"
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-primary-600 block text-[10px] uppercase">
                      Recommended Consultative Response:
                    </span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                      "{getObjectionResponse(selectedObjection).response}"
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-200 font-extrabold text-xs">
                    Proof Point: {getObjectionResponse(selectedObjection).proof}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Fit Confirmation Alignment (Phase 16):
                </label>
                <select
                  value={fitCheck}
                  onChange={(e) => setFitCheck(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                >
                  <option value="Yes - Complete Alignment">Yes - Prospect confirms complete solution fit</option>
                  <option value="Mostly - Needs Batch Timing Confirmation">Mostly - Needs Batch Timing Confirmation</option>
                  <option value="Uncertain - Pending Partner/Spouse Approval">Uncertain - Pending Partner/Spouse Approval</option>
                  <option value="No - Poor Fit">No - Poor Fit</option>
                </select>
              </div>
            </div>
          )}

          {/* PHASE 6 — TRANSACTIONAL CLOSE & SEAT RESERVATION */}
          {currentPhase === 6 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-5 bg-emerald-900 text-white rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-emerald-700 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                      PHASE 20 — TRANSACTIONAL CLOSING PROTOCOL
                    </span>
                    <h3 className="text-xl font-black mt-0.5">
                      Reserve Seat with ₹5,000 Payment
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-xl shadow">
                    Fee: ₹39,499
                  </span>
                </div>

                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  "{lead.fullName.split(' ')[0]}, I am sending the official Aivalytics Razorpay seat reservation link directly to your WhatsApp and Email right now. You can reserve your seat with ₹5,000 today to lock in your 3 professional certifications and 7 capstone projects."
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSendPaymentLink}
                    className="px-5 py-2.5 bg-white text-emerald-950 font-black text-xs rounded-xl shadow-md hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>💳</span>
                    {isLinkSent ? '✅ Razorpay Link Pushed to WhatsApp!' : 'Send ₹5,000 Payment Link Now'}
                  </button>

                  <a
                    href="https://rzp.io/rzp/dXXePYb"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-750 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Open Payment Gateway Page ↗
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Cohort Batch (Phase 19):
                  </label>
                  <select
                    value={learningFormat}
                    onChange={(e) => setLearningFormat(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Weekend Batch (Sat & Sun 10 AM - 1 PM)">Weekend Batch (Sat & Sun 10 AM - 1 PM) — ~90% Working Pros</option>
                    <option value="Weekday Batch (Mon to Fri 8 PM - 9 PM)">Weekday Batch (Mon to Fri 8 PM - 9 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Decision Authority (Phase 12):
                  </label>
                  <select
                    value={decisionAuthority}
                    onChange={(e) => setDecisionAuthority(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Independent Decision Maker">Independent Decision Maker</option>
                    <option value="Discuss with Spouse / Family">Discuss with Spouse / Family</option>
                    <option value="Employer Sponsorship Required">Employer Sponsorship Required</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Budget Readiness (Phase 12):
                  </label>
                  <select
                    value={budgetReadiness}
                    onChange={(e) => setBudgetReadiness(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Ready for ₹5,000 Seat Reservation">Ready for ₹5,000 Seat Reservation</option>
                    <option value="Full Fee Payment Ready (₹39,499)">Full Fee Payment Ready (₹39,499)</option>
                    <option value="Requires EMI / Installments">Requires EMI / Installments</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 shrink-0 flex justify-between items-center text-xs">
          <button
            type="button"
            disabled={currentPhase === 1}
            onClick={() => setCurrentPhase((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 disabled:opacity-40 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 cursor-pointer"
          >
            ◀ Back Phase
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 cursor-pointer"
            >
              Close Wizard
            </button>

            {currentPhase < 6 ? (
              <button
                type="button"
                onClick={() => setCurrentPhase((prev) => Math.min(6, prev + 1))}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Phase ➔</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedLeadId(lead.id);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Complete & Open Profile ➔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
