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

  // Guided Sales Decision Engine State (20-Stage Guided Architecture)
  const [currentStageNum, setCurrentStageNum] = useState<number>(1);

  // Prospect Attributes & State Updates
  const [openingOutcome, setOpeningOutcome] = useState<string>('Yes - Good Time');
  const [initialMotivation, setInitialMotivation] = useState<string>('Career Growth');
  const [role, setRole] = useState<string>(lead?.currentRole || 'Project Manager');
  const [experience, setExperience] = useState<number>(lead?.yearsOfExperience || 5);
  const [seniority, setSeniority] = useState<string>('Manager');
  const [roleBranchDetail, setRoleBranchDetail] = useState<string>('Repetitive PRDs & Manual Sprint Updates');
  const [aiMaturity, setAiMaturity] = useState<string>('Basic ChatGPT / Claude prompts (Level 1)');
  const [primaryPain, setPrimaryPain] = useState<string>('Too much repetitive manual work');
  const [costOfInaction, setCostOfInaction] = useState<string>('Career stagnation & flat salary over 12 months');
  const [desiredOutcome, setDesiredOutcome] = useState<string>('Switch to AI Project Manager Role');
  const [targetRole, setTargetRole] = useState<string>('AI Project Manager / Director of AI PMO');
  const [primaryGap, setPrimaryGap] = useState<string>('Lack of practical agent portfolio projects');
  const [urgency, setUrgency] = useState<string>('Immediately (Next 30 days)');
  const [whyNow, setWhyNow] = useState<string>('Appraisal / Career milestone coming up');
  const [timeCommitment, setTimeCommitment] = useState<string>('6–8 hours/week');
  const [batchChoice, setBatchChoice] = useState<string>('Weekend Batch (Sat & Sun 10 AM - 1 PM)');
  const [decisionAuthority, setDecisionAuthority] = useState<string>('Independent Decision Maker');
  const [budgetReadiness, setBudgetReadiness] = useState<string>('Ready for ₹5,000 Seat Reservation');
  const [selectedObjection, setSelectedObjection] = useState<string>('PRICE');
  const [fitCheck, setFitCheck] = useState<string>('Yes - Complete Alignment');
  const [activeDiscussionTopic, setActiveDiscussionTopic] = useState<string | null>(null);

  // Transaction & Copy State
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen || !lead) return null;

  // 100-Point Algorithmic Lead Scoring Rubric (Stage 20)
  const calculateLeadScore = () => {
    let score = 30; // base engagement
    if (experience >= 3) score += 15;
    if (experience >= 8) score += 5;
    if (urgency.includes('Immediately')) score += 15;
    else if (urgency.includes('1–3 months')) score += 10;
    if (primaryGap.includes('portfolio') || primaryGap.includes('practical')) score += 10;
    if (desiredOutcome.includes('Switch') || desiredOutcome.includes('Hike')) score += 10;
    if (decisionAuthority.includes('Independent')) score += 5;
    if (budgetReadiness.includes('Ready')) score += 5;
    if (initialMotivation.includes('Career') || initialMotivation.includes('Switch')) score += 5;
    return Math.min(98, score);
  };

  const score = calculateLeadScore();
  const leadTier = score >= 80 ? '🔥 HOT LEAD' : score >= 65 ? '⚡ STRONG LEAD' : score >= 50 ? '🌾 NURTURE' : '❄️ LOW INTENT';

  // Dynamic Spoken Teleprompter Prompts (Concise 20–50 words / 1–3 sentences max)
  const getSpokenScriptForStage = () => {
    const firstName = lead.fullName.split(' ')[0];

    switch (currentStageNum) {
      case 1:
        return `"Hi ${firstName}, this is Maaz from Aivalytics. We received your inquiry regarding our AI-Native Project Management program. Before I give a generic explanation, I'd like to understand your background so I can tell you honestly if it's relevant. Is that fair?"`;
      case 2:
        return `"What specifically caught your attention when you saw our program—was it AI agent automation, career growth, or moving into a stronger execution role?"`;
      case 3:
        if (role.toLowerCase().includes('project') || role.toLowerCase().includes('pm')) {
          return `"You already understand project execution. So the real value for you isn't relearning project management—it's adding AI agents and automation on top of your existing experience."`;
        }
        if (role.toLowerCase().includes('sales')) {
          return `"Your advantage is that you already understand customers and commercial outcomes. Adding project execution and AI agents makes you relevant for roles between client delivery and operations."`;
        }
        if (role.toLowerCase().includes('dev') || role.toLowerCase().includes('tech')) {
          return `"You already understand technical logic. We bridge the gap between coding scripts and leading enterprise AI transformation projects as a Technical Program Manager."`;
        }
        return `"With your ${experience} years in ${role}, adding an AI execution layer turns you into an AI Transformation Lead without throwing away your background."`;
      case 4:
        return `"With ${experience} years of professional experience, we focus on positioning you for senior AI-native leadership rather than foundational topics."`;
      case 5:
        return `"How are you currently using AI tools like ChatGPT or Claude in your day-to-day work routine?"`;
      case 6:
        return `"What part of your weekly work takes 5 to 10 hours but doesn't actually require your strategic judgment?"`;
      case 7:
        return `"If we look 6 to 12 months ahead, what primary career outcome or salary level would make this investment 100% worth it for you?"`;
      case 8:
        return `"What specific role title do you want to see on your LinkedIn profile 6 months from now?"`;
      case 9:
        return `"What do you feel is currently stopping you from reaching that outcome today?"`;
      case 10:
        return `"Why are you looking at this transition right now—is there an upcoming appraisal or active job search?"`;
      case 11:
        return `"You've told me that as a ${role} with ${experience} years of experience, your goal is ${desiredOutcome}, and your main barrier is ${primaryGap}. So for you, the value is adding an AI Agent Execution layer on top of what you already know."`;
      case 12:
        return `"The 3-month program is simple: Month 1 Learn AI → Month 2 Build AI Agents & Workflows → Month 3 Manage AI-Powered Execution."`;
      case 13:
        if (initialMotivation.includes('Switch') || desiredOutcome.includes('Switch') || primaryGap.includes('Job')) {
          return `"Since career transition is important for you, after completing the program we provide 6 months of 100% placement support. Our AI agents identify relevant job openings and send 3–4 tailored profiles weekly on WhatsApp."`;
        }
        return `"You get 7 practical capstone projects, 3 professional certifications, a personal custom AI agent, and recorded session access designed for working pros."`;
      case 14:
        return `"Based on everything we've discussed, do you feel this 3-month roadmap is directly aligned with what you're trying to achieve?"`;
      case 15:
        return `"If you feel the program helps you achieve your goal, is there anything else that would stop you from joining this batch?"`;
      case 16:
        return `"Which format suits your schedule better—the Weekend 3-hour sessions or Weekday 1-hour sessions? Around 90% of our weekend attendees are working professionals."`;
      case 17:
        return `"The complete investment for the 3-month program is ₹39,499. You can reserve your seat today with ₹5,000."`;
      case 18:
        return `"You don't have to pay the entire amount today. I'm sending the official ₹5,000 Razorpay seat reservation link to your WhatsApp right now. Shall I stay on the line while you review it?"`;
      default:
        return `"Summary of candidate telemetry and post-call next steps."`;
    }
  };

  // Job Support Explanation (Explicit Distinction between 100% Placement Support vs Job Guarantee)
  const getPlacementSupportScript = () => {
    return `"Since career transition is important for you, after completing the program we provide 6 months of placement support. Our AI agents track relevant opportunities, and you receive approximately 3 to 4 relevant job profiles each week directly on WhatsApp. You simply review the role, and apply if interested. Note that this is 100% placement support, not a false job guarantee—it ensures you have consistent pipeline visibility after graduation."`;
  };

  // 11-Objection Playbook Responses
  const getObjectionHandler = (type: string) => {
    switch (type) {
      case 'PRICE':
        return {
          clarify: "When you say price, is the concern affordability right now, or whether the program is worth ₹39,499?",
          response: "₹39,499 breaks down to ₹438/day over 3 months. You can reserve your seat today for ₹5,000 with flexible No-Cost EMI options.",
          proof: "100% 2-Week Money-Back Guarantee (Subject to T&C)."
        };
      case 'TIME':
        return {
          clarify: "Is the issue attending live sessions, or finding time for practical projects?",
          response: "90% of our weekend learners are full-time working professionals. All live sessions are recorded with lifetime access and supported by your personal AI Learning Agent.",
          proof: "3-hour Sat/Sun timing designed for busy schedules."
        };
      case 'JOB_GUARANTEE':
        return {
          clarify: "Are you looking for an honest institute that provides 100% placement support and portfolio building, or fake placement promises?",
          response: "No genuine institute can guarantee employment. We provide 6 months of 100% placement support with AI job agent alerts on WhatsApp, resume positioning, and 7 live capstone projects.",
          proof: "7 production GitHub projects demonstrate real proof to hiring managers."
        };
      default:
        return {
          clarify: "What specific aspect remains uncertain—is it the time commitment, curriculum depth, or investment structure?",
          response: "Let's address that directly so you can evaluate whether this 3-month program fits your career path.",
          proof: "100% 2-Week Money-Back Guarantee (Subject to T&C)."
        };
    }
  };

  const handleSendRazorpayLink = () => {
    setIsLinkSent(true);
    updateLeadStage(lead.id, 'Payment Link Sent' as Stage);
    addCallNote(
      lead.id,
      `[Guided Sales Call Completed] Score: ${score}/100 (${leadTier}). Goal: "${desiredOutcome}". Sent ₹5,000 Razorpay Seat Reservation Link (https://rzp.io/rzp/dXXePYb).`
    );
    setTimeout(() => setIsLinkSent(false), 4000);
  };

  const copyPromptText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl font-black">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Aivalytics Guided Sales Decision Engine — {lead.fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-extrabold text-xs">
                  Score: {score}/100 ({leadTier})
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Stage {currentStageNum} of 20 • Live Consultative Teleprompter & Decision Tree Map
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

        {/* 20-Stage Quick Navigation Stepper */}
        <div className="py-2.5 px-1 border-b border-gray-100 dark:border-gray-800 shrink-0 flex items-center gap-1.5 overflow-x-auto text-xs">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((sNum) => (
            <button
              key={sNum}
              onClick={() => setCurrentStageNum(sNum)}
              className={`px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                currentStageNum === sNum
                  ? 'bg-purple-600 text-white shadow-xs'
                  : currentStageNum > sNum
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
              }`}
            >
              Stage {sNum}
            </button>
          ))}
        </div>

        {/* Scrollable Stage Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5 text-xs min-h-0">
          {/* LIVE SALESPERSON UI TELEPROMPTER CARD */}
          <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg space-y-3 border border-purple-800/60">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-purple-300 uppercase tracking-widest text-[11px]">
                🗣️ Live Spoken Script (Stage {currentStageNum})
              </span>
              <button
                onClick={() => copyPromptText(getSpokenScriptForStage())}
                className="text-purple-300 hover:text-white font-bold underline cursor-pointer"
              >
                {copiedScript ? '✅ Copied' : '📋 Copy Prompt'}
              </button>
            </div>
            <p className="text-sm font-medium leading-relaxed italic text-gray-100">
              {getSpokenScriptForStage()}
            </p>
          </div>

          {/* STAGE 1 — OPENING & PERMISSION FRAME */}
          {currentStageNum === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase">
                Prospect Live Answer Buttons (Select candidate response):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Yes - Good Time', outcome: 'Yes - Good Time' },
                  { label: 'Only Have 2 Minutes', outcome: '2 Minutes Limit' },
                  { label: 'What is this regarding?', outcome: 'Regarding Inquiry' },
                  { label: 'Don\'t Remember Form', outcome: 'Forgot Form' },
                  { label: 'Call Me Later', outcome: 'Call Later' },
                  { label: 'Just Exploring', outcome: 'Exploring' },
                  { label: 'Not Interested', outcome: 'Not Interested' }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setOpeningOutcome(opt.outcome);
                      setCurrentStageNum(2);
                    }}
                    className={`p-3 rounded-xl font-bold border text-left transition-all cursor-pointer ${
                      openingOutcome === opt.outcome
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-purple-300'
                    }`}
                  >
                    🔹 {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 2 — INITIAL MOTIVATION */}
          {currentStageNum === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase">
                Primary Interest Trigger:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['AI Agents', 'Automation', 'Project Management', 'Career Growth', 'Better Salary', 'Job Switch', 'Promotion', 'Future Relevance'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setInitialMotivation(m);
                      setCurrentStageNum(3);
                    }}
                    className={`p-3 rounded-xl font-bold border text-left transition-all cursor-pointer ${
                      initialMotivation === m
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-purple-300'
                    }`}
                  >
                    🎯 {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 3 — CURRENT ROLE & BRANCHING */}
          {currentStageNum === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Candidate Role:
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Project Manager">Project Manager</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Program Manager">Program Manager</option>
                    <option value="PMO Lead">PMO Lead</option>
                    <option value="Operations Lead">Operations Lead</option>
                    <option value="Sales / Business Development">Sales / Business Development</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Software Developer / Engineer">Software Developer / Engineer</option>
                    <option value="IT Professional">IT Professional</option>
                    <option value="Pharma Professional">Pharma Professional</option>
                    <option value="Healthcare / Medical">Healthcare / Medical</option>
                    <option value="Consultant">Consultant</option>
                    <option value="Founders' Office">Founders' Office</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Role-Specific Detail / Bottleneck:
                  </label>
                  <input
                    type="text"
                    value={roleBranchDetail}
                    onChange={(e) => setRoleBranchDetail(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
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
                    <option value="Director / Executive">Director / Executive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4 & 5 — EXPERIENCE & AI MATURITY */}
          {(currentStageNum === 4 || currentStageNum === 5) && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Years of Professional Experience (Stage 4):
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
                    Current AI Usage Maturity (Stage 5):
                  </label>
                  <select
                    value={aiMaturity}
                    onChange={(e) => setAiMaturity(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                  >
                    <option value="I don't use AI regularly (Level 0)">I don't use AI regularly (Level 0)</option>
                    <option value="Basic ChatGPT / Claude prompts (Level 1)">Basic ChatGPT / Claude prompts (Level 1)</option>
                    <option value="Multiple AI tools daily (Level 2)">Multiple AI tools daily (Level 2)</option>
                    <option value="Automation tools n8n/Zapier (Level 3)">Automation tools n8n/Zapier (Level 3)</option>
                    <option value="Built AI agents & custom workflows (Level 4)">Built AI agents & custom workflows (Level 4)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 6 & 7 — PAIN & DESIRED OUTCOME */}
          {(currentStageNum === 6 || currentStageNum === 7) && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Primary Operational Bottleneck / Pain (Stage 6):
                  </label>
                  <input
                    type="text"
                    value={primaryPain}
                    onChange={(e) => setPrimaryPain(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    6–12 Month Desired Outcome (Stage 7):
                  </label>
                  <input
                    type="text"
                    value={desiredOutcome}
                    onChange={(e) => setDesiredOutcome(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cost of Inaction over Next 12 Months:
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

          {/* STAGE 8 & 9 — TARGET ROLE & DOMINANT GAP */}
          {(currentStageNum === 8 || currentStageNum === 9) && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Target Role / Designation (Stage 8):
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold text-purple-600 dark:text-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Dominant Capability Gap (Stage 9):
                  </label>
                  <select
                    value={primaryGap}
                    onChange={(e) => setPrimaryGap(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold text-red-600 dark:text-red-400"
                  >
                    <option value="Lack of practical agent portfolio projects">Lack of practical agent portfolio projects</option>
                    <option value="No n8n workflow & automation experience">No n8n workflow & automation experience</option>
                    <option value="Lack of formal PM framework & certifications">Lack of formal PM framework & certifications</option>
                    <option value="Job placement support & interview preparation">Job placement support & interview preparation</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 10 — WHY NOW & URGENCY */}
          {currentStageNum === 10 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Urgency Timeline (Stage 10):
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
                    Why Now Trigger:
                  </label>
                  <input
                    type="text"
                    value={whyNow}
                    onChange={(e) => setWhyNow(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Weekly Time Investment:
                  </label>
                  <select
                    value={timeCommitment}
                    onChange={(e) => setTimeCommitment(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="6–8 hours/week">6–8 hours/week</option>
                    <option value="4–6 hours/week">4–6 hours/week</option>
                    <option value="8+ hours/week">8+ hours/week</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 11 & 12 — PERSONALIZED CONSULTATION & PROGRAM EXPLANATION */}
          {(currentStageNum === 11 || currentStageNum === 12) && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-purple-900 text-white rounded-2xl shadow-lg space-y-2">
                <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest block">
                  STAGE 11 — PERSONALIZED CONSULTATION SUMMARY
                </span>
                <p className="text-sm font-medium leading-relaxed italic">
                  "As a {role} bringing {experience} years of experience, your shortest path to {desiredOutcome} is adding an AI Agent Execution Layer on top of your existing domain knowledge."
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                <span className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider block">
                  STAGE 12 — 3-MONTH PROGRAM STRUCTURE
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold text-gray-800 dark:text-gray-200">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
                    Month 1: Learn AI & LLM Fundamentals
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    Month 2: Build AI Agents & Workflows
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    Month 3: Manage AI-Powered Execution
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 13 — VALUE MATCHING & JOB SUPPORT EXPLANATION */}
          {currentStageNum === 13 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-wrap gap-2 pb-2">
                {[
                  '100% Placement Support',
                  '7 Capstone Projects',
                  '3 Certifications',
                  'Weekend Batch',
                  'Personal AI Agent'
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setActiveDiscussionTopic(activeDiscussionTopic === topic ? null : topic)}
                    className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                      activeDiscussionTopic === topic
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    💬 {topic}
                  </button>
                ))}
              </div>

              {/* Clicked Discussion Topic Content */}
              {activeDiscussionTopic === '100% Placement Support' && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-xs">
                      💼 6 Months Placement Support Explanation
                    </span>
                    <button
                      onClick={() => copyPromptText(getPlacementSupportScript())}
                      className="text-xs text-emerald-700 dark:text-emerald-300 font-bold underline cursor-pointer"
                    >
                      Copy Script
                    </button>
                  </div>
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
                    "{getPlacementSupportScript()}"
                  </p>
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 pt-1">
                    ✓ Clearly frames 100% Placement Support (3–4 WhatsApp profiles/wk) vs contract job guarantee.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE 14 — FIT CONFIRMATION ALIGNMENT */}
          {currentStageNum === 14 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Candidate Fit Confirmation (Stage 14):
                </label>
                <select
                  value={fitCheck}
                  onChange={(e) => setFitCheck(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold text-emerald-600 dark:text-emerald-400"
                >
                  <option value="Yes - Complete Alignment">Yes - Complete Alignment</option>
                  <option value="Mostly - Needs Schedule Confirmation">Mostly - Needs Schedule Confirmation</option>
                  <option value="Uncertain - Needs Decision Partner Review">Uncertain - Needs Decision Partner Review</option>
                  <option value="No - Poor Fit">No - Poor Fit</option>
                </select>
              </div>
            </div>
          )}

          {/* STAGE 15 — BUYING BARRIERS & OBJECTION ENGINE */}
          {currentStageNum === 15 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'PRICE', label: 'Price / Investment (₹39,499)' },
                  { id: 'TIME', label: 'Time / Busy Schedule' },
                  { id: 'JOB_GUARANTEE', label: 'Job Guarantee vs Assistance' }
                ].map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjection(obj.id)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                      selectedObjection === obj.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-800 border border-amber-300 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>

              {selectedObjection && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <span className="font-bold text-gray-400 block text-[10px] uppercase">Clarifying Question to Ask:</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">"{getObjectionHandler(selectedObjection).clarify}"</p>
                  </div>
                  <div>
                    <span className="font-bold text-purple-600 block text-[10px] uppercase">Recommended Spoken Response:</span>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed">"{getObjectionHandler(selectedObjection).response}"</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-800 dark:text-emerald-200 font-extrabold text-xs">
                    Proof Point: {getObjectionHandler(selectedObjection).proof}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE 16 & 17 — BATCH CHOICE & PRICE PRESENTATION */}
          {(currentStageNum === 16 || currentStageNum === 17) && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Preferred Cohort Schedule (Stage 16):
                  </label>
                  <select
                    value={batchChoice}
                    onChange={(e) => setBatchChoice(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Weekend Batch (Sat & Sun 10 AM - 1 PM)">Weekend Batch (Sat & Sun 10 AM - 1 PM) — ~90% Working Pros</option>
                    <option value="Weekday Batch (Mon to Fri 8 PM - 9 PM)">Weekday Batch (Mon to Fri 8 PM - 9 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Decision Authority:
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
                    Budget Readiness (Stage 17):
                  </label>
                  <select
                    value={budgetReadiness}
                    onChange={(e) => setBudgetReadiness(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  >
                    <option value="Ready for ₹5,000 Seat Reservation">Ready for ₹5,000 Seat Reservation</option>
                    <option value="Full Payment Ready (₹39,499)">Full Payment Ready (₹39,499)</option>
                    <option value="Requires EMI / Installments">Requires EMI / Installments</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 18 — TRANSACTIONAL CLOSE & ₹5,000 SEAT RESERVATION */}
          {currentStageNum >= 18 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-5 bg-emerald-900 text-white rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-emerald-700 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                      STAGE 18 — TRANSACTIONAL CLOSING PROTOCOL
                    </span>
                    <h3 className="text-xl font-black mt-0.5">
                      Reserve Seat with ₹5,000 Payment
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-xl shadow">
                    Program Fee: ₹39,499
                  </span>
                </div>

                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  "I am sending the official Aivalytics Razorpay seat reservation link directly to your WhatsApp right now. You can reserve your seat with ₹5,000 today to lock in your spot."
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSendRazorpayLink}
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
                    Open Payment Link Page ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 shrink-0 flex justify-between items-center text-xs">
          <button
            type="button"
            disabled={currentStageNum === 1}
            onClick={() => setCurrentStageNum((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 disabled:opacity-40 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 cursor-pointer"
          >
            ◀ Back Stage
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 cursor-pointer"
            >
              Close Wizard
            </button>

            {currentStageNum < 20 ? (
              <button
                type="button"
                onClick={() => setCurrentStageNum((prev) => Math.min(20, prev + 1))}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Stage ➔</span>
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
                Complete Call & Open CRM ➔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
