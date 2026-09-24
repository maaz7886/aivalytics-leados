import { useState } from 'react';

export default function AIIntelligence() {
  const [activeTab, setActiveTab] = useState<'Lead Scoring Engine' | 'Follow-Up Automation' | 'Sales Copilot Prompts'>('Lead Scoring Engine');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🧠</span> AI Intelligence Engine (Jev)
        </h1>
        <p className="text-sm text-gray-500 mt-1">View the internal reasoning, prompt templates, and scoring models powering the CRM.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-4 text-sm font-semibold">
        {(['Lead Scoring Engine', 'Follow-Up Automation', 'Sales Copilot Prompts'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 border-b-2 transition-all ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm min-h-[500px]">
        
        {activeTab === 'Lead Scoring Engine' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2">Scoring Model: Decision Matrix</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">The AI uses the following variables to calculate Lead Score (0-100) and Temperature (Hot/Warm/Cold):</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-primary-700">1. Fit Score Weights (50%)</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li><strong>Current Role (20%):</strong> Prioritizes Product Managers, Tech Leads, Founders.</li>
                  <li><strong>Experience (15%):</strong> Highest score for 3-10 years experience.</li>
                  <li><strong>Education (10%):</strong> Technical background or relevant MBA.</li>
                  <li><strong>AI Usage (5%):</strong> Active users get a slight boost.</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-bold text-emerald-700">2. Intent Score Weights (50%)</h3>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li><strong>Interaction Recency (20%):</strong> Contacted within 24h = max points.</li>
                  <li><strong>Urgency (15%):</strong> Analyzed from notes (e.g. "needs to transition in 3 months").</li>
                  <li><strong>Engagement (10%):</strong> WhatsApp opens, call duration.</li>
                  <li><strong>Investment Readiness (5%):</strong> No price objections raised.</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-4 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">Temperature Thresholds:</h3>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded font-bold">🔥 Hot: &gt; 80 Score</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded font-bold">🟠 Warm: 50-79 Score</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-bold">🔵 Cold: &lt; 50 Score</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Follow-Up Automation' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2">State Machine: Follow-Up Rules</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">The system automatically moves leads through the pipeline and schedules next actions based on these triggers:</p>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-4">
                <div className="bg-primary-100 p-2 rounded text-primary-700">1️⃣</div>
                <div>
                  <h4 className="font-bold text-gray-800">Trigger: New Lead Enters System</h4>
                  <p className="text-sm text-gray-600 mt-1"><strong>Action:</strong> Set stage to `New Lead`. AI enriches profile. Auto-schedule `Call Pending` for today.</p>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded text-amber-700">2️⃣</div>
                <div>
                  <h4 className="font-bold text-gray-800">Trigger: Call Logged with Outcome 'Did Not Receive Call'</h4>
                  <p className="text-sm text-gray-600 mt-1"><strong>Action:</strong> Increment call count. If &lt; 3, schedule next call in 24h. If = 3, flag as `AI Attention Required` and shift to `Follow-Up 1`.</p>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-4">
                <div className="bg-emerald-100 p-2 rounded text-emerald-700">3️⃣</div>
                <div>
                  <h4 className="font-bold text-gray-800">Trigger: Lead Marked as 'Interested'</h4>
                  <p className="text-sm text-gray-600 mt-1"><strong>Action:</strong> AI generates WhatsApp draft. Prompt salesperson to send details. Schedule `Follow-Up 1` in 48 hours.</p>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded text-red-700">4️⃣</div>
                <div>
                  <h4 className="font-bold text-gray-800">Trigger: Lead Health Score Drops Below 40</h4>
                  <p className="text-sm text-gray-600 mt-1"><strong>Action:</strong> Surface lead in `Follow-Up Command Center` under `AI Attention Required`. Recommend re-engagement sequence.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Sales Copilot Prompts' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b pb-2">System Prompts & Generation Templates</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">These are the exact prompts sent to the LLM to generate insights and messaging for the sales team.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                <div className="text-gray-400 mb-2">// PROMPT 1: Post-Call Analysis</div>
                <pre className="whitespace-pre-wrap">
{`System: You are an elite B2B sales intelligence agent for Aivalytics.
User: Analyze the following raw call notes from a salesperson.
Lead Details:
- Name: {{lead.fullName}}
- Role: {{lead.currentRole}}
- Experience: {{lead.yearsOfExperience}}
- Goal: {{lead.primaryGoal}}

Call Notes: "{{call.rawNotes}}"

Output JSON format exactly:
{
  "trueDesiredOutcome": "string",
  "primaryMotivation": "string",
  "primaryObjection": "string",
  "decisionMaker": "string",
  "purchaseIntent": number (0-100),
  "recommendedFollowUp": "string",
  "recommendedStrategy": "string"
}`}
                </pre>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-blue-400 overflow-x-auto">
                <div className="text-gray-400 mb-2">// PROMPT 2: WhatsApp Follow-Up Generator</div>
                <pre className="whitespace-pre-wrap">
{`System: Generate a personalized WhatsApp follow-up message.
Context:
- Tone: {{tone}}
- Lead Name: {{lead.fullName}}
- Program: {{lead.programName}}
- Main Blocker: {{lead.mainChallenge}}

Rules:
1. Keep it under 60 words.
2. Directly address their main blocker.
3. End with a soft call to action (e.g., "Do you have 5 mins tomorrow?").
4. Do not be overly formal. Use one emoji maximum.`}
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
