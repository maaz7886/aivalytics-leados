// src/components/InteractiveDecisionTree.tsx
import { useState } from 'react';

interface DecisionNode {
  id: string;
  phaseNumber: number;
  stageName: string;
  title: string;
  question: string;
  options: string[];
  purpose: string;
  spokenPrompt: string;
  branchingRules: string;
  hormoziLever?: string;
  category: 'rapport' | 'discovery' | 'outcome' | 'positioning' | 'objection' | 'close';
}

const DECISION_TREE_NODES: DecisionNode[] = [
  {
    id: 'phase-1',
    phaseNumber: 1,
    stageName: 'STAGE 1: RAPPORT & CONTEXT FRAME',
    title: 'Phase 1 — Rapport & Evaluative Frame',
    question: 'Before I give a generic explanation, may I ask a few targeted questions to tell you honestly if this program fits?',
    options: ['Agreed / Fair Enough', 'Just give me price', 'Busy right now'],
    purpose: 'De-escalate sales resistance & establish mutual evaluation authority.',
    spokenPrompt: 'Hi [Name], before I give you a generic explanation, I want to understand your work so I can tell you honestly whether this is relevant for you. Fair enough?',
    branchingRules: 'If Agreed → Branch to Phase 2 Profile. If Price Objection → Pivot to Phase 17 Price Handler.',
    category: 'rapport'
  },
  {
    id: 'phase-2',
    phaseNumber: 2,
    stageName: 'STAGE 1: RAPPORT & CONTEXT FRAME',
    title: 'Phase 2 — Current Role & Experience Branching',
    question: 'What is your current role and how many years of experience do you have?',
    options: ['Project Manager', 'Product Manager', 'Operations Lead', 'Sales / BD', 'Developer / Engineer', 'Healthcare / Pharma', 'Consultant'],
    purpose: 'Reveals domain baseline and triggers role-adapted discovery questions.',
    spokenPrompt: 'What is your current role, and how many years of professional experience do you bring to the table?',
    branchingRules: 'PM → Ask sprint overhead. Sales → Ask GTM transition. Dev → Ask tech lead transition. Ops → Ask manual ERP bottleneck.',
    category: 'rapport'
  },
  {
    id: 'phase-3',
    phaseNumber: 3,
    stageName: 'STAGE 1: RAPPORT & CONTEXT FRAME',
    title: 'Phase 3 — Meta Form Interest Reason',
    question: 'What specifically made you fill out the Meta ad form today?',
    options: ['Career Growth', 'Better Salary', 'AI Relevance', 'Automation Skills', 'Career Switch', 'Exploring'],
    purpose: 'Uncovers core intrinsic motive behind inbound lead action.',
    spokenPrompt: 'What caught your eye on our ad that made you fill out the form today?',
    branchingRules: 'Growth/Salary → Probe 12-mo target hike. AI Relevance → Activate fear of obsolescence in Phase 5.',
    category: 'rapport'
  },
  {
    id: 'phase-4',
    phaseNumber: 4,
    stageName: 'STAGE 2: AI MATURITY & PAIN DIAGNOSIS',
    title: 'Phase 4 — Current AI Usage Maturity Matrix',
    question: 'How are you currently using AI tools in your day-to-day work?',
    options: ['Level 0: Don\'t use AI', 'Level 1: Basic ChatGPT prompts', 'Level 2: Multiple AI tools', 'Level 3: n8n/Zapier automations', 'Level 4: Custom agent scripts'],
    purpose: 'Establishes baseline technical maturity and identifies the skill gap.',
    spokenPrompt: 'How are you currently applying AI tools like ChatGPT or Claude in your regular work routine?',
    branchingRules: 'Level 0-1 → Emphasize SOP engineering & No-Code n8n. Level 2-3 → Emphasize Multi-Agent Orchestration & RAG.',
    category: 'discovery'
  },
  {
    id: 'phase-5',
    phaseNumber: 5,
    stageName: 'STAGE 2: AI MATURITY & PAIN DIAGNOSIS',
    title: 'Phase 5 — Bottleneck & Cost of Inaction Engine',
    question: 'What is the biggest operational bottleneck in your role, and what concerns you if nothing changes in 12 months?',
    options: ['Manual sprint tracking', 'Endless status follow-ups', 'Heavy PRD documentation', 'Career stagnation', 'Fear of AI obsolescence'],
    purpose: 'Activates loss aversion and Quantifies time leaks (5–10 hrs/wk).',
    spokenPrompt: 'What part of your weekly work takes 5 to 10 hours but doesn\'t actually require your strategic judgment?',
    branchingRules: 'Quantify weekly lost hours. If nothing changes in 12 mos → Highlight falling behind tech-native managers.',
    hormoziLever: 'Increases Effort & Sacrifice perception of STATUS QUO.',
    category: 'discovery'
  },
  {
    id: 'phase-6',
    phaseNumber: 6,
    stageName: 'STAGE 3: DESIRED OUTCOME & GAP IDENTIFICATION',
    title: 'Phase 6 — 6–12 Month Desired Outcome & Future Pacing',
    question: 'What primary outcome do you want to achieve in the next 6 to 12 months?',
    options: ['Promotion in current company', 'Salary hike (30%+ target)', 'Switch to AI Project Manager', 'Move to AI Operations', 'Start AI Consulting'],
    purpose: 'Defines the prospect\'s Dream Outcome for Hormozi value equation.',
    spokenPrompt: 'If we were talking 1 year from today celebrating, what designation and salary package would you be holding?',
    branchingRules: 'Set DREAM_OUTCOME parameter. Frame program as the fastest 90-day vehicle to unlock it.',
    hormoziLever: 'Maximizes DREAM OUTCOME variable.',
    category: 'outcome'
  },
  {
    id: 'phase-7',
    phaseNumber: 7,
    stageName: 'STAGE 3: DESIRED OUTCOME & GAP IDENTIFICATION',
    title: 'Phase 7 — Career Designation Mapping',
    question: 'Which work style excites you most (Managing people, systems, automation, or strategy)?',
    options: ['Lead AI Project Manager', 'Director of AI PMO', 'AI Solutions Architect', 'Head of AI Operations', 'AI Transformation Manager'],
    purpose: 'Maps current experience + AI capabilities into a high-value target title.',
    spokenPrompt: 'We map your existing experience directly into senior roles like Director of AI-Native PMO or AI Operations Lead.',
    branchingRules: 'Never guarantee job titles; position as realistic target designations based on added AI execution layer.',
    category: 'outcome'
  },
  {
    id: 'phase-8',
    phaseNumber: 8,
    stageName: 'STAGE 3: DESIRED OUTCOME & GAP IDENTIFICATION',
    title: 'Phase 8 — Dominant Capability Gap Isolation',
    question: 'What single barrier is stopping you from reaching that role today?',
    options: ['Lack of practical agent portfolio', 'No n8n automation skills', 'Lack of formal PM framework', 'No recognized certifications', 'Lack of placement guidance'],
    purpose: 'Isolates the single dominant barrier to trigger contextual value stacking.',
    spokenPrompt: 'If we could solve ONLY ONE of these in the next 90 days, which one would make the biggest difference for your career?',
    branchingRules: 'Portfolio gap → Emphasize 7 capstones + custom agent. Job gap → Emphasize 3 certs + 100% job assistance.',
    category: 'outcome'
  },
  {
    id: 'phase-9',
    phaseNumber: 9,
    stageName: 'STAGE 4: URGENCY, COMMITMENT & AUTHORITY',
    title: 'Phase 9 — Urgency & Milestone Trigger',
    question: 'How urgently do you want to make this career transition?',
    options: ['Immediately (Next 30 days)', 'Within 1–3 months', '3–6 months', '6–12 months'],
    purpose: 'Evaluates timeline pressure (upcoming appraisals, active interviews).',
    spokenPrompt: 'When are you looking to make this transition—are you actively interviewing right now or preparing for an appraisal?',
    branchingRules: '<30 days → Urgency score +20. >6 mos → Future-pace competitive loss to peers.',
    category: 'discovery'
  },
  {
    id: 'phase-10',
    phaseNumber: 10,
    stageName: 'STAGE 4: URGENCY, COMMITMENT & AUTHORITY',
    title: 'Phase 10 — Time Commitment & Cohort Format',
    question: 'How many hours per week can you invest, and which cohort schedule fits?',
    options: ['Weekend Batch (Sat & Sun 3 hrs/day)', 'Weekday Batch (Mon-Fri 1 hr/day)', 'Recorded Sessions Only'],
    purpose: 'Verifies execution readiness and cohort fit (~90% working pros in weekend batch).',
    spokenPrompt: 'Around 90% of our enrolled managers choose the Weekend Batch because it allows focused learning without weekday work stress.',
    branchingRules: 'Weekend choice → Reinforce working professional community proof point.',
    category: 'discovery'
  },
  {
    id: 'phase-11',
    phaseNumber: 11,
    stageName: 'STAGE 4: URGENCY, COMMITMENT & AUTHORITY',
    title: 'Phase 11 — Competitive Evaluation (YouTube vs Cohort)',
    question: 'Are you currently comparing other courses or trying YouTube self-learning?',
    options: ['YouTube / Free videos', 'Comparing live institutes', 'Not comparing anywhere else'],
    purpose: 'Distinguishes scattered free videos from structured 7-capstone execution.',
    spokenPrompt: 'YouTube gives scattered theory snippets. Have you built a working multi-agent sprint auditor yet from YouTube videos?',
    branchingRules: 'YouTube → Highlight structured 90-day roadmap + 1-on-1 code reviews.',
    category: 'discovery'
  },
  {
    id: 'phase-12',
    phaseNumber: 12,
    stageName: 'STAGE 4: URGENCY, COMMITMENT & AUTHORITY',
    title: 'Phase 12 — Decision Authority & Financial Friction',
    question: 'Will you make the decision independently or discuss with spouse/employer?',
    options: ['Independent decision maker', 'Discuss with spouse/family', 'Employer sponsorship required'],
    purpose: 'Identifies true decision authority and budget readiness.',
    spokenPrompt: 'If you see 100% alignment today, is there anything else that would prevent you from reserving your seat in this batch?',
    branchingRules: 'Spouse approval → Reserve seat with ₹5,000 refundable deposit while reviewing together.',
    category: 'discovery'
  },
  {
    id: 'phase-13',
    phaseNumber: 13,
    stageName: 'STAGE 5: PERSONALIZED POSITIONING & VALUE STACK',
    title: 'Phase 13 — Algorithmic Positioning Engine',
    question: 'Spoken Re-framing Script Output based on prospect profile',
    options: ['PM Position Track', 'Sales/GTM Position Track', 'Dev/Tech Lead Track', 'Ops Automation Track'],
    purpose: 'Re-frames prospect experience without throwing away past years of work.',
    spokenPrompt: 'You don\'t need to throw away your [Yrs] years of [Role] experience. The fastest path is adding an AI Agent Execution Layer on top of what you already know.',
    branchingRules: 'Inject prospect\'s exact role & years into spoken positioning script.',
    category: 'positioning'
  },
  {
    id: 'phase-14',
    phaseNumber: 14,
    stageName: 'STAGE 5: PERSONALIZED POSITIONING & VALUE STACK',
    title: 'Phase 14 — Hormozi Value Equation Optimization',
    question: 'Value = (Dream Outcome × Likelihood) / (Time Delay × Effort)',
    options: ['Increase Likelihood (7 Projects)', 'Decrease Time Delay (90 Days)', 'Decrease Effort (AI Assistant)'],
    purpose: 'Mathematically maximizes perceived value of ₹39,499 program.',
    spokenPrompt: 'We maximize likelihood with 7 live projects, compress time to 90 days, and reduce effort using your personal AI learning agent.',
    branchingRules: 'Map program deliverables to counter prospect\'s specific value friction.',
    hormoziLever: 'Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)',
    category: 'positioning'
  },
  {
    id: 'phase-15',
    phaseNumber: 15,
    stageName: 'STAGE 5: PERSONALIZED POSITIONING & VALUE STACK',
    title: 'Phase 15 — Contextual Value Stacking Engine',
    question: 'Presents ONLY the top 3 deliverables solving prospect\'s primary barrier',
    options: ['Stack A: 7 Capstones + Custom Agent', 'Stack B: 3 Certs + 100% Job Support', 'Stack C: Weekend Format + AI Tracker'],
    purpose: 'Prevents feature dumping; delivers targeted value presentation.',
    spokenPrompt: 'Based on your gap in [Primary Barrier], here are the 3 specific deliverables that solve it for you.',
    branchingRules: 'Render custom 3-item value stack card based on Phase 8 choice.',
    category: 'positioning'
  },
  {
    id: 'phase-16',
    phaseNumber: 16,
    stageName: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE',
    title: 'Phase 16 — Solution Fit Validation',
    question: 'Based on our discussion, do you feel this 3-month roadmap solves your bottleneck?',
    options: ['Yes - Complete fit', 'Mostly - Timing question', 'Not sure - Needs clarification', 'No fit'],
    purpose: 'Validates alignment before initiating transactional closing script.',
    spokenPrompt: 'Based on everything we\'ve covered, do you feel this 3-month AI-Native Project Management roadmap directly addresses what you\'re looking for?',
    branchingRules: 'If YES → Move to Phase 19/20 Close. If NOT SURE → Trigger Phase 17 Objection Solver.',
    category: 'objection'
  },
  {
    id: 'phase-17',
    phaseNumber: 17,
    stageName: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE',
    title: 'Phase 17 — 11-Objection Resolution Engine',
    question: 'Select active objection: Price, Time, Job Guarantee, YouTube, Certification, Trust',
    options: ['PRICE (₹39,499)', 'TIME (Busy job)', 'JOB GUARANTEE (Placement)', 'YOUTUBE (Self-learn)', 'REFUND (Risk)'],
    purpose: 'Provides exact clarifying questions, non-manipulative responses, and proof points.',
    spokenPrompt: 'Clarify objection intention → Frame contrast/investment → Present evidence → Pivot to readiness question.',
    branchingRules: 'Price → Frame ₹438/day & ₹5,000 seat deposit. Job → Separate 100% assistance from false guarantees. Time → Highlight weekend batch & recordings.',
    category: 'objection'
  },
  {
    id: 'phase-18',
    phaseNumber: 18,
    stageName: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE',
    title: 'Phase 18 — Final Readiness Question',
    question: 'If timing & refund guarantee fit, is there anything stopping you from joining today?',
    options: ['Nothing (Ready to Close)', 'Send Payment Link', 'Need Spouse Approval', 'Unresolved Question'],
    purpose: 'Uncovers any hidden secondary objections before payment link dispatch.',
    spokenPrompt: 'If we confirm the weekend timing fits and you have the 2-week money-back guarantee backing you, is there anything else stopping you from reserving your seat today?',
    branchingRules: 'Nothing → Proceed immediately to Phase 20 Payment Dispatch.',
    category: 'close'
  },
  {
    id: 'phase-19',
    phaseNumber: 19,
    stageName: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE',
    title: 'Phase 19 — Cohort Batch Choice Strategy',
    question: 'Which batch timing suits your weekly routine better?',
    options: ['Weekend Batch (Sat & Sun 10 AM - 1 PM)', 'Weekday Batch (Mon-Fri 8 PM - 9 PM)'],
    purpose: 'Locks in scheduling commitment before seat reservation.',
    spokenPrompt: 'Which schedule fits your weekly routine better—the Weekend 3-hour sessions or Weekday 1-hour sessions?',
    branchingRules: 'Weekend choice → Note ~90% working professional cohort density.',
    category: 'close'
  },
  {
    id: 'phase-20',
    phaseNumber: 20,
    stageName: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE',
    title: 'Phase 20 — Transactional Close & ₹5,000 Seat Reservation',
    question: 'Would you like to reserve your seat with ₹5,000 via Razorpay link now?',
    options: ['Send Payment Link', 'Full Payment (₹39,499)', 'Need Some Time', 'Not Ready'],
    purpose: 'Executes live seat reservation close via official Razorpay payment link.',
    spokenPrompt: 'I am sending the official Aivalytics Razorpay reservation link directly to your WhatsApp and Email now. You can reserve your seat with ₹5,000 today. Shall I stay on the line while you complete it?',
    branchingRules: 'Dispatch Razorpay link (https://rzp.io/rzp/dXXePYb) → Update CRM stage to "Payment Link Sent".',
    category: 'close'
  },
  {
    id: 'phase-21',
    phaseNumber: 21,
    stageName: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE',
    title: 'Phase 21 — Algorithmic 100-Point Lead Scoring Engine',
    question: 'Score = Fit(25) + Urgency(20) + Pain(15) + Goal(10) + Gap(10) + Commit(10) + Auth(5) + Budget(5)',
    options: ['80-100: Hot Lead', '60-79: Strong Lead', '40-59: Nurture', '<40: Low Intent'],
    purpose: 'Mathematically calculates lead quality and prioritization tier.',
    spokenPrompt: 'Calculates objective 0–100 score based on 8 weighted behavioral factors.',
    branchingRules: 'Score 80-100 → Priority 1 immediate follow-up. Score <40 → Low priority nurture sequence.',
    category: 'close'
  },
  {
    id: 'phase-22-24',
    phaseNumber: 22,
    stageName: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE',
    title: 'Phases 22–24 — Automated Telemetry & Behavioral Principles',
    question: 'Generates Post-Call JSON Summary, Next Best Action HUD & Behavioral Rules',
    options: ['Talk <35%', 'One Question Rule', 'Echo Prospect Pain', 'No Fake Scarcity'],
    purpose: 'Ensures data integrity, post-call CRM logging, and non-manipulative consultative execution.',
    spokenPrompt: 'Automatically logs JSON telemetry, sets follow-up date, and enforces talk-time rules (<35%).',
    branchingRules: 'Save call log to Supabase PostgreSQL & update pipeline status.',
    category: 'close'
  }
];

export default function InteractiveDecisionTree() {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [activeNodeId, setActiveNodeId] = useState<string>('phase-1');
  const [simulatedPath, setSimulatedPath] = useState<string[]>(['phase-1']);

  const activeNode = DECISION_TREE_NODES.find((n) => n.id === activeNodeId) || DECISION_TREE_NODES[0];

  const handleNodeClick = (nodeId: string) => {
    setActiveNodeId(nodeId);
    if (!simulatedPath.includes(nodeId)) {
      setSimulatedPath((prev) => [...prev, nodeId]);
    }
  };

  const resetSimulation = () => {
    setActiveNodeId('phase-1');
    setSimulatedPath(['phase-1']);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Header & Role Branch Filter */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
              Aivalytics 24-Phase Consultative Sales Decision Tree
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Interactive visual node tree for the AI-Native Project Management program.
            Click any phase node to inspect questions, spoken prompts, Hormozi value levers, and branching logic.
          </p>
        </div>

        {/* Role Path Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Simulate Role Path:</span>
          {['All', 'Project Manager', 'Sales / BD', 'Developer', 'Operations'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRoleFilter === role
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {role}
            </button>
          ))}
          <button
            onClick={resetSimulation}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer ml-2"
          >
            🔄 Reset Path
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Tree Map (Left 65%) & Node Detail Inspector (Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Decision Tree Nodes Grid (8 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Interactive Node Flowchart (Phases 1 – 24)
            </span>
            <span className="text-xs text-gray-400 font-bold">
              Simulated Steps: {simulatedPath.length} / 22 Nodes Visited
            </span>
          </div>

          {/* Tree Node List grouped by Stage */}
          <div className="space-y-6">
            {[
              { stage: 'STAGE 1: RAPPORT & CONTEXT FRAME', color: 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20' },
              { stage: 'STAGE 2: AI MATURITY & PAIN DIAGNOSIS', color: 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20' },
              { stage: 'STAGE 3: DESIRED OUTCOME & GAP IDENTIFICATION', color: 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20' },
              { stage: 'STAGE 4: URGENCY, COMMITMENT & AUTHORITY', color: 'border-purple-500 bg-purple-50/20 dark:bg-purple-950/20' },
              { stage: 'STAGE 5: PERSONALIZED POSITIONING & VALUE STACK', color: 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' },
              { stage: 'STAGE 6: OBJECTION RESOLUTION & TRANSACTIONAL CLOSE', color: 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20' }
            ].map((group) => {
              const groupNodes = DECISION_TREE_NODES.filter((n) => n.stageName === group.stage);

              return (
                <div key={group.stage} className={`p-4 rounded-2xl border-l-4 ${group.color} space-y-3`}>
                  <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 tracking-wider uppercase">
                    {group.stage}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupNodes.map((node) => {
                      const isActive = node.id === activeNodeId;
                      const isVisited = simulatedPath.includes(node.id);

                      return (
                        <div
                          key={node.id}
                          onClick={() => handleNodeClick(node.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isActive
                              ? 'bg-purple-600 text-white border-purple-600 shadow-lg ring-2 ring-purple-400'
                              : isVisited
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-gray-900 dark:text-gray-100'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              }`}
                            >
                              Phase {node.phaseNumber}
                            </span>
                            {isVisited && (
                              <span className="text-[10px] font-bold text-emerald-500">✓ Visited</span>
                            )}
                          </div>

                          <div>
                            <h5 className="font-extrabold text-xs line-clamp-1">{node.title}</h5>
                            <p className={`text-[11px] mt-0.5 line-clamp-2 ${isActive ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                              {node.purpose}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-bold pt-1 border-t border-gray-100 dark:border-gray-700/50">
                            <span className={isActive ? 'text-purple-200' : 'text-purple-600 dark:text-purple-400'}>
                              {node.options.length} Decision Paths
                            </span>
                            <span>Inspect Node ➔</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Detail Inspector & Teleprompter Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5 sticky top-6">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Node Inspector & Teleprompter HUD
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mt-0.5">
                  Phase {activeNode.phaseNumber}: {activeNode.title}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs rounded-lg">
                Stage {Math.ceil(activeNode.phaseNumber / 4)}
              </span>
            </div>

            {/* Purpose & Goal */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-purple-800 dark:text-purple-300 block uppercase">
                🎯 Strategic Purpose:
              </span>
              <p className="text-xs text-gray-800 dark:text-gray-200 font-medium">{activeNode.purpose}</p>
            </div>

            {/* Spoken Teleprompter Prompt */}
            <div className="p-4 bg-gray-900 text-white rounded-xl space-y-2 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider">
                  🗣️ Spoken Teleprompter Prompt:
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(activeNode.spokenPrompt)}
                  className="text-[10px] text-purple-300 hover:text-white font-bold underline cursor-pointer"
                >
                  Copy Prompt
                </button>
              </div>
              <p className="text-xs font-medium italic text-gray-200 leading-relaxed">
                "{activeNode.spokenPrompt}"
              </p>
            </div>

            {/* Available Options / Candidate Response Choices */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block uppercase">
                Candidate Response Options:
              </span>
              <div className="space-y-1.5">
                {activeNode.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between"
                  >
                    <span>🔹 {opt}</span>
                    <span className="text-[10px] text-purple-600 font-bold">Path {idx + 1} ➔</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Branching Logic & Rules */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1 text-xs">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 block">🔀 Branching Engine Rules:</span>
              <p className="text-gray-700 dark:text-gray-300">{activeNode.branchingRules}</p>
            </div>

            {/* Hormozi Value Equation Driver if applicable */}
            {activeNode.hormoziLever && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1 text-xs">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">📐 Hormozi Value Driver:</span>
                <p className="text-gray-700 dark:text-gray-300 font-mono text-[11px]">{activeNode.hormoziLever}</p>
              </div>
            )}

            {/* Navigation Buttons for Inspector */}
            <div className="flex justify-between items-center pt-2">
              <button
                disabled={activeNode.phaseNumber === 1}
                onClick={() => {
                  const prevIndex = DECISION_TREE_NODES.findIndex((n) => n.id === activeNode.id) - 1;
                  if (prevIndex >= 0) handleNodeClick(DECISION_TREE_NODES[prevIndex].id);
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-xs hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
              >
                ◀ Previous Phase
              </button>

              <button
                disabled={activeNode.phaseNumber === 22}
                onClick={() => {
                  const nextIndex = DECISION_TREE_NODES.findIndex((n) => n.id === activeNode.id) + 1;
                  if (nextIndex < DECISION_TREE_NODES.length) handleNodeClick(DECISION_TREE_NODES[nextIndex].id);
                }}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg text-xs shadow-xs cursor-pointer"
              >
                Next Phase ➔
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
