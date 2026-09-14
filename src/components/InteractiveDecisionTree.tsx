// src/components/InteractiveDecisionTree.tsx
import { useState } from 'react';

export interface DecisionNodeFull {
  id: string;
  stageNumber: number;
  stageName: string;
  objective: string;
  whatWeKnow: string;
  spokenScript: string;
  questionToAsk: string;
  whyAsk: string;
  possibleAnswers: {
    label: string;
    whatItTellsUs: string;
    crmDataToSave: string;
    recommendedResponse: string;
    discussionTopics: string[];
    whatNotToSay: string;
    nextNodeId: string;
    buyingSignal: 'High' | 'Medium' | 'Low';
    urgencyImpact: 'Increase' | 'Neutral' | 'Decrease';
    fitImpact: 'Increase' | 'Neutral' | 'Decrease';
  }[];
}

export const TWENTY_STAGE_DECISION_NODES: DecisionNodeFull[] = [
  {
    id: 'stage-1',
    stageNumber: 1,
    stageName: 'STAGE 1 — OPENING & PERMISSION FRAME',
    objective: 'Establish permission frame, de-escalate sales resistance, and set consultative ground rules.',
    whatWeKnow: 'Inbound lead contact details, Meta ad campaign source.',
    spokenScript: 'Hi [Name], this is Maaz calling from Aivalytics. We recently received your inquiry regarding our AI-Native Project Management program. Is this a good time for a quick conversation?',
    questionToAsk: 'Is this a good time for a quick conversation?',
    whyAsk: 'Respects prospect time and secures permission to evaluate mutual relevance.',
    possibleAnswers: [
      {
        label: 'Yes - Good Time',
        whatItTellsUs: 'Prospect is open and ready to engage in conversation.',
        crmDataToSave: 'opening_outcome = "Engaged"',
        recommendedResponse: 'Perfect. Before I give a generic explanation, I\'d just like to understand your background and what caught your attention so I can tell you honestly if the program is relevant for you. Is that fair?',
        discussionTopics: ['Evaluative Frame', 'Background Alignment'],
        whatNotToSay: 'Do not immediately launch into a 5-minute curriculum pitch.',
        nextNodeId: 'stage-2',
        buyingSignal: 'Medium',
        urgencyImpact: 'Neutral',
        fitImpact: 'Neutral'
      },
      {
        label: 'I only have 2 minutes',
        whatItTellsUs: 'Time-constrained prospect with medium sales resistance.',
        crmDataToSave: 'opening_outcome = "Time Constraint 2m"',
        recommendedResponse: 'I understand completely. I\'ll keep this to 90 seconds—what was the primary challenge or goal that made you fill out our Meta form today?',
        discussionTopics: ['Quick Diagnostic', 'Core Bottleneck'],
        whatNotToSay: 'Do not ignore their time constraint or make long speeches.',
        nextNodeId: 'stage-2',
        buyingSignal: 'Medium',
        urgencyImpact: 'Increase',
        fitImpact: 'Neutral'
      },
      {
        label: 'What is this regarding?',
        whatItTellsUs: 'Prospect forgot filling out form or receives high call volume.',
        crmDataToSave: 'opening_outcome = "Query Context"',
        recommendedResponse: 'You recently filled out our form on Meta regarding AI-Native Project Management to learn how AI agents automate project execution.',
        discussionTopics: ['Program Context', 'Meta Ad Reminder'],
        whatNotToSay: 'Do not sound defensive or accuse them of forgetting.',
        nextNodeId: 'stage-2',
        buyingSignal: 'Low',
        urgencyImpact: 'Neutral',
        fitImpact: 'Neutral'
      },
      {
        label: 'Not interested / Wrong time',
        whatItTellsUs: 'Unqualified or busy prospect.',
        crmDataToSave: 'opening_outcome = "Not Interested / Reschedule"',
        recommendedResponse: 'No problem at all. Would it be better if I sent our 90-day AI execution roadmap on WhatsApp for you to review later?',
        discussionTopics: ['WhatsApp Nurture', 'Roadmap Share'],
        whatNotToSay: 'Do not argue or push aggressively.',
        nextNodeId: 'stage-19',
        buyingSignal: 'Low',
        urgencyImpact: 'Decrease',
        fitImpact: 'Decrease'
      }
    ]
  },
  {
    id: 'stage-2',
    stageNumber: 2,
    stageName: 'STAGE 2 — INITIAL MOTIVATION & TRIGGER',
    objective: 'Uncover the primary intrinsic motive driving inbound lead interest.',
    whatWeKnow: 'Prospect agreed to evaluate mutual fit.',
    spokenScript: 'Before I explain the program details, I want to make sure we focus on what matters to you.',
    questionToAsk: 'What specifically caught your attention when you saw the program?',
    whyAsk: 'Determines whether candidate cares most about AI tools, career growth, salary hikes, or role switches.',
    possibleAnswers: [
      {
        label: 'Job Switch / Career Transition',
        whatItTellsUs: 'Career transition and placement outcome is the primary buying driver.',
        crmDataToSave: 'initial_trigger = "Job Switch"',
        recommendedResponse: 'Got it. Then for you, the important question isn\'t just what we\'ll teach—it\'s whether the skills you build here can actually help you position yourself for a stronger role.',
        discussionTopics: ['Career Transition', 'Role Positioning', 'Placement Support'],
        whatNotToSay: 'Do not promise immediate job guarantees or guarantee salary figures.',
        nextNodeId: 'stage-3',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      },
      {
        label: 'AI & Automation Skills',
        whatItTellsUs: 'Technical and operational capability enhancement is primary driver.',
        crmDataToSave: 'initial_trigger = "AI Automation"',
        recommendedResponse: 'Makes complete sense. We focus 100% on practical execution—building n8n workflows, custom GPT agents, and SOP engineering rather than just theory.',
        discussionTopics: ['n8n Workflows', '7 Capstone Projects', 'Custom AI Agent'],
        whatNotToSay: 'Do not treat them as a job seeker if they only want skill building.',
        nextNodeId: 'stage-3',
        buyingSignal: 'High',
        urgencyImpact: 'Neutral',
        fitImpact: 'Increase'
      },
      {
        label: 'Career Growth / Salary Hike',
        whatItTellsUs: 'Financial growth and promotion in current company is primary driver.',
        crmDataToSave: 'initial_trigger = "Career Growth"',
        recommendedResponse: 'Understood. Adding an AI agent execution layer to your existing domain experience is the single fastest way to position yourself for senior leadership.',
        discussionTopics: ['AI Leadership', 'Salary Hike Positioning'],
        whatNotToSay: 'Do not tell them to leave their company if they want a promotion.',
        nextNodeId: 'stage-3',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-3',
    stageNumber: 3,
    stageName: 'STAGE 3 — CURRENT ROLE & DOMAIN BRANCHING',
    objective: 'Identify current professional background and activate role-specific consultative branch.',
    whatWeKnow: 'Initial trigger & motivation established.',
    spokenScript: 'To tailor how AI applies to your specific work, what role are you currently working in?',
    questionToAsk: 'What role are you currently working in?',
    whyAsk: 'Role dictates the exact positioning script and capability gap.',
    possibleAnswers: [
      {
        label: 'Project Manager / Product Manager',
        whatItTellsUs: 'Understands Agile/PM framework; needs AI automation layer.',
        crmDataToSave: 'current_role = "Project Manager"',
        recommendedResponse: 'You already understand project execution. So the real value for you isn\'t relearning project management—it\'s adding AI agents and automation on top of your existing experience.',
        discussionTopics: ['Autonomous Sprint Auditor', 'PRD Automation', 'Director of AI PMO'],
        whatNotToSay: 'Do NOT teach basic project management concepts or WBS 101.',
        nextNodeId: 'stage-4',
        buyingSignal: 'High',
        urgencyImpact: 'Neutral',
        fitImpact: 'Increase'
      },
      {
        label: 'Sales / Business Development',
        whatItTellsUs: 'Strong customer skills; wants to move into implementation or AI ops.',
        crmDataToSave: 'current_role = "Sales AE"',
        recommendedResponse: 'Your advantage is that you already understand customers and commercial outcomes. If you add project execution and AI capability, you become relevant for roles between client delivery and implementation.',
        discussionTopics: ['Implementation Manager', 'AI Growth Operations', 'Customer Success + AI'],
        whatNotToSay: 'Do not tell them their sales background is useless.',
        nextNodeId: 'stage-4',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      },
      {
        label: 'Software Developer / Engineer',
        whatItTellsUs: 'Technical background; wants to move toward project ownership and management.',
        crmDataToSave: 'current_role = "Developer"',
        recommendedResponse: 'You already understand logic. This program bridges the gap between writing code and managing enterprise AI transformation projects as a Technical Program Manager.',
        discussionTopics: ['Technical PM', 'Multi-Agent Orchestration', 'Managing AI Systems'],
        whatNotToSay: 'Do not focus purely on basic no-code tools.',
        nextNodeId: 'stage-4',
        buyingSignal: 'High',
        urgencyImpact: 'Neutral',
        fitImpact: 'Increase'
      },
      {
        label: 'Operations Professional',
        whatItTellsUs: 'Deals with process bottlenecks, manual ERPs, and vendor tracking.',
        crmDataToSave: 'current_role = "Operations Lead"',
        recommendedResponse: 'You already understand operational processes. We help you turn those manual spreadsheets and follow-ups into AI-powered n8n workflows.',
        discussionTopics: ['Head of AI Operations', 'n8n Business Automation', 'SOP Engineering'],
        whatNotToSay: 'Do not pitch abstract AI theory without operational relevance.',
        nextNodeId: 'stage-4',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-4',
    stageNumber: 4,
    stageName: 'STAGE 4 — EXPERIENCE CALIBRATION',
    objective: 'Determine seniority and adjust value positioning to match candidate career level.',
    whatWeKnow: 'Role and primary motivation captured.',
    spokenScript: 'How many years of professional experience do you have in your career so far?',
    questionToAsk: 'How many years of professional experience do you have?',
    whyAsk: 'Seniority dictates whether we position for career foundation or enterprise transformation leadership.',
    possibleAnswers: [
      {
        label: '0–2 Years Experience',
        whatItTellsUs: 'Early career; needs portfolio projects and practical confidence.',
        crmDataToSave: 'experience_years = 1',
        recommendedResponse: 'At your stage, the key is building a practical project portfolio that proves you can build real AI agent workflows to stand out from other applicants.',
        discussionTopics: ['7 Capstone Projects', 'GitHub Portfolio', 'Practical AI Skills'],
        whatNotToSay: 'Do not pitch executive PMO leadership strategies.',
        nextNodeId: 'stage-5',
        buyingSignal: 'Medium',
        urgencyImpact: 'Neutral',
        fitImpact: 'Neutral'
      },
      {
        label: '5–8 Years Experience',
        whatItTellsUs: 'Mid-career manager; ready for major salary hike or senior AI PM role.',
        crmDataToSave: 'experience_years = 6',
        recommendedResponse: 'At 5 to 8 years, adding an AI execution layer to your existing domain expertise is the single fastest lever for career acceleration.',
        discussionTopics: ['AI Execution Layer', 'Salary Hike Positioning', 'Senior AI PM Role'],
        whatNotToSay: 'Do not treat them like a junior candidate.',
        nextNodeId: 'stage-5',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      },
      {
        label: '8–12+ Years Experience',
        whatItTellsUs: 'Senior manager / leader; wants AI transformation and team management capability.',
        crmDataToSave: 'experience_years = 10',
        recommendedResponse: 'At your level, your value isn\'t writing sprint cards manually. It\'s architecting multi-agent execution systems and leading AI-native project transformation.',
        discussionTopics: ['AI Transformation Leadership', 'Director of AI PMO', 'Multi-Agent Strategy'],
        whatNotToSay: 'Never position a 10+ year professional like a fresher or entry-level learner.',
        nextNodeId: 'stage-5',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-5',
    stageNumber: 5,
    stageName: 'STAGE 5 — AI MATURITY MATRIX',
    objective: 'Establish current AI tooling baseline.',
    whatWeKnow: 'Role and experience calibrated.',
    spokenScript: 'How are you currently applying AI tools in your day-to-day work?',
    questionToAsk: 'How are you currently using AI?',
    whyAsk: 'Prevents over-selling basics to advanced users, and prevents scaring beginners.',
    possibleAnswers: [
      {
        label: 'Level 0: Don\'t use AI regularly',
        whatItTellsUs: 'Beginner; needs step-by-step guided building.',
        crmDataToSave: 'ai_maturity = "Level 0"',
        recommendedResponse: 'That\'s completely fine. We start with AI fundamentals before moving into building agents and automations.',
        discussionTopics: ['Guided Learning', 'Step-by-Step Curriculum'],
        whatNotToSay: 'Do not overwhelm them with complex developer terminology.',
        nextNodeId: 'stage-6',
        buyingSignal: 'Medium',
        urgencyImpact: 'Neutral',
        fitImpact: 'Neutral'
      },
      {
        label: 'Level 1: ChatGPT / Claude basic prompts',
        whatItTellsUs: 'Uses AI for simple text; ready to transition from prompting to agent systems.',
        crmDataToSave: 'ai_maturity = "Level 1"',
        recommendedResponse: 'You\'ve mastered prompting. Now the step is moving from basic text generation to building autonomous n8n agent workflows.',
        discussionTopics: ['n8n Workflows', 'Agent Orchestration'],
        whatNotToSay: 'Do not stay stuck explaining basic ChatGPT prompts.',
        nextNodeId: 'stage-6',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-6',
    stageNumber: 6,
    stageName: 'STAGE 6 — CURRENT PAIN & COST OF INACTION',
    objective: 'Quantify weekly operational bottleneck and cost of staying still.',
    whatWeKnow: 'AI maturity established.',
    spokenScript: 'What is the biggest operational challenge in your role right now?',
    questionToAsk: 'What is the biggest challenge you\'re facing in your role right now?',
    whyAsk: 'Establishes cost of inaction and identifies manual time leaks.',
    possibleAnswers: [
      {
        label: 'Too much repetitive manual work',
        whatItTellsUs: 'Losing 5–10 hrs/wk to status updates, PRDs, and reporting.',
        crmDataToSave: 'primary_pain = "Repetitive Work"',
        recommendedResponse: 'Imagine parts of reporting, documentation, and follow-ups being handled automatically by AI agent workflows while you focus on strategic decisions.',
        discussionTopics: ['PRD Generator', 'Autonomous Sprint Auditor', 'Time Recovery'],
        whatNotToSay: 'Do not offer vague advice without connecting to AI agent solutions.',
        nextNodeId: 'stage-7',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      },
      {
        label: 'Career stagnation & flat salary',
        whatItTellsUs: 'Strong financial & growth pain.',
        crmDataToSave: 'primary_pain = "Stagnation"',
        recommendedResponse: 'Staying stagnant while tech-native managers deploy AI agents creates a major capability gap over the next 12 months.',
        discussionTopics: ['Cost of Inaction', 'Salary Hike Positioning'],
        whatNotToSay: 'Do not minimize their career frustration.',
        nextNodeId: 'stage-7',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-7',
    stageNumber: 7,
    stageName: 'STAGE 7 — DESIRED OUTCOME & FUTURE PACING',
    objective: 'Define the prospect\'s Dream Outcome.',
    whatWeKnow: 'Pain and time leaks quantified.',
    spokenScript: 'If we look 6 to 12 months ahead, what would make this investment 100% worth it for you?',
    questionToAsk: 'What outcome would make this program a complete success for you?',
    whyAsk: 'Defines DREAM OUTCOME parameter for Hormozi value equation.',
    possibleAnswers: [
      {
        label: 'Switch to higher-paying AI PM role',
        whatItTellsUs: 'Wants career transition and placement support.',
        crmDataToSave: 'desired_outcome = "Role Switch AI-PM"',
        recommendedResponse: 'Then our entire focus will be on building your 7 capstone projects and positioning your profile for senior AI Project Manager roles.',
        discussionTopics: ['AI PM Positioning', '6 Mo Placement Support', '7 Projects'],
        whatNotToSay: 'Do not promise job guarantees.',
        nextNodeId: 'stage-8',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-8',
    stageNumber: 8,
    stageName: 'STAGE 8 — TARGET ROLE / DESIGNATION',
    objective: 'Pinpoint target role title for LinkedIn & resume alignment.',
    whatWeKnow: 'Desired outcome defined.',
    spokenScript: 'What specific role title do you ideally want to hold 6 months from now?',
    questionToAsk: 'What kind of role are you targeting?',
    whyAsk: 'Allows precise career direction mapping.',
    possibleAnswers: [
      {
        label: 'AI Project Manager / Director of PMO',
        whatItTellsUs: 'Targeting senior PM track.',
        crmDataToSave: 'target_role = "AI Project Manager"',
        recommendedResponse: 'That role sits right at the intersection of team execution and AI agent orchestration.',
        discussionTopics: ['Director of PMO Track', 'AI Execution Architecture'],
        whatNotToSay: 'Do not suggest entry-level roles.',
        nextNodeId: 'stage-9',
        buyingSignal: 'High',
        urgencyImpact: 'Neutral',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-9',
    stageNumber: 9,
    stageName: 'STAGE 9 — DOMINANT GAP ISOLATION',
    objective: 'Identify primary capability gap to customize value stack.',
    whatWeKnow: 'Target role established.',
    spokenScript: 'What do you feel is currently stopping you from reaching that role today?',
    questionToAsk: 'Which single barrier is stopping you from reaching that outcome?',
    whyAsk: 'Controls the contextual value stack presentation in Stage 13.',
    possibleAnswers: [
      {
        label: 'Lack of practical AI agent projects',
        whatItTellsUs: 'Wants hands-on capstone portfolio building.',
        crmDataToSave: 'primary_gap = "Practical Portfolio"',
        recommendedResponse: 'Then the 7 live capstone projects and personal AI agent will be the most valuable part of the program for you.',
        discussionTopics: ['7 Capstones', 'Custom AI Agent'],
        whatNotToSay: 'Do not pitch purely theoretical lectures.',
        nextNodeId: 'stage-10',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-10',
    stageNumber: 10,
    stageName: 'STAGE 10 — WHY NOW & URGENCY',
    objective: 'Evaluate timeline pressure and urgency drivers.',
    whatWeKnow: 'Primary gap isolated.',
    spokenScript: 'Why are you looking at making this change right now?',
    questionToAsk: 'When do you want to see this transition happen?',
    whyAsk: 'Determines urgency score and immediate close feasibility.',
    possibleAnswers: [
      {
        label: 'Immediately (Next 30 days)',
        whatItTellsUs: 'High urgency; appraisal or active job hunting right now.',
        crmDataToSave: 'urgency_timeline = "Immediate 30d"',
        recommendedResponse: 'Then locking in your seat in this upcoming cohort ensures you start building your portfolio this week.',
        discussionTopics: ['Upcoming Cohort', 'Immediate Start'],
        whatNotToSay: 'Do not suggest waiting for next month\'s batch.',
        nextNodeId: 'stage-11',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-11',
    stageNumber: 11,
    stageName: 'STAGE 11 — PERSONALIZED CONSULTATION SUMMARY',
    objective: 'Deliver customized 2-3 sentence consultation mapping candidate parameters.',
    whatWeKnow: 'Role, experience, pain, outcome, and primary gap.',
    spokenScript: 'You\'ve told me that as a [Role] with [Yrs] years of experience, your primary goal is [Outcome], and your main barrier is [Gap]. So for you, I wouldn\'t position this as a generic course—the value is adding an AI Agent Execution layer on top of what you already know.',
    questionToAsk: 'Does that summary accurately reflect your current situation?',
    whyAsk: 'Secures candidate validation before introducing curriculum.',
    possibleAnswers: [
      {
        label: 'Yes - Completely Accurate',
        whatItTellsUs: 'Candidate feels deeply understood; high trust established.',
        crmDataToSave: 'consultation_summary = "Validated"',
        recommendedResponse: 'That\'s exactly why the program is structured in three focused steps.',
        discussionTopics: ['Customized Value', '3-Month Roadmap'],
        whatNotToSay: 'Do not revert to generic pitch speeches.',
        nextNodeId: 'stage-12',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-12',
    stageNumber: 12,
    stageName: 'STAGE 12 — PROGRAM EXPLANATION',
    objective: 'Explain core 3-month transformation framework concisely.',
    whatWeKnow: 'Consultation summary validated.',
    spokenScript: 'The program is structured in 3 months: Month 1 Learn AI → Month 2 Build AI Agents & Workflows → Month 3 Manage AI-Powered Execution.',
    questionToAsk: 'Does this 3-step practical progression make sense for you?',
    whyAsk: 'Keeps explanation under 40 words.',
    possibleAnswers: [
      {
        label: 'Makes Complete Sense',
        whatItTellsUs: 'Program structure understood and approved.',
        crmDataToSave: 'curriculum_understanding = "High"',
        recommendedResponse: 'Now let me highlight the specific career support deliverables tailored for you.',
        discussionTopics: ['Learn-Build-Manage', '3-Step Roadmap'],
        whatNotToSay: 'Do NOT dump the entire syllabus or topic list.',
        nextNodeId: 'stage-13',
        buyingSignal: 'High',
        urgencyImpact: 'Neutral',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-13',
    stageNumber: 13,
    stageName: 'STAGE 13 — VALUE MATCHING & JOB SUPPORT EXPLANATION',
    objective: 'Present targeted benefits and explain 6 months placement support (if career transition selected).',
    whatWeKnow: 'Candidate priorities and primary barrier.',
    spokenScript: 'Since career transition is important for you, after completing the program we provide 6 months of 100% placement support. Our AI agents track relevant openings, and you receive approximately 3–4 job profiles weekly on WhatsApp.',
    questionToAsk: 'Would receiving weekly AI-curated job opportunities help your career search?',
    whyAsk: 'Explains Placement Support while maintaining strict ethical distinction from false job guarantees.',
    possibleAnswers: [
      {
        label: 'Placement Support (3-4 WhatsApp profiles/wk)',
        whatItTellsUs: 'Understands placement support mechanism.',
        crmDataToSave: 'job_support_discussed = true',
        recommendedResponse: 'This is 100% placement support rather than a fake job guarantee—it ensures you have consistent opportunity visibility on WhatsApp while building your portfolio.',
        discussionTopics: ['6 Months Placement Support', 'WhatsApp Job Agents', 'Portfolio Positioning'],
        whatNotToSay: 'NEVER use the phrase "100% Job Guarantee".',
        nextNodeId: 'stage-14',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-14',
    stageNumber: 14,
    stageName: 'STAGE 14 — FIT CONFIRMATION ALIGNMENT',
    objective: 'Confirm solution alignment before initiating closing protocol.',
    whatWeKnow: 'Program structure & job support explained.',
    spokenScript: 'Based on everything we\'ve discussed, do you feel this 3-month program is directly aligned with what you\'re trying to achieve?',
    questionToAsk: 'Do you feel this program solves what you came for?',
    whyAsk: 'Transitions from consultation to closing.',
    possibleAnswers: [
      {
        label: 'Yes, Definitely',
        whatItTellsUs: 'Complete alignment confirmed.',
        crmDataToSave: 'fit_confirmation = "Confirmed"',
        recommendedResponse: 'Awesome. Then let\'s check batch timing and confirm your seat reservation.',
        discussionTopics: ['Closing Readiness', 'Cohort Confirmation'],
        whatNotToSay: 'Do not reopen old objections if they say yes.',
        nextNodeId: 'stage-15',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-15',
    stageNumber: 15,
    stageName: 'STAGE 15 — BUYING BARRIERS & OBJECTION ENGINE',
    objective: 'Uncover and resolve any remaining financial, time, or decision authority barriers.',
    whatWeKnow: 'Fit confirmed.',
    spokenScript: 'If you feel the program can help you achieve your goal, is there anything else that would stop you from joining this batch?',
    questionToAsk: 'Is there anything else that could stop you from joining?',
    whyAsk: 'Isolates price, time, or decision authority friction.',
    possibleAnswers: [
      {
        label: 'Price Concern (₹39,499)',
        whatItTellsUs: 'Needs value framing or seat deposit option.',
        crmDataToSave: 'main_objection = "Price"',
        recommendedResponse: 'When you say price, is the concern affordability right now, or whether the program is worth ₹39,499?',
        discussionTopics: ['₹5,000 Seat Deposit', '₹438/day Breakdown', 'No-Cost EMI'],
        whatNotToSay: 'Do not discount immediately.',
        nextNodeId: 'stage-16',
        buyingSignal: 'Medium',
        urgencyImpact: 'Neutral',
        fitImpact: 'Neutral'
      },
      {
        label: 'Nothing - Ready to join',
        whatItTellsUs: 'Ready for transactional close.',
        crmDataToSave: 'main_objection = "None"',
        recommendedResponse: 'Perfect. Let\'s confirm your batch schedule and reserve your seat.',
        discussionTopics: ['Batch Selection', 'Seat Reservation'],
        whatNotToSay: 'Do not stall or hesitate.',
        nextNodeId: 'stage-16',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-16',
    stageNumber: 16,
    stageName: 'STAGE 16 — COHORT BATCH SELECTION',
    objective: 'Lock in cohort schedule preference.',
    whatWeKnow: 'Candidate ready to proceed.',
    spokenScript: 'Which format works better for your weekly routine—the Weekend 3-hour sessions or Weekday 1-hour sessions?',
    questionToAsk: 'Which format suits your schedule better?',
    whyAsk: 'Weekend batch has ~90% working professionals proof point.',
    possibleAnswers: [
      {
        label: 'Weekend Batch (Sat & Sun 10 AM - 1 PM)',
        whatItTellsUs: 'Prefers focused weekend learning.',
        crmDataToSave: 'preferred_batch = "Weekend"',
        recommendedResponse: 'Around 90% of our weekend attendees are working professionals, which is why those cohort seats move fastest.',
        discussionTopics: ['Weekend Working Pro Community', 'Recorded Access'],
        whatNotToSay: 'Do not push weekday if weekend fits better.',
        nextNodeId: 'stage-17',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-17',
    stageNumber: 17,
    stageName: 'STAGE 17 — PRICE PRESENTATION & VALUE PAUSE',
    objective: 'State total investment and pause for reaction.',
    whatWeKnow: 'Batch selected.',
    spokenScript: 'The investment for the complete 3-month program, including all 3 certs and 7 projects, is ₹39,499.',
    questionToAsk: 'How does that investment structure sound to you?',
    whyAsk: 'Tests buying readiness without defensive pitching.',
    possibleAnswers: [
      {
        label: 'Sounds Fine / Ready',
        whatItTellsUs: 'High budget readiness.',
        crmDataToSave: 'price_reaction = "Accepted"',
        recommendedResponse: 'Great. You don\'t have to pay the full amount today—you can reserve your seat with ₹5,000.',
        discussionTopics: ['₹5,000 Reservation', 'Razorpay Link'],
        whatNotToSay: 'Do not offer discounts if they already accept price.',
        nextNodeId: 'stage-18',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-18',
    stageNumber: 18,
    stageName: 'STAGE 18 — TRANSACTIONAL CLOSE & ₹5,000 SEAT RESERVATION',
    objective: 'Dispatch Razorpay link and secure ₹5,000 seat deposit.',
    whatWeKnow: 'Candidate ready to reserve seat.',
    spokenScript: 'I\'ll send you the official ₹5,000 seat reservation link on WhatsApp right now. Shall I stay on the line while you complete it?',
    questionToAsk: 'Shall I stay on the line while you complete the reservation?',
    whyAsk: 'Secures live transactional close on call.',
    possibleAnswers: [
      {
        label: 'Send Payment Link Now',
        whatItTellsUs: 'Closing transaction active.',
        crmDataToSave: 'crm_stage = "Payment Link Sent"',
        recommendedResponse: 'I\'ve sent the Razorpay link (https://rzp.io/rzp/dXXePYb) to your WhatsApp. Once complete, send me the receipt to lock in your cohort spot.',
        discussionTopics: ['Razorpay Link Sent', 'Receipt Confirmation'],
        whatNotToSay: 'Do not end call without confirming link receipt.',
        nextNodeId: 'stage-19',
        buyingSignal: 'High',
        urgencyImpact: 'Increase',
        fitImpact: 'Increase'
      }
    ]
  },
  {
    id: 'stage-19',
    stageNumber: 19,
    stageName: 'STAGE 19 — CRM TELEMETRY & POST-CALL LOGGING',
    objective: 'Save structured JSON call telemetry and update CRM stage.',
    whatWeKnow: 'Call outcome and next steps.',
    spokenScript: 'Summarizing call outcomes, setting follow-up tasks, and updating lead profile telemetry.',
    questionToAsk: 'Call completion telemetry logging',
    whyAsk: 'Ensures 100% CRM data accuracy.',
    possibleAnswers: [
      {
        label: 'Complete Post-Call Logging',
        whatItTellsUs: 'Call logged successfully.',
        crmDataToSave: 'call_logged = true',
        recommendedResponse: 'Call summary logged. Follow-up task set.',
        discussionTopics: ['CRM Telemetry Saved'],
        whatNotToSay: 'Do not skip logging notes.',
        nextNodeId: 'stage-20',
        buyingSignal: 'High',
        urgencyImpact: 'Neutral',
        fitImpact: 'Neutral'
      }
    ]
  },
  {
    id: 'stage-20',
    stageNumber: 20,
    stageName: 'STAGE 20 — ALGORITHMIC LEAD SCORE & NEXT BEST ACTION',
    objective: 'Calculate final 0–100 score and assign priority follow-up status.',
    whatWeKnow: 'All candidate parameters accumulated.',
    spokenScript: 'Final Lead Score calculated based on 9 weighted behavioral metrics.',
    questionToAsk: 'Lead score classification',
    whyAsk: 'Prioritizes sales rep follow-up queue.',
    possibleAnswers: [
      {
        label: 'Score Calculated (80-100 Hot)',
        whatItTellsUs: 'Hot Lead priority confirmed.',
        crmDataToSave: 'fit_score = 92',
        recommendedResponse: 'Lead categorized as Hot Lead (Priority 1).',
        discussionTopics: ['Hot Lead Priority'],
        whatNotToSay: 'N/A',
        nextNodeId: 'stage-20',
        buyingSignal: 'High',
        urgencyImpact: 'Neutral',
        fitImpact: 'Neutral'
      }
    ]
  }
];

export default function InteractiveDecisionTree() {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [activeStageId, setActiveStageId] = useState<string>('stage-1');
  const [activeAnswerIdx, setActiveAnswerIdx] = useState<number>(0);

  const activeNode = TWENTY_STAGE_DECISION_NODES.find((n) => n.id === activeStageId) || TWENTY_STAGE_DECISION_NODES[0];
  const activeAnswer = activeNode.possibleAnswers[activeAnswerIdx] || activeNode.possibleAnswers[0];

  return (
    <div className="space-y-6">
      {/* Interactive Header Bar */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
              Aivalytics 20-Stage Live Guided Sales Decision Tree Map
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Interactive flowchart for the AI-Native Project Management program.
            Inspect node objectives, spoken scripts (1–3 sentences max), response branches, CRM updates, and placement support rules.
          </p>
        </div>

        {/* Persona Path Simulator */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Role Path Filter:</span>
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
        </div>
      </div>

      {/* Grid Layout: Visual Stage Map (Left 60%) & Detailed Node Inspector (Right 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Nodes Flowchart Map (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              20-Stage Flowchart Nodes Map
            </span>
            <span className="text-xs text-gray-400 font-bold">
              Active: Stage {activeNode.stageNumber} of 20
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[750px] overflow-y-auto pr-1">
            {TWENTY_STAGE_DECISION_NODES.map((node) => {
              const isActive = node.id === activeStageId;

              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setActiveStageId(node.id);
                    setActiveAnswerIdx(0);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg ring-2 ring-purple-400'
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
                      Stage {node.stageNumber}
                    </span>
                    <span className={`text-[10px] font-bold ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>
                      {node.possibleAnswers.length} Branches
                    </span>
                  </div>

                  <div>
                    <h5 className="font-extrabold text-xs line-clamp-1">{node.stageName}</h5>
                    <p className={`text-[11px] mt-0.5 line-clamp-2 ${isActive ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {node.objective}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold pt-1 border-t border-gray-100 dark:border-gray-700/50">
                    <span className={isActive ? 'text-purple-200' : 'text-purple-600 dark:text-purple-400'}>
                      Inspect Node Details ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Node Inspector HUD (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 sticky top-6">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Node Inspector & Teleprompter HUD
                </span>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5">
                  {activeNode.stageName}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs rounded-lg">
                Stage {activeNode.stageNumber}
              </span>
            </div>

            {/* Objective & Knowledge */}
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1 text-xs">
              <span className="font-extrabold text-purple-800 dark:text-purple-300 block uppercase">🎯 Objective:</span>
              <p className="text-gray-800 dark:text-gray-200">{activeNode.objective}</p>
              <span className="font-bold text-gray-500 block uppercase text-[10px] pt-1">Known Data:</span>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">{activeNode.whatWeKnow}</p>
            </div>

            {/* Spoken Script Teleprompter Card */}
            <div className="p-4 bg-gray-900 text-white rounded-xl space-y-2 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider">
                  🗣️ Salesperson Script (1–3 Sentences Max):
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(activeNode.spokenScript)}
                  className="text-[10px] text-purple-300 hover:text-white font-bold underline cursor-pointer"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs font-medium italic text-gray-100 leading-relaxed">
                "{activeNode.spokenScript}"
              </p>
            </div>

            {/* Response Branch Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block uppercase">
                Possible Prospect Answer Buttons:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeNode.possibleAnswers.map((ans, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => setActiveAnswerIdx(aIdx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeAnswerIdx === aIdx
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    🔹 {ans.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Answer Detail Inspector */}
            {activeAnswer && (
              <div className="p-4 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl space-y-2.5 text-xs">
                <div>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 block text-[10px] uppercase">
                    What This Answer Tells Us:
                  </span>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">{activeAnswer.whatItTellsUs}</p>
                </div>

                <div>
                  <span className="font-bold text-gray-500 block text-[10px] uppercase">CRM Field Updated:</span>
                  <code className="text-[11px] font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-purple-600 dark:text-purple-300 block">
                    {activeAnswer.crmDataToSave}
                  </code>
                </div>

                <div>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300 block text-[10px] uppercase">
                    Recommended Follow-up Script:
                  </span>
                  <p className="text-gray-800 dark:text-gray-200 italic font-medium">"{activeAnswer.recommendedResponse}"</p>
                </div>

                {activeAnswer.discussionTopics.length > 0 && (
                  <div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[10px] uppercase">
                      Surface Discussion Topic Cards:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeAnswer.discussionTopics.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-[10px] rounded-md">
                          💬 {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg text-[11px]">
                  <strong>⚠️ What NOT to Say: </strong> {activeAnswer.whatNotToSay}
                </div>

                {/* Behavioral Impact Flags */}
                <div className="flex justify-between items-center text-[10px] font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-emerald-600">Signal: {activeAnswer.buyingSignal}</span>
                  <span className="text-amber-600">Urgency: {activeAnswer.urgencyImpact}</span>
                  <span className="text-purple-600">Fit: {activeAnswer.fitImpact}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
