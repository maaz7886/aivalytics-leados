// src/types/index.ts

export type Role = 'Admin' | 'Salesperson';

export type Stage =
  | 'Lead'
  | 'Interested'
  | 'Not interested'
  | 'Not qualified'
  | 'Qualified'
  | 'Details sent'
  | "Didn't attempt the call"
  | 'Invalid number'
  | 'New Lead'
  | 'AI Prepared'
  | 'Contact Pending'
  | 'Connected'
  | 'Follow-Up'
  | 'Payment Link Sent'
  | 'Seat Reserved'
  | 'Enrolled';


export type PrimaryGoal =
  | 'Upskill in Current Role'
  | 'Upskill + Switch Company'
  | 'Promotion'
  | 'Salary Increment'
  | 'Switch Company'
  | 'Transition into AI Role'
  | 'Learn Automation'
  | 'Start a Business'
  | 'Career Restart'
  | 'Explore AI'
  | 'Other';

export type ProfessionalStatus =
  | 'Student'
  | 'Working Professional'
  | 'Founder'
  | 'Freelancer'
  | 'Other';

export type ProgramId = 'ai-pm' | 'ai-gtm' | 'ai-fellowship' | 'other';

export interface MetaAdFormSubmission {
  yearsOfExperience: number;
  currentAiUsage: string;
  desired6To12MonthOutcome: string;
  biggestObstacle: string;
  email: string;
  fullName: string;
  phone: string;
}

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  
  // Meta Lead Form Payload (7 Standard Questions)
  metaFormSubmission?: MetaAdFormSubmission;

  // Acquisition
  source: string;
  metaCampaign: string;
  metaAdSet: string;
  metaAd: string;
  campaignId: string;
  dateCaptured: string;
  
  // Program
  programId: ProgramId;
  programName: string;
  
  // Professional Profile
  professionalStatus: ProfessionalStatus;
  currentRole: string;
  currentCompany: string;
  industry: string;
  yearsOfExperience: number;
  currentResponsibilities: string;
  currentSkillSet: string[];
  currentAiUsageLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'None';
  
  // Career Goal
  primaryGoal: PrimaryGoal;
  desiredRole: string;
  expectedTimeline: string;
  mainChallenge: string;
  whyNow: string;
  expectedOutcome: string;
  comments: string;
  
  // Sales & CRM
  assignedSalesperson: string;
  crmStage: Stage;
  leadTemperature: 'Hot' | 'Warm' | 'Cold';
  lastContacted: string;
  nextFollowUp: string;
  numberOfCalls: number;
  numberOfFollowUps: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  amountPaid: number;
  enrollmentStatus: 'Not Enrolled' | 'Reserved' | 'Enrolled';
  
  // AI Intelligence Scores & Analysis
  fitScore: number;
  intentScore: number;
  fitScoreBreakdown: { factor: string; score: number; reason: string }[];
  intentScoreBreakdown: { factor: string; score: number; reason: string }[];
  
  // AI Intelligence Content
  likelyDesiredOutcome: string;
  evidenceLeadProvided: string[];
  evidenceAiInterpretation: string[];
  recommendedPositioning: string;
  recommendedOpening: string;
  discoveryQuestions: string[];
  existingSkills: string[];
  aiSkillsToDevelop: string[];
  whyProgramFits: string;
  objections: {
    objection: string;
    whyExists: string;
    recommendedResponse: string;
    questionToAsk: string;
  }[];
  recommendedNextAction: string;
  
  // Call Notes & History
  callNotesHistory: {
    id: string;
    date: string;
    salesperson: string;
    rawNotes: string;
    aiAnalysis?: {
      trueDesiredOutcome: string;
      primaryMotivation: string;
      primaryObjection: string;
      secondaryObjection: string;
      decisionFactors: string[];
      decisionMaker: string;
      purchaseIntent: number;
      recommendedFollowUp: string;
      recommendedStrategy: string;
    };
  }[];
}

export interface Task {
  id: string;
  leadId: string;
  leadName: string;
  type: 'Call' | 'Follow-Up' | 'WhatsApp' | 'Email' | 'Meeting' | 'Payment Follow-Up';
  dueDate: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Overdue';
  description: string;
  assignedTo: string;
}

export interface Program {
  id: ProgramId;
  name: string;
  duration: string;
  price: number;
  structure: { month: string; title: string; topics: string[] }[];
  eligibility: string;
  placementSupport: string;
  outcomes: string[];
  projects: string[];
  batchTiming: string;
  faqs: { question: string; answer: string }[];
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  status: 'Active' | 'Placeholder' | 'Config Required';
  icon: string;
}
