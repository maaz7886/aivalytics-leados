// @ts-nocheck
// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lead, Task, Program, IntegrationItem, Stage, CallActivity } from '../types';
import {
  supabase,
  fetchLeadsFromSupabase,
  insertBulkLeadsToSupabase,
  insertLeadToSupabase,
  updateLeadStageInSupabase,
  deleteLeadFromSupabase,
  deleteBulkLeadsFromSupabase,
  fetchProgramsFromSupabase,
  upsertProgramInSupabase
} from '../lib/supabase';

// Pre-populated realistic demo lead: Rahul Sharma & others
const initialLeads: Lead[] = [
  {
    id: 'lead-rahul-001',
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@techcorp.io',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    source: 'Meta Ads',
    metaCampaign: 'IN_PM_AI_Upskill_Q3',
    metaAdSet: 'Exp_7-12_Tech_PMs',
    metaAd: 'Ad_04_PM_Agentic_Workflows',
    campaignId: 'cmp_882391029',
    dateCaptured: '2026-09-12 14:32',
    programId: 'ai-pm',
    programName: 'AI-Native Project Management',
    professionalStatus: 'Working Professional',
    currentRole: 'Project Manager',
    currentCompany: 'TechCorp Solutions',
    industry: 'Technology / SaaS',
    yearsOfExperience: 10,
    currentResponsibilities: 'Managing enterprise software delivery teams, sprint planning, client communications, risk management.',
    currentSkillSet: ['Project Planning', 'Stakeholder Coordination', 'Agile / Scrum', 'Team Management', 'Risk Management'],
    currentAiUsageLevel: 'Intermediate',
    primaryGoal: 'Upskill + Switch Company',
    desiredRole: 'Senior AI Project Manager / Director of AI Operations',
    expectedTimeline: '3–6 months',
    mainChallenge: 'Traditional PM workflows are becoming obsolete. Needs practical AI agent orchestration experience to stay competitive for high-paying roles.',
    whyNow: 'Noticeably slower project cycles compared to AI-first teams in current industry.',
    expectedOutcome: 'Ability to orchestrate multi-agent PM workflows, automate reporting, and lead AI transformation initiatives.',
    comments: 'Super responsive on Meta ad lead form. Submitted full details.',
    investment: '',
        education: '',
        priority: 'P2',
        qualificationStatus: '',
        objection: '',
        preferredBatch: '',
        preferredContactTime: '',
        paymentLink: '',
        aiRecommendation: '',
    assignedSalesperson: 'Alex Rivera',
    crmStage: 'Qualified',
    leadTemperature: 'Hot',
    lastContacted: '2026-09-13 10:15',
    nextFollowUp: '2026-09-14 11:00',
    numberOfCalls: 2,
    numberOfFollowUps: 3,
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    enrollmentStatus: 'Not Enrolled',
    fitScore: 92,
    intentScore: 68,
    fitScoreBreakdown: [
      { factor: 'Career Relevance', score: 95, reason: '10 years PM experience directly maps to advanced AI-PM orchestration.' },
      { factor: 'Professional Background', score: 90, reason: 'SaaS tech background ensures quick grasp of prompt and SOP engineering.' },
      { factor: 'Goal Alignment', score: 92, reason: 'Looking to switch roles with AI positioning.' },
      { factor: 'AI Skill Gap', score: 90, reason: 'High gap between basic ChatGPT usage and agent workflow automation.' }
    ],
    intentScoreBreakdown: [
      { factor: 'Urgency & Timeline', score: 75, reason: '3-6 month window indicates active job search intent.' },
      { factor: 'Engagement Level', score: 85, reason: 'Filled detailed lead form and attended first discovery call.' },
      { factor: 'Objection Severity', score: 55, reason: 'Concerns about program depth vs YouTube self-learning.' },
      { factor: 'Buying Signals', score: 65, reason: 'Asked detailed questions about curriculum modules and practical projects.' }
    ],
    likelyDesiredOutcome: 'Rahul appears to be looking for a way to add AI execution capabilities to his existing project management experience so that he can either progress within his current organization or become more competitive for stronger external opportunities.',
    evidenceLeadProvided: [
      '10 years project management experience',
      'Wants to upskill and switch company',
      'Timeline set for 3-6 months'
    ],
    evidenceAiInterpretation: [
      'Career progression & competitive advantage are primary drivers over foundational PM education.',
      'AI capability will be positioned as an additional execution layer on top of 10 yrs domain experience.'
    ],
    recommendedPositioning: 'Do NOT position this as teaching Rahul project management from scratch. Position the program as adding an AI-native execution layer to the experience he already has.',
    recommendedOpening: 'Rahul, looking at your experience, I don\'t think your biggest requirement is learning project management again. The more interesting question is how you add AI, automation and AI-agent management to the project management experience you already have.',
    discoveryQuestions: [
      'How is AI currently affecting project delivery inside your organization?',
      'What would need to change professionally over the next 12 months for you to consider this year successful?',
      'Are you primarily looking for growth inside your current organization, or are you actively considering a switch?',
      'How frequently are you currently using AI in real project execution?',
      'What would prevent you from making that transition today?'
    ],
    existingSkills: [
      'Project Planning',
      'Stakeholder Coordination',
      'Team Management',
      'Delivery Execution',
      'Risk & Budget Management'
    ],
    aiSkillsToDevelop: [
      'AI-Assisted Project Planning',
      'Multi-Agent Workflow Design',
      'Agent Orchestration',
      'Workflow Automation',
      'SOP Engineering',
      'Automation Opportunity Identification',
      'Human + AI Delegation Models',
      'AI Guardrails & Compliance',
      'AI-Assisted Automated Reporting',
      'AI Transformation Management'
    ],
    whyProgramFits: 'This program is highly relevant because it is specifically designed to build AI execution, automation, and agent-management capabilities on top of existing professional experience rather than replacing previous career knowledge.',
    objections: [
      {
        objection: 'I already have significant PM experience.',
        whyExists: 'Prospect fears the course will waste time teaching basic Agile, Scrum, or PM 101 concepts.',
        recommendedResponse: 'Highlight that 80% of the program focuses on AI agent orchestration, automation tools, and Python/n8n workflow logic specifically designed for experienced managers.',
        questionToAsk: 'When you manage your projects right now, how much time is spent manually chasing status updates vs automated agent flows?'
      },
      {
        objection: 'Can I learn this from YouTube or free courses?',
        whyExists: 'Abundance of generic AI tips on social media creates an illusion of accessibility.',
        recommendedResponse: 'Emphasize production-grade, multi-agent frameworks, hands-on capstone projects, live feedback from AI architects, and cohort network.',
        questionToAsk: 'Have you built a working multi-agent system that autonomously audits a sprint board yet?'
      },
      {
        objection: 'Will this actually help me change jobs?',
        whyExists: 'Prospect needs assurance of market demand for AI-PM capability.',
        recommendedResponse: 'Explain positioning support: portfolio creation, resume optimization for AI-lead roles, and career placement guidance.',
        questionToAsk: 'If you were interviewing tomorrow, how would you demonstrate your AI project management framework?'
      }
    ],
    recommendedNextAction: 'Call within 30 minutes. Focus primarily on career transition and AI relevance. Do not spend excessive time explaining basic PM concepts. Verify whether Rahul is actively searching for another role.',
    callNotesHistory: [
      {
        id: 'note-01',
        date: '2026-09-13 10:15',
        salesperson: 'Alex Rivera',
        rawNotes: 'Interested in switching within six months. Currently earning well. Main concern is whether the program will be advanced enough. Needs to discuss with spouse. Follow-up Saturday.',
        aiAnalysis: {
          trueDesiredOutcome: 'External career transition + AI upskilling',
          primaryMotivation: 'Remain relevant as project management becomes AI-enabled',
          primaryObjection: 'Program depth & technical rigor',
          secondaryObjection: 'Program investment & family alignment',
          decisionFactors: ['Advanced curriculum', 'Job transition support', 'Practical capstone implementation'],
          decisionMaker: 'Lead + spouse',
          purchaseIntent: 78,
          recommendedFollowUp: 'Saturday 11:00 AM',
          recommendedStrategy: 'Share advanced curriculum roadmap and practical project case studies rather than sending generic marketing brochures.'
        }
      }
    ]
  },
  {
    id: 'lead-priya-002',
    fullName: 'Priya Sundaram',
    phone: '+91 91234 56789',
    email: 'priya.s@gtmscale.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    source: 'Meta Ads',
    metaCampaign: 'IN_GTM_AI_Campaign_Q3',
    metaAdSet: 'Marketing_Heads_SaaS',
    metaAd: 'Ad_02_AI_Outbound_Agents',
    campaignId: 'cmp_992102199',
    dateCaptured: '2026-09-12 18:10',
    programId: 'ai-gtm',
    programName: 'AI-Native GTM',
    professionalStatus: 'Working Professional',
    currentRole: 'Growth Marketing Lead',
    currentCompany: 'GTM Scale Studio',
    industry: 'Marketing / Growth',
    yearsOfExperience: 7,
    currentResponsibilities: 'User acquisition, paid campaigns, inbound funnel conversion, marketing team leadership.',
    currentSkillSet: ['Performance Marketing', 'Copywriting', 'Analytics', 'Funnel Optimization'],
    currentAiUsageLevel: 'Intermediate',
    primaryGoal: 'Learn Automation',
    desiredRole: 'Head of AI Growth & GTM',
    expectedTimeline: '1–3 months',
    mainChallenge: 'CAC is skyrocketing. Traditional outbound and content strategies are yielding diminishing returns.',
    whyNow: 'Wants to deploy autonomous AI agents for research, copywriting, and outbound lead enrichment.',
    expectedOutcome: 'Build an end-to-end automated GTM engine using AI agents and n8n workflows.',
    comments: 'Very enthusiastic during initial ad inquiry.',
    investment: '',
        education: '',
        priority: 'P2',
        qualificationStatus: '',
        objection: '',
        preferredBatch: '',
        preferredContactTime: '',
        paymentLink: '',
        aiRecommendation: '',
    assignedSalesperson: 'Sam Miller',
    crmStage: 'Did Not Receive Call',
    leadTemperature: 'Warm',
    lastContacted: '2026-09-12 18:30',
    nextFollowUp: '2026-09-13 15:00',
    numberOfCalls: 1,
    numberOfFollowUps: 1,
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    enrollmentStatus: 'Not Enrolled',
    fitScore: 88,
    intentScore: 74,
    fitScoreBreakdown: [
      { factor: 'Domain Alignment', score: 92, reason: 'GTM & Growth background directly matches AI-GTM tools.' },
      { factor: 'Immediate Applicability', score: 95, reason: 'Has live campaigns to apply AI agents immediately.' }
    ],
    intentScoreBreakdown: [
      { factor: 'Urgency', score: 85, reason: '1-3 month timeline for immediate deployment.' },
      { factor: 'Buying Signals', score: 70, reason: 'Requested program pricing brochure.' }
    ],
    likelyDesiredOutcome: 'Priya wants to automate high-volume outreach, content variation, and lead scoring using AI agents to lower acquisition costs and scale growth output.',
    evidenceLeadProvided: ['7 years growth experience', 'Wants fast 1-3 month automation timeline'],
    evidenceAiInterpretation: ['Needs fast proof-of-concept AI GTM workflows to demonstrate immediate ROI.'],
    recommendedPositioning: 'Position as a tactical unfair advantage for growth leaders to build high-scale AI outbound systems without hiring extra headcount.',
    recommendedOpening: 'Priya, instead of running traditional campaigns, let\'s discuss how top GTM leads build autonomous enrichment and outreach agent pipelines.',
    discoveryQuestions: [
      'What is your current cost per acquired pipeline SQL?',
      'How much time does your team spend manually researching leads before outreach?'
    ],
    existingSkills: ['Performance Marketing', 'Campaign Analytics', 'Funnel Optimization'],
    aiSkillsToDevelop: ['AI Outbound Agent Pipelines', 'n8n & Clay Lead Enrichment', 'AI Persona Generation'],
    whyProgramFits: 'Ideal fit for automating GTM workflows and scaling pipeline generation using cutting-edge AI stack.',
    objections: [
      {
        objection: 'Will these AI agents look spammy to target leads?',
        whyExists: 'Fear of brand reputation damage.',
        recommendedResponse: 'Demonstrate deep context-aware personalization agents that research lead LinkedIn activity before drafting emails.',
        questionToAsk: 'Have you seen how multi-turn agent verification prevents generic outbound messages?'
      }
    ],
    recommendedNextAction: 'Send GTM Agent Workflow demo video over WhatsApp then follow up with a quick call.',
    callNotesHistory: [],
    investment: '',
    education: '',
    priority: 'P2',
    qualificationStatus: '',
    objection: '',
    preferredBatch: '',
    preferredContactTime: '',
    paymentLink: '',
    aiRecommendation: '',
    leadScore: 50,
    leadHealthScore: 50,
    aiSummary: '',
    nextBestAction: '',
    conversionProbability: 0,
    temperature: 'Cold',
    fitScoreBreakdown: [],
    intentScoreBreakdown: [],
    likelyDesiredOutcome: '',
    recommendedPositioning: '',
    recommendedOpening: '',
    discoveryQuestions: [],

  },
  {
    id: 'lead-vikram-003',
    fullName: 'Vikram Mehta',
    phone: '+91 99887 76655',
    email: 'vikram@mehtaconsulting.com',
    city: 'Delhi NCR',
    state: 'Delhi',
    country: 'India',
    source: 'Meta Ads',
    metaCampaign: 'IN_Fellowship_Q3',
    metaAdSet: 'Founders_Execs',
    metaAd: 'Ad_01_AI_Transformation_Leader',
    campaignId: 'cmp_771239102',
    dateCaptured: '2026-09-11 09:15',
    programId: 'ai-fellowship',
    programName: 'AI Fellowship',
    professionalStatus: 'Founder',
    currentRole: 'Managing Director',
    currentCompany: 'Mehta Consulting Group',
    industry: 'Management Consulting',
    yearsOfExperience: 14,
    currentResponsibilities: 'Executive advisory, operations, strategic client consulting.',
    currentSkillSet: ['Business Strategy', 'Executive Management', 'Client Advisory'],
    currentAiUsageLevel: 'Beginner',
    primaryGoal: 'Start a Business',
    desiredRole: 'AI Transformation Advisory Founder',
    expectedTimeline: 'Immediately',
    mainChallenge: 'Consulting clients are asking for AI transformation roadmap, but firm lacks internal technical AI agent expertise.',
    whyNow: 'Wants to launch an AI advisory arm for existing enterprise client base.',
    expectedOutcome: 'Master enterprise AI architecture, governance, and custom agent deployment.',
    comments: 'High net worth lead. Extremely interested in peer executive network.',
    investment: '',
        education: '',
        priority: 'P2',
        qualificationStatus: '',
        objection: '',
        preferredBatch: '',
        preferredContactTime: '',
        paymentLink: '',
        aiRecommendation: '',
    assignedSalesperson: 'Alex Rivera',
    crmStage: 'Payment Pending',
    leadTemperature: 'Hot',
    lastContacted: '2026-09-13 09:30',
    nextFollowUp: '2026-09-13 17:00',
    numberOfCalls: 3,
    numberOfFollowUps: 4,
    paymentStatus: 'Unpaid',
    amountPaid: 0,
    enrollmentStatus: 'Reserved',
    fitScore: 96,
    intentScore: 91,
    fitScoreBreakdown: [
      { factor: 'Executive Status', score: 98, reason: 'Perfect profile for elite AI Fellowship executive network.' },
      { factor: 'Client Access', score: 95, reason: 'Can immediately deploy fellowship projects with paying consulting clients.' }
    ],
    intentScoreBreakdown: [
      { factor: 'Immediate Timeline', score: 95, reason: 'Ready to enroll in upcoming cohort starting this month.' },
      { factor: 'Payment Link Issued', score: 90, reason: 'Payment link opened twice; pending final confirmation.' }
    ],
    likelyDesiredOutcome: 'Vikram wants high-level strategic mastery and working architecture templates to offer $50k+ AI Transformation packages to his consulting clients.',
    evidenceLeadProvided: ['14 years executive experience', 'Founder of consulting firm'],
    evidenceAiInterpretation: ['Focus should be on executive credibility, peer network quality, and strategic consulting deliverables.'],
    recommendedPositioning: 'Position the Fellowship as an executive peer-group & venture lab for transformation leaders.',
    recommendedOpening: 'Vikram, the key differentiator for your firm will be delivering validated AI architecture frameworks rather than standard PowerPoint recommendations.',
    discoveryQuestions: [
      'What percentage of your enterprise clients are actively requesting AI transformation audits?'
    ],
    existingSkills: ['Executive Management', 'Strategic Advisory', 'Client Development'],
    aiSkillsToDevelop: ['Enterprise AI Governance', 'Custom LLM Orchestration', 'AI Audit Frameworks'],
    whyProgramFits: 'Designed for senior leaders and founders building AI advisory practices or enterprise transformation units.',
    objections: [
      {
        objection: 'What is the weekly time commitment required?',
        whyExists: 'Busy founder schedule.',
        recommendedResponse: 'Flexible weekend workshops and asynchronous project reviews designed for active executives.',
        questionToAsk: 'How many hours per week do you currently invest in R&D for your firm?'
      }
    ],
    recommendedNextAction: 'Send final fee payment link reminder and confirm seat reservation for upcoming batch.',
    callNotesHistory: [
      {
        id: 'note-vikram-01',
        date: '2026-09-13 09:30',
        salesperson: 'Alex Rivera',
        rawNotes: 'Confirmed budget approval. Requested company GST invoice format. Sent payment link.',
        aiAnalysis: {
          trueDesiredOutcome: 'New AI revenue stream for consulting practice',
          primaryMotivation: 'Market expansion and client retention',
          primaryObjection: 'Time commitment vs business management',
          secondaryObjection: 'Invoice tax compliance',
          decisionFactors: ['Curriculum depth', 'Executive cohort tier'],
          decisionMaker: 'Self (Founder)',
          purchaseIntent: 91,
          recommendedFollowUp: 'Today 5:00 PM',
          recommendedStrategy: 'Assist with GST invoice documentation to assist immediate payment closure.'
        }
      }
    ]
  }
];

const initialTasks: Task[] = [
  {
    id: 'task-101',
    leadId: 'lead-rahul-001',
    leadName: 'Rahul Sharma',
    type: 'Call',
    dueDate: 'Today 11:00 AM',
    priority: 'Critical',
    status: 'Pending',
    description: 'Discovery Call: Address PM experience vs AI agent execution layer positioning.',
    assignedTo: 'Alex Rivera'
  },
  {
    id: 'task-102',
    leadId: 'lead-priya-002',
    leadName: 'Priya Sundaram',
    type: 'WhatsApp',
    dueDate: 'Today 3:00 PM',
    priority: 'High',
    status: 'Pending',
    description: 'Send GTM AI Agent Outbound demo video over WhatsApp.',
    assignedTo: 'Sam Miller'
  },
  {
    id: 'task-103',
    leadId: 'lead-vikram-003',
    leadName: 'Vikram Mehta',
    type: 'Payment Follow-Up',
    dueDate: 'Today 5:00 PM',
    priority: 'Critical',
    status: 'Pending',
    description: 'Verify Razorpay seat reservation payment link status & share GST invoice.',
    assignedTo: 'Alex Rivera'
  }
];

const initialPrograms: Program[] = [
  {
    id: 'ai-pm',
    name: 'AI-Native Project Management',
    duration: '3 Months',
    price: 49999,
    structure: [
      { month: 'Month 1', title: 'AI Foundations & Tooling', topics: ['Prompt Engineering for PMs', 'ChatGPT Plus & Claude Pro Workflows', 'Custom GPT creation for PRDs'] },
      { month: 'Month 2', title: 'AI Agents & Workflow Orchestration', topics: ['Multi-Agent Orchestration', 'n8n & Zapier Central Workflows', 'Automated Sprint Audit Agents'] },
      { month: 'Month 3', title: 'AI-Native Project Execution & Capstone', topics: ['SOP Engineering', 'Human + AI Delegation Models', 'Production Capstone Project & Portfolio'] }
    ],
    eligibility: '3+ years experience in PM, Operations, Tech, or Business Delivery',
    placementSupport: 'Resume positioning for AI-PM roles, 1-on-1 career coaching, top company referrals',
    outcomes: [
      'Build multi-agent workflow systems that automate 50% of routine PM tasks',
      'Engineer custom AI SOPs for cross-functional engineering and design teams',
      'Position yourself for AI Project Manager & Operations Transformation roles'
    ],
    projects: [
      'Autonomous Sprint Status & Risk Auditor Agent',
      'AI-Powered PRD & User Story Generator Workflow',
      'Enterprise AI Transformation Readiness Roadmap'
    ],
    batchTiming: 'Saturdays & Sundays (10:00 AM - 1:00 PM IST)',
    faqs: [
      { question: 'Do I need coding knowledge?', answer: 'No prior coding experience required. We focus on no-code agent platforms (n8n, Flowise, Custom GPTs) and low-code Python scripts.' },
      { question: 'Is placement guaranteed?', answer: 'We offer dedicated career placement assistance, portfolio reviews, and interview prep. We do NOT guarantee employment outcomes.' }
    ]
  },
  {
    id: 'ai-gtm',
    name: 'AI-Native GTM & Growth',
    duration: '3 Months',
    price: 54999,
    structure: [
      { month: 'Month 1', title: 'AI Inbound & Content Engines', topics: ['SEO Automation', 'LLM Copywriting Systems', 'Multi-Platform Asset Generation'] },
      { month: 'Month 2', title: 'AI Outbound & Lead Enrichment Agents', topics: ['Clay & n8n Enrichment Pipelines', 'LinkedIn AI Research Agents', 'Hyper-Personalized Outreach'] },
      { month: 'Month 3', title: 'Full-Stack GTM Automation Capstone', topics: ['Autonomous Growth Loops', 'Customer Data AI Analysis', 'GTM Stack Deployment'] }
    ],
    eligibility: 'Marketing Leads, Growth Managers, Founders, Product Marketers',
    placementSupport: 'GTM Portfolio build, growth advisory network, career referral network',
    outcomes: ['Scale qualified lead volume 3x while cutting manual research time by 70%'],
    projects: ['Autonomous Outbound Lead Enrichment & Prospecting Agent'],
    batchTiming: 'Saturdays & Sundays (2:00 PM - 5:00 PM IST)',
    faqs: [{ question: 'Will this help with B2B SaaS growth?', answer: 'Yes, specifically designed for B2B pipeline acceleration.' }]
  },
  {
    id: 'ai-fellowship',
    name: 'AI Leadership Fellowship',
    duration: '4 Months',
    price: 99999,
    structure: [
      { month: 'Month 1-2', title: 'Enterprise AI Architecture & Strategy', topics: ['Custom LLMs vs RAG', 'AI Governance & Security', 'Venture Business Models'] },
      { month: 'Month 3-4', title: 'AI Venture & Transformation Capstone', topics: ['Deploying Enterprise Agents', 'Boardroom Positioning', 'Peer Masterminds'] }
    ],
    eligibility: 'Founders, Directors, VP/CXOs, Management Consultants (10+ yrs exp)',
    placementSupport: 'Executive network access, investor demo day, corporate transformation board referrals',
    outcomes: ['Launch AI business unit or consulting offering with validated architecture'],
    projects: ['Full Enterprise AI Audit & Agent Deployment Architecture'],
    batchTiming: 'Alternate Weekends & Mastermind Dinners',
    faqs: [{ question: 'Is this suitable for non-technical executives?', answer: 'Yes, focuses on architectural strategy, ROI evaluation, and governance.' }]
  }
];

const initialIntegrations: IntegrationItem[] = [
  { id: 'meta', name: 'Meta Lead Ads', category: 'Lead Generation', description: 'Automated instant lead ingestion from Facebook & Instagram ad forms.', connected: true, status: 'Active', icon: '⚡' },
  { id: 'openai', name: 'OpenAI API', category: 'AI Intelligence', description: 'Powers lead profiling, objection prediction, and call analysis models.', connected: true, status: 'Active', icon: '🧠' },
  { id: 'n8n', name: 'n8n Automation Engine', category: 'Workflows', description: 'Orchestrates lead routing, notification triggers, and multi-app webhooks.', connected: true, status: 'Active', icon: '🔄' },
  { id: 'whatsapp', name: 'WhatsApp Business API', category: 'Messaging', description: 'Automated immediate response and follow-up templates.', connected: false, status: 'Placeholder', icon: '💬' },
  { id: 'gmail', name: 'Gmail Integration', category: 'Email', description: 'Sync sales email threads directly to lead profile timelines.', connected: false, status: 'Placeholder', icon: '✉️' },
  { id: 'calendar', name: 'Google Calendar', category: 'Scheduling', description: 'Auto-schedule discovery calls and sync follow-up reminders.', connected: false, status: 'Placeholder', icon: '📅' },
  { id: 'razorpay', name: 'Razorpay Payment Gateway', category: 'Payments', description: 'Generate instant seat reservation payment links with webhooks.', connected: true, status: 'Active', icon: '💳' }
];

const generateInitialCallActivities = (): CallActivity[] => {
  const now = new Date();
  const makeTime = (hoursAgo: number, minutesAgo: number = 0) => {
    const d = new Date(now.getTime() - (hoursAgo * 60 + minutesAgo) * 60 * 1000);
    return d.toISOString();
  };

  return [
    {
      id: 'call-seed-1',
      leadId: 'lead-ashutosh-01',
      leadName: 'Ashutosh',
      leadPhone: '+91 98765 12340',
      programName: 'AI-Native Project Management',
      timestamp: makeTime(0, 35),
      outcome: 'Connected',
      notes: 'Spoke regarding Saturday cohort syllabus depth, fee structure, and AI-PM hands-on project deliverables. Very positive conversation.',
      durationSeconds: 240,
      salesperson: 'Alex Rivera'
    },
    {
      id: 'call-seed-2',
      leadId: 'lead-rahul-001',
      leadName: 'Rahul Sharma',
      leadPhone: '+91 98765 43210',
      programName: 'AI-Native Project Management',
      timestamp: makeTime(1, 15),
      outcome: 'Interested',
      notes: 'Reviewed current role as PM at TechCorp. Discussed transition timeline for next 3-6 months. Scheduled Follow-Up 1.',
      durationSeconds: 180,
      salesperson: 'Alex Rivera'
    },
    {
      id: 'call-seed-3',
      leadId: 'lead-priya-002',
      leadName: 'Priya Patel',
      leadPhone: '+91 98112 23344',
      programName: 'AI-Native Go-To-Market',
      timestamp: makeTime(2, 5),
      outcome: 'Did Not Pick The Call',
      notes: 'Rang 4 times with no answer. Sent cohort brochure and introductory video via WhatsApp.',
      durationSeconds: 45,
      salesperson: 'Alex Rivera'
    },
    {
      id: 'call-seed-4',
      leadId: 'lead-vikram-003',
      leadName: 'Vikram Mehta',
      leadPhone: '+91 99887 76655',
      programName: 'AI Leadership Fellowship',
      timestamp: makeTime(2, 45),
      outcome: 'Call Later',
      notes: 'In executive meeting. Requested callback around 4:30 PM. Marked as callback.',
      durationSeconds: 60,
      salesperson: 'Alex Rivera'
    },
    {
      id: 'call-seed-5',
      leadId: 'lead-satyam-04',
      leadName: 'Satyam',
      leadPhone: '+91 97711 55667',
      programName: 'AI-Native Project Management',
      timestamp: makeTime(3, 30),
      outcome: 'Connected',
      notes: 'Reviewed budget and sponsorship. Wants invoice sent to HR department for upskilling reimbursement.',
      durationSeconds: 310,
      salesperson: 'Alex Rivera'
    },
    {
      id: 'call-seed-6',
      leadId: 'lead-sneha-05',
      leadName: 'Sneha Verma',
      leadPhone: '+91 96655 44332',
      programName: 'AI-Native Project Management',
      timestamp: makeTime(4, 10),
      outcome: 'Qualified',
      notes: '11 years exp, lead PM in healthcare tech. Fits the criteria for AI transformation lead perfectly.',
      durationSeconds: 260,
      salesperson: 'Alex Rivera'
    },
    {
      id: 'call-seed-7',
      leadId: 'lead-rohit-06',
      leadName: 'Rohit Sharma',
      leadPhone: '+91 95544 33221',
      programName: 'AI-Native Go-To-Market',
      timestamp: makeTime(5, 0),
      outcome: 'Did Not Pick The Call',
      notes: 'Unanswered call. Follow-up 1 queued for tomorrow morning.',
      durationSeconds: 30,
      salesperson: 'Alex Rivera'
    }
  ];
};

interface AppContextType {
  leads: Lead[];
  selectedLeadId: string;
  setSelectedLeadId: (id: string) => void;
  tasks: Task[];
  programs: Program[];
  integrations: IntegrationItem[];
  callActivities: CallActivity[];
  todayCallsCount: number;
  todayCallActivities: CallActivity[];
  dailyCallGoal: number;
  setDailyCallGoal: (goal: number) => void;
  logCall: (leadId: string, outcome?: string, notes?: string) => void;
  addLead: (lead: Lead) => void;
  bulkAddLeads: (leads: Lead[]) => void;
  updateLeadStage: (id: string, stage: Stage) => void;
  deleteLead: (id: string) => void;
  deleteBulkLeads: (ids: string[]) => void;
  bulkUpdateStage: (ids: string[], stage: Stage) => void;
  addCallNote: (leadId: string, rawNotes: string) => void;
  updateLeadFollowUp: (leadId: string, stage: Stage, nextFollowUpDate: string, note?: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  addTask: (task: Task) => void;
  updateProgram: (program: Program) => void;
  addProgram: (program: Program) => void;
  toggleIntegration: (id: string) => void;
  simulateAiPrep: (leadId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or fall back to initial dataset
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('AIVALYTICS_LEADS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved leads:', e);
      }
    }
    return initialLeads;
  });

  const [selectedLeadId, setSelectedLeadId] = useState<string>('lead-rahul-001');

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('AIVALYTICS_TASKS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved tasks:', e);
      }
    }
    return initialTasks;
  });

  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem('AIVALYTICS_PROGRAMS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved programs:', e);
      }
    }
    return initialPrograms;
  });

  const [integrations, setIntegrations] = useState<IntegrationItem[]>(initialIntegrations);

  const [callActivities, setCallActivities] = useState<CallActivity[]>(() => {
    const saved = localStorage.getItem('AIVALYTICS_CALL_ACTIVITIES');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved call activities:', e);
      }
    }
    return generateInitialCallActivities();
  });

  const [dailyCallGoal, setDailyCallGoal] = useState<number>(() => {
    const saved = localStorage.getItem('AIVALYTICS_DAILY_CALL_GOAL');
    return saved ? Number(saved) : 40;
  });

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem('AIVALYTICS_LEADS', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('AIVALYTICS_PROGRAMS', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('AIVALYTICS_TASKS', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('AIVALYTICS_CALL_ACTIVITIES', JSON.stringify(callActivities));
  }, [callActivities]);

  useEffect(() => {
    localStorage.setItem('AIVALYTICS_DAILY_CALL_GOAL', String(dailyCallGoal));
  }, [dailyCallGoal]);

  // Initial Supabase DB Sync on mount if connected
  useEffect(() => {
    async function syncSupabaseOnBoot() {
      const dbLeads = await fetchLeadsFromSupabase();
      if (dbLeads && dbLeads.length > 0) {
        setLeads(dbLeads);
        localStorage.setItem('AIVALYTICS_LEADS', JSON.stringify(dbLeads));
      }

      const dbPrograms = await fetchProgramsFromSupabase();
      if (dbPrograms && dbPrograms.length > 0) {
        setPrograms(dbPrograms);
        localStorage.setItem('AIVALYTICS_PROGRAMS', JSON.stringify(dbPrograms));
      }
    }
    syncSupabaseOnBoot();
  }, []);

  // Real-time cross-platform database subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        async () => {
          const freshLeads = await fetchLeadsFromSupabase();
          if (freshLeads && freshLeads.length > 0) {
            setLeads(freshLeads);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const bulkAddLeads = (newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
    insertBulkLeadsToSupabase(newLeads);
  };

  const addLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    insertLeadToSupabase(newLead);
  };

  const updateLeadStage = (id: string, stage: Stage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, crmStage: stage } : l))
    );
    updateLeadStageInSupabase(id, stage);
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    deleteLeadFromSupabase(id);
  };

  const deleteBulkLeads = (ids: string[]) => {
    setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
    deleteBulkLeadsFromSupabase(ids);
  };

  const bulkUpdateStage = (ids: string[], stage: Stage) => {
    setLeads((prev) =>
      prev.map((l) => (ids.includes(l.id) ? { ...l, crmStage: stage } : l))
    );
    ids.forEach((id) => updateLeadStageInSupabase(id, stage));
  };

  const addCallNote = (leadId: string, rawNotes: string) => {
    const newNote = {
      id: `note-${Date.now()}`,
      date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      salesperson: 'Alex Rivera',
      rawNotes,
      aiAnalysis: {
        trueDesiredOutcome: 'Career transition into AI-enabled operational roles with salary growth',
        primaryMotivation: 'Fear of obsolescence + desire for competitive edge in market',
        primaryObjection: 'Verifying course technical depth vs self-guided YouTube learning',
        secondaryObjection: 'Program scheduling / timing flexibility',
        decisionFactors: ['Practical Agent Projects', 'Resume & Career Support', 'Cohort Peer Quality'],
        decisionMaker: 'Lead (Individual Decision)',
        purchaseIntent: Math.min(95, Math.floor(Math.random() * 20) + 75),
        recommendedFollowUp: 'Within 48 hours',
        recommendedStrategy: 'Send live project demo links and invite to weekend executive preview session.'
      }
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updatedHistory = [newNote, ...l.callNotesHistory];
          const updatedLead = {
            ...l,
            callNotesHistory: updatedHistory,
            intentScore: newNote.aiAnalysis.purchaseIntent
          };
          insertLeadToSupabase(updatedLead);
          return updatedLead;
        }
        return l;
      })
    );
  };

  const updateLeadFollowUp = (
    leadId: string,
    stage: Stage,
    nextFollowUpDate: string,
    note?: string
  ) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const newNote = note?.trim()
      ? {
          id: `note-${Date.now()}`,
          date: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
          salesperson: 'Alex Rivera',
          rawNotes: `[${stage} scheduled for ${nextFollowUpDate}] ${note.trim()}`,
          aiAnalysis: {
            trueDesiredOutcome: 'Follow-up discussion scheduled',
            primaryMotivation: 'Program details and enrollment discussion',
            primaryObjection: 'Evaluating options',
            secondaryObjection: 'Scheduling',
            decisionFactors: ['Cohort curriculum', 'Timings', 'Fees'],
            decisionMaker: 'Lead',
            purchaseIntent: 80,
            recommendedFollowUp: nextFollowUpDate,
            recommendedStrategy: `Prepare tailored discussion for ${stage}.`
          }
        }
      : null;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updatedHistory = newNote ? [newNote, ...(l.callNotesHistory || [])] : (l.callNotesHistory || []);
          const updatedLead: Lead = {
            ...l,
            crmStage: stage,
            nextFollowUp: nextFollowUpDate,
            lastContacted: todayStr,
            numberOfFollowUps: (l.numberOfFollowUps || 0) + 1,
            callNotesHistory: updatedHistory
          };
          insertLeadToSupabase(updatedLead);
          return updatedLead;
        }
        return l;
      })
    );
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
          : t
      )
    );
  };

  const addTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateProgram = (updatedProg: Program) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === updatedProg.id ? updatedProg : p))
    );
    upsertProgramInSupabase(updatedProg);
  };

  const addProgram = (newProg: Program) => {
    setPrograms((prev) => [...prev, newProg]);
    upsertProgramInSupabase(newProg);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, connected: !i.connected, status: !i.connected ? 'Active' : 'Placeholder' }
          : i
      )
    );
  };

  const simulateAiPrep = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, crmStage: 'Call Pending' as Stage } : l))
    );
  };

  const logCall = (leadId: string, outcome: string = 'Call Initiated', notes: string = '') => {
    const targetLead = leads.find((l) => l.id === leadId);
    const newActivity: CallActivity = {
      id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      leadId,
      leadName: targetLead ? targetLead.fullName : 'Lead',
      leadPhone: targetLead ? targetLead.phone : '',
      programName: targetLead ? targetLead.programName : 'AI Program',
      timestamp: new Date().toISOString(),
      outcome,
      notes: notes || (outcome === 'Call Initiated' ? 'Direct phone call placed' : `Call outcome marked as ${outcome}`),
      salesperson: 'Alex Rivera'
    };

    setCallActivities((prev) => [newActivity, ...prev]);

    // Also update lead's call counter and last contacted timestamp
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated: Lead = {
            ...l,
            numberOfCalls: (l.numberOfCalls || 0) + 1,
            lastContacted: new Date().toISOString()
          };
          insertLeadToSupabase(updated);
          return updated;
        }
        return l;
      })
    );
  };

  const todayStr = new Date().toISOString().substring(0, 10);
  const todayCallActivities = callActivities.filter((c) => c.timestamp.startsWith(todayStr));
  const todayCallsCount = todayCallActivities.length;

  return (
    <AppContext.Provider
      value={{
        leads,
        selectedLeadId,
        setSelectedLeadId,
        tasks,
        programs,
        integrations,
        callActivities,
        todayCallsCount,
        todayCallActivities,
        dailyCallGoal,
        setDailyCallGoal,
        logCall,
        addLead,
        bulkAddLeads,
        updateLeadStage,
        deleteLead,
        deleteBulkLeads,
        bulkUpdateStage,
        addCallNote,
        updateLeadFollowUp,
        toggleTaskStatus,
        addTask,
        updateProgram,
        addProgram,
        toggleIntegration,
        simulateAiPrep
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
