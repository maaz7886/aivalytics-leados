// src/components/MetaLeadSimulatorModal.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, ProgramId } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetDate?: string;
}

export default function MetaLeadSimulatorModal({ isOpen, onClose, targetDate }: Props) {
  const { addLead, setSelectedLeadId } = useApp();

  // 7 Meta Ads Lead Form Questions
  const [fullName, setFullName] = useState('Ananya Roy');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('ananya.roy@techcorp.in');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(7);
  const [currentAiUsage, setCurrentAiUsage] = useState(
    'Using ChatGPT daily for document creation and email drafts, but no automated agent pipelines.'
  );
  const [desiredOutcome, setDesiredOutcome] = useState(
    'Transition into a Senior AI-PM role leading automated project delivery teams.'
  );
  const [biggestObstacle, setBiggestObstacle] = useState(
    'Lack of practical experience building and deploying multi-agent workflows and n8n pipelines.'
  );
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

      // Simulate AI automatic preparation engine from 7 Meta Ads payload questions
      const simulatedLead: Lead = {
        id: newId,
        fullName: fullName || 'Demo Meta Lead',
        phone: phone || '+91 98765 00000',
        email: email || 'demolead@metaads.com',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        metaFormSubmission: {
          fullName,
          email,
          phone,
          yearsOfExperience: Number(yearsOfExperience),
          currentAiUsage,
          desired6To12MonthOutcome: desiredOutcome,
          biggestObstacle
        },
        source: 'Meta Lead Ads (Simulated Form)',
        metaCampaign: 'Meta_Ad_Lead_Campaign_Q3',
        metaAdSet: 'Exp_5-12_Tech_Professionals',
        metaAd: 'Ad_01_AI_Native_Career_Upskill',
        campaignId: `cmp_${Math.floor(Math.random() * 900000 + 100000)}`,
        dateCaptured: targetDate
          ? `${targetDate} ${new Date().toTimeString().substring(0, 5)}`
          : new Date().toISOString().replace('T', ' ').substring(0, 16),
        programId,
        programName: progName,
        professionalStatus: 'Working Professional',
        currentRole: 'Technology Manager',
        currentCompany: 'Tech Solutions',
        industry: 'Technology / SaaS',
        yearsOfExperience: Number(yearsOfExperience),
        currentResponsibilities: `Meta Lead Form response: ${currentAiUsage}`,
        currentSkillSet: ['Project Planning', 'Domain Execution', 'Team Leadership'],
        currentAiUsageLevel: currentAiUsage.toLowerCase().includes('advanced') ? 'Advanced' : currentAiUsage.toLowerCase().includes('beginner') ? 'Beginner' : 'Intermediate',
        primaryGoal: 'Upskill + Switch Company',
        desiredRole: `Lead ${progName} Specialist`,
        expectedTimeline: '3–6 months',
        mainChallenge: biggestObstacle,
        whyNow: 'Submitted 7-question Meta Lead Form.',
        expectedOutcome: desiredOutcome,
        comments: `Meta Lead Submission. 6-12m Goal: "${desiredOutcome}". Obstacle: "${biggestObstacle}".`,
        assignedSalesperson: 'Alex Rivera',
        crmStage: 'AI Prepared',
        leadTemperature: 'Hot',
        lastContacted: 'Just Now',
        nextFollowUp: 'Today 4:00 PM',
        numberOfCalls: 0,
        numberOfFollowUps: 0,
        paymentStatus: 'Unpaid',
        amountPaid: 0,
        enrollmentStatus: 'Not Enrolled',
        fitScore: Math.floor(Math.random() * 15) + 84,
        intentScore: Math.floor(Math.random() * 18) + 75,
        fitScoreBreakdown: [
          { factor: 'Professional Experience', score: 88, reason: `${yearsOfExperience} years experience reported on Meta form.` },
          { factor: 'AI Readiness', score: 85, reason: currentAiUsage }
        ],
        intentScoreBreakdown: [
          { factor: 'Submitted Full 7-Question Payload', score: 92, reason: 'Completed all required fields on Meta Lead ad form.' },
          { factor: 'Clear Goal Alignment', score: 85, reason: desiredOutcome }
        ],
        likelyDesiredOutcome: desiredOutcome,
        evidenceLeadProvided: [
          `Years of Experience: ${yearsOfExperience}`,
          `Current AI Usage: ${currentAiUsage}`,
          `6-12 Month Goal: ${desiredOutcome}`,
          `Main Obstacle: ${biggestObstacle}`
        ],
        evidenceAiInterpretation: [
          'High intent lead from Meta Lead Ads.',
          'Directly address obstacle in first call opening.'
        ],
        recommendedPositioning: `Position ${progName} as the exact execution engine to solve: "${biggestObstacle}".`,
        recommendedOpening: `Hi ${fullName.split(' ')[0]}, following up on your Meta Lead Ad response regarding your goal to ${desiredOutcome}.`,
        discoveryQuestions: [
          `You mentioned "${biggestObstacle}" is holding you back—how is that impacting your career progression right now?`,
          `What milestone over the next 6–12 months defines success for your career?`
        ],
        existingSkills: ['Domain Knowledge', 'Project Execution'],
        aiSkillsToDevelop: ['AI Agent Orchestration', 'n8n Automation Pipelines', 'SOP Prompt Engineering'],
        whyProgramFits: `Specifically tailored to overcome "${biggestObstacle}" for candidates with ${yearsOfExperience}+ years experience.`,
        objections: [],
        recommendedNextAction: 'Initiate call immediately. Lead filled complete 7-question Meta Lead Form.',
        callNotesHistory: []
      };

      addLead(simulatedLead);
      setSelectedLeadId(newId);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-2xl">⚡</span>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
              Meta Lead Form Simulator (7 Core Questions)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Simulate incoming Meta Ads instant lead form submissions matching your exact campaign payload.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Program Banner */}
          <div className="bg-primary-50 dark:bg-primary-950/40 p-3 rounded-xl border border-primary-200 dark:border-primary-800 flex justify-between items-center">
            <span className="font-bold text-primary-900 dark:text-primary-200">
              Target Program for Lead:
            </span>
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value as ProgramId)}
              className="px-3 py-1 bg-white dark:bg-gray-700 border border-primary-300 dark:border-primary-700 rounded-lg font-bold text-gray-900 dark:text-gray-100 outline-none"
            >
              <option value="ai-pm">AI-Native Project Management</option>
              <option value="ai-gtm">AI-Native GTM</option>
              <option value="ai-fellowship">AI Leadership Fellowship</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                Full Name (`full_name`) *
              </label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                Phone (`phone`) *
              </label>
              <input
                required
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email (`email`) *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              1. How many years of professional experience do you have? (`how_many_years_of_professional_experience_do_you_have?`) *
            </label>
            <input
              required
              type="number"
              min={0}
              max={40}
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              2. How are you currently using AI in your professional work? (`how_are_you_currently_using_ai_in_your_professional_work?`) *
            </label>
            <textarea
              required
              rows={2}
              value={currentAiUsage}
              onChange={(e) => setCurrentAiUsage(e.target.value)}
              placeholder="e.g. Using ChatGPT for content writing and basic research..."
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              3. If the next 6–12 months go well professionally, what outcome would you most want? (`if_the_next_6–12_months_go_well_professionally,_what_outcome_would_you_most_want?`) *
            </label>
            <textarea
              required
              rows={2}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              placeholder="e.g. Transition into Senior AI-PM role with 40%+ salary growth..."
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              4. What is the biggest thing stopping you from reaching that outcome today? (`what_is_the_biggest_thing_stopping_you_from_reaching_that_outcome_today?`) *
            </label>
            <textarea
              required
              rows={2}
              value={biggestObstacle}
              onChange={(e) => setBiggestObstacle(e.target.value)}
              placeholder="e.g. Lack of hands-on experience building multi-agent AI workflows..."
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isSubmitting ? '⚙️' : '🚀'}</span>
              {isSubmitting ? 'Ingesting Meta Payload & Generating AI Prep...' : 'Submit 7-Question Meta Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
