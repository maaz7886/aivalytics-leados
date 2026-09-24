// @ts-nocheck
// src/components/MetaLeadSimulatorModal.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, ProfessionalStatus, PrimaryGoal, ProgramId } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MetaLeadSimulatorModal({ isOpen, onClose }: Props) {
  const { addLead, setSelectedLeadId } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [professionalStatus, setProfessionalStatus] = useState<ProfessionalStatus>('Working Professional');
  const [currentRole, setCurrentRole] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [industry] = useState('Technology');
  const [yearsOfExperience, setYearsOfExperience] = useState(5);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal>('Upskill in Current Role');
  const [timeline, setTimeline] = useState('3–6 months');
  const [aiUsageLevel, setAiUsageLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [salaryBracket, setSalaryBracket] = useState('₹10–20 LPA');
  const [comments, setComments] = useState('');
  const [programId, setProgramId] = useState<ProgramId>('ai-pm');
  const [isSubmitting, setIsSubmitting] = useState(false);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const progName =
        programId === 'ai-pm'
          ? 'AI-Native Project Management'
          : programId === 'ai-gtm'
          ? 'AI-Native GTM'
          : 'AI Fellowship';

      const newId = `lead-sim-${Date.now()}`;

      // Simulate AI automatic preparation engine
      const simulatedLead: Lead = {
        id: newId,
        fullName: fullName || 'Demo Meta Lead',
        phone: phone || '+91 98765 00000',
        email: email || 'demolead@meta.com',
        city: city || 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        source: 'Meta Lead Ads (Simulated)',
        metaCampaign: 'Meta_Ad_Conversion_Demo',
        metaAdSet: 'Target_Segment_Live',
        metaAd: 'Ad_Creative_AI_Native',
        campaignId: `cmp_${Math.floor(Math.random() * 900000 + 100000)}`,
        dateCaptured: new Date().toLocaleString(),
        programId,
        programName: progName,
        professionalStatus,
        currentRole: currentRole || 'Manager',
        currentCompany: currentCompany || 'Innovate Inc',
        industry,
        yearsOfExperience: Number(yearsOfExperience),
        currentResponsibilities: 'Workflow execution, team management, operations.',
        currentSkillSet: ['Strategy', 'Team Coordination', 'Process Management'],
        currentAiUsageLevel: 'Intermediate',
        primaryGoal,
        desiredRole: `Lead ${progName} Specialist`,
        expectedTimeline: timeline,
        mainChallenge: 'Needs structured AI workflow frameworks for professional growth.',
        whyNow: 'Driven by recent Meta ad showcasing AI productivity stack.',
        expectedOutcome: comments || 'Master AI execution and automation workflows.',
        comments: comments || 'Ingested via Meta Ad Form Simulator.',
        assignedSalesperson: 'Alex Rivera',
        crmStage: 'Call Pending',
        leadTemperature: 'Hot',
        lastContacted: 'Just Now',
        nextFollowUp: 'Today 4:00 PM',
        numberOfCalls: 0,
        numberOfFollowUps: 0,
        paymentStatus: 'Unpaid',
        amountPaid: 0,
        enrollmentStatus: 'Not Enrolled',
        fitScore: Math.floor(Math.random() * 15) + 82,
        intentScore: Math.floor(Math.random() * 20) + 70,
        fitScoreBreakdown: [
          { factor: 'Professional Fit', score: 88, reason: 'Strong alignment with chosen program curriculum.' },
          { factor: 'Experience Match', score: 85, reason: 'Years of experience fits optimal persona window.' }
        ],
        intentScoreBreakdown: [
          { factor: 'Immediate Form Submission', score: 90, reason: 'Filled complete Meta lead ad form payload.' },
          { factor: 'Timeline Urgency', score: 80, reason: 'Requested fast career upskilling window.' }
        ],
        likelyDesiredOutcome: `${fullName} is seeking to integrate AI workflows into ${currentRole || 'their role'} at ${currentCompany || 'their company'} to achieve ${primaryGoal.toLowerCase()}.`,
        evidenceLeadProvided: [
          `${yearsOfExperience} years experience in ${industry}`,
          `Goal: ${primaryGoal}`,
          `Timeline: ${timeline}`
        ],
        evidenceAiInterpretation: [
          'High propensity for fast-track cohort enrollment.',
          'Wants practical agent architecture over theory.'
        ],
        recommendedPositioning: `Position ${progName} as an acceleration layer for ${currentRole || 'current career'} experience.`,
        recommendedOpening: `Hi ${fullName.split(' ')[0]}, looking at your profile in ${industry}, the main focus for you is adding AI execution to your existing foundation.`,
        discoveryQuestions: [
          `How are AI tools currently utilized in your role at ${currentCompany || 'your team'}?`,
          `What key milestone over the next ${timeline} would define success for you?`,
          `What is holding back your team from deploying automated agent workflows today?`
        ],
        existingSkills: ['Domain Knowledge', 'Project Execution', 'Communication'],
        aiSkillsToDevelop: ['AI Agent Orchestration', 'n8n Automation Pipelines', 'SOP Prompt Engineering'],
        whyProgramFits: `Specifically tailored for ${professionalStatus}s looking to master AI-native workflows.`,
        objections: [
          {
            objection: 'Will I get individual feedback on my capstone project?',
            whyExists: 'Wants personal mentorship.',
            recommendedResponse: 'Yes, 1-on-1 feedback from senior AI architects on every weekly project.',
            questionToAsk: 'Have you worked on building an AI agent before?'
          }
        ],
        recommendedNextAction: 'Call within 15 minutes. Lead was just generated via Meta Ads with high intent.',
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

      };

      addLead(simulatedLead);
      setSelectedLeadId(newId);
      setIsSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚡</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Meta Lead Form Simulator</h2>
            <p className="text-xs text-gray-500">Simulate incoming Meta Ad lead capture & instant AI intelligence preparation.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name *</label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Roy"
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Phone *</label>
              <input
                required
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Email *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ananya@company.com"
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Professional Status</label>
              <select
                value={professionalStatus}
                onChange={(e) => setProfessionalStatus(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Working Professional">Working Professional</option>
                <option value="Founder">Founder</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Current Role</label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g. Operations Manager"
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Current Company</label>
              <input
                type="text"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Years of Experience</label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Primary Goal</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Upskill in Current Role">Upskill in Current Role</option>
                <option value="Promotion">Promotion</option>
                <option value="Salary Increment">Salary Increment</option>
                <option value="Switch Company">Switch Company</option>
                <option value="Transition into AI Role">Transition into AI Role</option>
                <option value="Learn Automation">Learn Automation</option>
                <option value="Start a Business">Start a Business</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Target Program</label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold"
              >
                <option value="ai-pm">AI-Native Project Management</option>
                <option value="ai-gtm">AI-Native GTM</option>
                <option value="ai-fellowship">AI Fellowship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Current AI Usage Level</label>
              <select
                value={aiUsageLevel}
                onChange={(e) => setAiUsageLevel(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Beginner">Beginner (Basic ChatGPT prompts)</option>
                <option value="Intermediate">Intermediate (Custom GPTs / n8n)</option>
                <option value="Advanced">Advanced (Multi-agent orchestration)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Expected Timeline</label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="Immediate (Next 7 days)">Immediate (Next 7 days)</option>
                <option value="1–3 months">1–3 months</option>
                <option value="3–6 months">3–6 months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Current Salary / Budget Bracket</label>
              <select
                value={salaryBracket}
                onChange={(e) => setSalaryBracket(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="< ₹10 LPA">&lt; ₹10 LPA</option>
                <option value="₹10–20 LPA">₹10–20 LPA</option>
                <option value="₹20–35 LPA">₹20–35 LPA</option>
                <option value="₹35+ LPA">₹35+ LPA</option>
              </select>
            </div>
          </div>


          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">What are you looking to achieve?</label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Want to automate sprint status reports and build AI agents for my operations team."
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5"
            >
              <span>{isSubmitting ? '⚙️' : '🚀'}</span>
              {isSubmitting ? 'Simulating AI Lead Prep...' : 'Submit Lead & Prepare AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
