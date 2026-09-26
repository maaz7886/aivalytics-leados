// src/types/index.ts

export type Role = 'Admin' | 'Salesperson';

export type Stage =
  | 'New Lead'
  | 'Call Pending'
  | 'Call Later'
  | 'Did Not Pick The Call'
  | 'Did Not Receive Call'
  | 'Connected'
  | 'Interested'
  | 'Details Sent on WhatsApp'
  | 'Follow-Up 1'
  | 'Follow-Up 2'
  | 'Follow-Up 3'
  | 'Qualified'
  | 'Payment Discussion'
  | 'Payment Pending'
  | 'Joined Session'
  | 'Not Interested'
  | 'Unqualified'
  | 'Lost'
  | 'Converted';


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
  | 'Other'
  | (string & {});

export type ProfessionalStatus =
  | 'Student'
  | 'Working Professional'
  | 'Founder'
  | 'Freelancer'
  | 'Other'
  | (string & {});

export type ProgramId = 'ai-pm' | 'ai-gtm' | 'ai-fellowship' | 'other' | (string & {});

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  country: string;
  
  // Acquisition & Form Metadata (Qualifying Questions)
  source: string;
  metaCampaign: string;
  metaAdSet: string;
  metaAd: string;
  campaignId: string;
  dateCaptured: string;
  dateOfFillingForm?: string;
  createdTime?: string;
  
  // Program
  programId: ProgramId;
  programName: string;
  
  // Professional Profile & Qualification Responses
  professionalStatus: ProfessionalStatus;
  currentRole: string;
  currentCompany: string;
  industry: string;
  yearsOfExperience: number;
  experience?: string;
  currentResponsibilities: string;
  currentSkillSet: string[];
  currentAiUsageLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'None' | (string & {});
  aiUsage?: string;
  
  // Career Goal & Qualification Questions
  primaryGoal: PrimaryGoal;
  goal?: string;
  desiredRole: string;
  expectedTimeline: string;
  mainChallenge: string;
  blocker?: string;
  whyNow: string;
  expectedOutcome: string;
  comments: string;
  investment: string;
  education: string;
  priority: string;
  qualificationStatus: string;
  objection: string;
  preferredBatch: string;
  preferredContactTime: string;
  paymentLink: string;
  aiRecommendation: string;
  
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
  leadScore: number;
  leadHealthScore: number;
  aiSummary: string;
  nextBestAction: string;
  conversionProbability: number;
  temperature: string;
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


export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  created_by?: string;
  metadata: any;
  created_at: string;
}

export interface LeadStageHistory {
  id: string;
  lead_id: string;
  previous_stage: string;
  new_stage: string;
  reason?: string;
  changed_by?: string;
  created_at: string;
}

export interface ImportBatch {
  id: string;
  filename: string;
  source: string;
  uploaded_by?: string;
  total_rows: number;
  imported_rows: number;
  updated_rows: number;
  duplicates: number;
  failed_rows: number;
  skipped_rows: number;
  errors: any[];
  created_at: string;
}

export interface CallActivity {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  programName?: string;
  timestamp: string;
  outcome: string;
  notes?: string;
  durationSeconds?: number;
  salesperson?: string;
}

