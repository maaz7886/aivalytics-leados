// src/pages/Settings.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Program, ProgramId } from '../types';

export default function Settings() {
  const { programs, updateProgram, addProgram } = useApp();

  // Active Settings Tab
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'pricing' | 'new-product' | 'automation' | 'ai-engine' | 'team'>('whatsapp');

  // Notification Toast
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // 1. WhatsApp Customization State
  const [waOutreachTemplate, setWaOutreachTemplate] = useState<string>(
    localStorage.getItem('CUSTOM_WA_OUTREACH') ||
      'Hi {fullName}, following up from Aivalytics regarding the {programName} cohort. Looking at your experience as {role} at {company}, do you have 5 mins to connect?'
  );

  const [waFollowupTemplate, setWaFollowupTemplate] = useState<string>(
    localStorage.getItem('CUSTOM_WA_FOLLOWUP') ||
      'Hi {fullName}, sharing the curriculum roadmap & AI agent capstone projects for {programName}. Let me know if you would like to reserve a seat.'
  );

  const [waBrochureTemplate, setWaBrochureTemplate] = useState<string>(
    localStorage.getItem('CUSTOM_WA_BROCHURE') ||
      'Hi {fullName}, here is the detailed brochure & fee structure for {programName}. Special early-bird fee available until Saturday!'
  );

  const handleSaveWhatsApp = () => {
    localStorage.setItem('CUSTOM_WA_OUTREACH', waOutreachTemplate);
    localStorage.setItem('CUSTOM_WA_FOLLOWUP', waFollowupTemplate);
    localStorage.setItem('CUSTOM_WA_BROCHURE', waBrochureTemplate);
    showToast('WhatsApp Templates Saved Successfully!');
  };

  // 2. Pricing & Existing Program Editing State
  const [editingProgId, setEditingProgId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDuration, setEditDuration] = useState<string>('');
  const [editTiming, setEditTiming] = useState<string>('');

  const startEditProgram = (p: Program) => {
    setEditingProgId(p.id);
    setEditPrice(p.price);
    setEditDuration(p.duration);
    setEditTiming(p.batchTiming);
  };

  const saveProgramEdits = (p: Program) => {
    updateProgram({
      ...p,
      price: editPrice,
      duration: editDuration,
      batchTiming: editTiming
    });
    setEditingProgId(null);
    showToast(`Updated pricing & details for ${p.name}!`);
  };

  // 3. New Product Creation State
  const [newProgId, setNewProgId] = useState<string>('ai-devops');
  const [newProgName, setNewProgName] = useState<string>('AI-Native DevOps & Platform Engineering');
  const [newProgPrice, setNewProgPrice] = useState<number>(59999);
  const [newProgDuration, setNewProgDuration] = useState<string>('3 Months');
  const [newProgTiming, setNewProgTiming] = useState<string>('Sundays (10:00 AM - 1:00 PM IST)');
  const [newProgEligibility, setNewProgEligibility] = useState<string>('DevOps, SRE, Cloud & System Engineers');
  const [newProgProject, setNewProgProject] = useState<string>('Autonomous Kubernetes Incident Resolution Agent');

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName || !newProgPrice) return;

    const newProg: Program = {
      id: (newProgId || `prog-${Date.now()}`) as ProgramId,
      name: newProgName,
      duration: newProgDuration,
      price: Number(newProgPrice),
      structure: [
        { month: 'Month 1', title: 'Foundations & Agentic Infra', topics: ['Terraform AI Prompts', 'n8n Incident Bots'] },
        { month: 'Month 2', title: 'Multi-Agent Kubernetes Ops', topics: ['K8s Log Diagnostics', 'Self-Healing Pipelines'] }
      ],
      eligibility: newProgEligibility,
      placementSupport: 'Dedicated DevOps Career Network & Resume Reviews',
      outcomes: ['Deploy autonomous SRE incident handling agents across cloud infra'],
      projects: [newProgProject || 'Autonomous Infrastructure Healing Bot'],
      batchTiming: newProgTiming,
      faqs: [{ question: 'Is coding experience required?', answer: 'Basic bash/Python familiarity recommended.' }]
    };

    addProgram(newProg);
    showToast(`Added new product "${newProgName}" to LeadOS!`);
    setNewProgName('');
    setNewProgPrice(49999);
  };

  // 4. Automation & AI Parameters
  const [distributionAlg, setDistributionAlg] = useState<string>('Round Robin');
  const [hotThreshold, setHotThreshold] = useState<number>(85);
  const [autoAiPrep, setAutoAiPrep] = useState<boolean>(true);

  // 5. AI Key Settings
  const [aiModel, setAiModel] = useState<string>('Groq Llama 3 70B (Free Tier)');
  const [apiKey, setApiKey] = useState<string>(
    localStorage.getItem('GROQ_API_KEY') || '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'
  );

  const handleSaveAiEngine = () => {
    localStorage.setItem('GROQ_API_KEY', apiKey);
    localStorage.setItem('GROK_API_KEY', apiKey);
    showToast('AI Model Engine & API Key Saved!');
  };

  return (
    <div className="space-y-6 max-w-5xl pb-10">
      {/* Settings Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Master Settings & Administration Control Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Customize WhatsApp templates, product pricing, add new programs, configure distribution algorithms & AI keys.
          </p>
        </div>

        {saveSuccessMsg && (
          <div className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md animate-fade-in">
            ✓ {saveSuccessMsg}
          </div>
        )}
      </div>

      {/* Control Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          💬 WhatsApp Templates
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          💰 Pricing & Catalog ({programs.length})
        </button>
        <button
          onClick={() => setActiveTab('new-product')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'new-product'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          ➕ Add New Product
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'automation'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          ⚡ Distribution & Rules
        </button>
        <button
          onClick={() => setActiveTab('ai-engine')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'ai-engine'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          🧠 AI Engine & Keys
        </button>
      </div>

      {/* ----------------- TAB 1: WHATSAPP TEMPLATES ----------------- */}
      {activeTab === 'whatsapp' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              💬 WhatsApp Customized Outreach Templates
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customize standard 1-click WhatsApp outreach text templates. Dynamic placeholders available: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-primary-600 font-bold">{'{fullName}'}</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-primary-600 font-bold">{'{programName}'}</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-primary-600 font-bold">{'{role}'}</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-primary-600 font-bold">{'{company}'}</code>.
            </p>
          </div>

          <div className="space-y-5 text-xs font-semibold">
            {/* Template 1: Direct Initial Outreach */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 dark:text-gray-200 flex justify-between">
                <span>1. Initial Outreach Message Template</span>
                <span className="text-[11px] text-emerald-600 font-normal">Used on Kanban 💬 WhatsApp button</span>
              </label>
              <textarea
                rows={3}
                value={waOutreachTemplate}
                onChange={(e) => setWaOutreachTemplate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium"
              />
            </div>

            {/* Template 2: Follow-Up & Curriculum */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 dark:text-gray-200 flex justify-between">
                <span>2. Follow-Up & Capstone Project Message</span>
                <span className="text-[11px] text-blue-600 font-normal">Used for 2nd touchpoint</span>
              </label>
              <textarea
                rows={3}
                value={waFollowupTemplate}
                onChange={(e) => setWaFollowupTemplate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium"
              />
            </div>

            {/* Template 3: Early-Bird & Fee Link */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-800 dark:text-gray-200 flex justify-between">
                <span>3. Fee Structure & Early-Bird Payment Link</span>
                <span className="text-[11px] text-amber-600 font-normal">Used for Details Sent / Seat Reserved</span>
              </label>
              <textarea
                rows={3}
                value={waBrochureTemplate}
                onChange={(e) => setWaBrochureTemplate(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveWhatsApp}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Save WhatsApp Templates
            </button>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: PRICING & PRODUCT CATALOG ----------------- */}
      {activeTab === 'pricing' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              💰 Product Pricing & Catalog Control
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Directly edit product pricing, program duration, and batch schedules across all live programs.
            </p>
          </div>

          <div className="space-y-4">
            {programs.map((p) => {
              const isEditing = editingProgId === p.id;

              return (
                <div
                  key={p.id}
                  className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/60 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-gray-100">
                        {p.name}
                      </h3>
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-bold">
                        ID: {p.id} • {p.structure.length} Modules
                      </span>
                    </div>

                    <button
                      onClick={() => (isEditing ? saveProgramEdits(p) : startEditProgram(p))}
                      className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      {isEditing ? 'Save Changes' : 'Edit Fee & Schedule'}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold pt-2">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300">Program Fee (INR)</label>
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-full p-2 border border-primary-500 rounded-lg bg-white dark:bg-gray-700 font-bold text-primary-600"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300">Duration</label>
                        <input
                          type="text"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300">Batch Timing</label>
                        <input
                          type="text"
                          value={editTiming}
                          onChange={(e) => setEditTiming(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
                      <div>
                        <span className="text-gray-400">Current Fee: </span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                          ₹{p.price.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration: </span>
                        <strong>{p.duration}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Schedule: </span>
                        <strong>{p.batchTiming}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Capstones: </span>
                        <strong>{p.projects[0] || 'AI Workflow Capstone'}</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: ADD NEW PRODUCT ----------------- */}
      {activeTab === 'new-product' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              ➕ Add a New Program / Product to LeadOS
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create and launch new AI programs (e.g. AI DevOps, AI Product Designer, AI Sales Automation).
            </p>
          </div>

          <form onSubmit={handleCreateNewProduct} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold">Program Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Native DevOps & Platform Engineering"
                  value={newProgName}
                  onChange={(e) => setNewProgName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold">Program Unique Identifier (ID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ai-devops"
                  value={newProgId}
                  onChange={(e) => setNewProgId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold">Program Fee (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 59999"
                  value={newProgPrice}
                  onChange={(e) => setNewProgPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 font-black text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Months"
                  value={newProgDuration}
                  onChange={(e) => setNewProgDuration(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold">Batch Timing</label>
                <input
                  type="text"
                  placeholder="e.g. Sundays (10:00 AM IST)"
                  value={newProgTiming}
                  onChange={(e) => setNewProgTiming(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold">Target Profile / Eligibility</label>
                <input
                  type="text"
                  placeholder="e.g. DevOps Engineers, Cloud Architects, System Admins"
                  value={newProgEligibility}
                  onChange={(e) => setNewProgEligibility(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold">Primary Capstone Project</label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous K8s Incident Resolution Agent"
                  value={newProgProject}
                  onChange={(e) => setNewProgProject(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                + Create & Publish New Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------- TAB 4: AUTOMATION & RULES ----------------- */}
      {activeTab === 'automation' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ⚡ Lead Distribution & Automated Qualification Rules
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Set automated lead routing, hot lead qualification thresholds, and AI sales preparation triggers.
            </p>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block font-bold text-gray-800 dark:text-gray-200">Default Distribution Algorithm</label>
              <select
                value={distributionAlg}
                onChange={(e) => setDistributionAlg(e.target.value)}
                className="mt-1 w-full md:w-80 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 font-bold"
              >
                <option value="Round Robin">Round Robin (Equal Distribution)</option>
                <option value="Program Expertise">Program Expertise Matching</option>
                <option value="Manual Assignment">Manual Assignment by Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-800 dark:text-gray-200">
                Hot Lead Fit Score Threshold ({hotThreshold}%)
              </label>
              <input
                type="range"
                min={70}
                max={95}
                value={hotThreshold}
                onChange={(e) => setHotThreshold(Number(e.target.value))}
                className="w-full md:w-80 accent-primary-600 cursor-pointer"
              />
              <span className="block text-[11px] text-gray-500">Leads with fit score ≥ {hotThreshold}% are automatically assigned 🔥 Hot Temperature.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="auto-ai-prep"
                checked={autoAiPrep}
                onChange={(e) => setAutoAiPrep(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="auto-ai-prep" className="font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                Automatically generate AI Sales Pitch & Discovery Questions when new Meta leads arrive
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 5: AI ENGINE & KEYS ----------------- */}
      {activeTab === 'ai-engine' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              🧠 AI Intelligence Engine & API Parameters
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select LLM models for pitch generation, objection handling, and lead scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <label className="block font-bold text-gray-800 dark:text-gray-200">Selected LLM Engine</label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="mt-1 w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 font-bold"
              >
                <option value="Groq Llama 3 70B (Free Tier)">Groq Llama 3 70B (Free Tier Active)</option>
                <option value="xAI Grok-2 Mini (Recommended)">xAI Grok-2 Mini</option>
                <option value="xAI Grok-beta (High Reasoning)">xAI Grok-beta</option>
                <option value="Google Gemini 1.5 Flash (Free Tier)">Google Gemini 1.5 Flash</option>
                <option value="GPT-4o (High Intelligence)">GPT-4o</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-800 dark:text-gray-200">Groq / Grok API Key</label>
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 font-mono"
              />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                ✓ Connected Key: {apiKey.substring(0, 10)}...
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveAiEngine}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Save AI Parameters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
