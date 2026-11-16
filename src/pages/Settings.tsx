// src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type {
  Program,
  ProgramId,
  CustomFieldType,
  ProgramScope
} from '../types';
import { Plus, Sparkles, Check, Trash2, Flame, Sun, Snowflake } from 'lucide-react';

export default function Settings() {
  const {
    programs,
    updateProgram,
    addProgram,
    customFields,
    addCustomField,
    archiveCustomField,
    questionBank,
    addQuestionBankItem,
    deleteQuestionBankItem,
    scoringRules,
    saveScoringRule,
    questionAnswers,
    promoteQuestionToCustomField
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as any;

  // Active Settings Tab
  const [activeTab, setActiveTab] = useState<
    'whatsapp' | 'pricing' | 'new-product' | 'automation' | 'ai-engine' | 'fields' | 'question-bank' | 'scoring-rules'
  >(urlTab || 'whatsapp');

  useEffect(() => {
    if (urlTab && ['whatsapp', 'pricing', 'new-product', 'automation', 'ai-engine', 'fields', 'question-bank', 'scoring-rules'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
    localStorage.getItem('GROQ_API_KEY') || ''
  );

  const handleSaveAiEngine = () => {
    localStorage.setItem('GROQ_API_KEY', apiKey);
    localStorage.setItem('GROK_API_KEY', apiKey);
    showToast('AI Model Engine & API Key Saved!');
  };

  // Step 2C: 6. Custom Fields State
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldScope, setNewFieldScope] = useState<ProgramScope>('All');

  // Step 2C: 7. Question Bank State
  const [qbFilter, setQbFilter] = useState<'All' | 'AI-PM' | 'AI Builder'>('All');
  const [isAddQbOpen, setIsAddQbOpen] = useState(false);
  const [newQbText, setNewQbText] = useState('');
  const [newQbCustomFieldKey, setNewQbCustomFieldKey] = useState('');
  const [newQbScope, setNewQbScope] = useState<ProgramScope>('AI-PM');
  const [newQbOrder, setNewQbOrder] = useState<number>(1);
  const [newQbRequired, setNewQbRequired] = useState<boolean>(false);
  const [newQbOptions, setNewQbOptions] = useState<string>('');

  // Step 2C: 8. Scoring Rules State
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleScope, setNewRuleScope] = useState<ProgramScope>('All');
  const [newRuleFieldKey, setNewRuleFieldKey] = useState('current_role');
  const [newRuleOperator, setNewRuleOperator] = useState<'equals' | 'contains' | 'gte' | 'lte' | 'in'>('equals');
  const [newRuleValue, setNewRuleValue] = useState('');
  const [newRuleTemp, setNewRuleTemp] = useState<'Hot' | 'Warm' | 'Cold'>('Hot');

  // Detect unpromoted questions from submissions/answers
  const existingFieldKeys = new Set((customFields || []).map((f) => f.key));
  const unpromotedMap = new Map<string, { label: string; sample: string; count: number }>();
  (questionAnswers || []).forEach((qa) => {
    if (!existingFieldKeys.has(qa.questionKey)) {
      if (!unpromotedMap.has(qa.questionKey)) {
        unpromotedMap.set(qa.questionKey, {
          label: qa.questionLabel,
          sample: qa.answerValue || qa.answerLabel,
          count: 1
        });
      } else {
        unpromotedMap.get(qa.questionKey)!.count += 1;
      }
    }
  });
  const unpromotedQuestions = Array.from(unpromotedMap.entries()).map(([k, v]) => ({
    key: k,
    ...v
  }));

  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const key = newFieldKey.trim() || newFieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const options = ['single select', 'multi select'].includes(newFieldType)
      ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : undefined;

    addCustomField({
      key,
      label: newFieldLabel.trim(),
      type: newFieldType,
      options,
      programScope: newFieldScope,
      active: true
    });

    setIsAddFieldOpen(false);
    setNewFieldKey('');
    setNewFieldLabel('');
    setNewFieldOptions('');
    showToast(`Created custom field "${newFieldLabel}"`);
  };

  const handleCreateQbItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQbText.trim()) return;
    const options = newQbOptions.trim()
      ? newQbOptions.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const qKey = newQbCustomFieldKey || newQbText.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    addQuestionBankItem({
      questionText: newQbText.trim(),
      questionKey: qKey,
      customFieldKey: qKey,
      type: 'text',
      programScope: newQbScope,
      order: Number(newQbOrder) || (questionBank.length + 1),
      requiredBeforePaymentLink: newQbRequired,
      requiredBeforePayment: newQbRequired,
      options
    });

    setIsAddQbOpen(false);
    setNewQbText('');
    setNewQbCustomFieldKey('');
    setNewQbOptions('');
    showToast('Question added to Question Bank');
  };

  const handleCreateScoringRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleValue.trim()) return;

    saveScoringRule({
      id: `rule-${Date.now()}`,
      name: newRuleName.trim(),
      programScope: newRuleScope,
      conditions: [
        {
          fieldKey: newRuleFieldKey,
          operator: newRuleOperator,
          value: newRuleValue.trim()
        }
      ],
      resultingTemperature: newRuleTemp,
      active: true
    });

    setIsAddRuleOpen(false);
    setNewRuleName('');
    setNewRuleValue('');
    showToast(`Created scoring rule "${newRuleName}"`);
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
          onClick={() => handleTabChange('whatsapp')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          WhatsApp Templates
        </button>
        <button
          onClick={() => handleTabChange('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'pricing'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Pricing & Catalog ({programs.length})
        </button>
        <button
          onClick={() => handleTabChange('fields')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'fields'
              ? 'bg-[#3B4BDB] text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Fields ({customFields.length})
          {unpromotedQuestions.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-[#FEE4E2] text-[#B42318] text-[10px] font-bold rounded-full">
              {unpromotedQuestions.length} new
            </span>
          )}
        </button>
        <button
          onClick={() => handleTabChange('question-bank')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'question-bank'
              ? 'bg-[#5B2BA8] text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Question Bank ({questionBank.length})
        </button>
        <button
          onClick={() => handleTabChange('scoring-rules')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'scoring-rules'
              ? 'bg-[#B42318] text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Scoring Rules ({scoringRules.length})
        </button>
        <button
          onClick={() => handleTabChange('new-product')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'new-product'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Add New Product
        </button>
        <button
          onClick={() => handleTabChange('automation')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'automation'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Distribution & Rules
        </button>
        <button
          onClick={() => handleTabChange('ai-engine')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'ai-engine'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          AI Engine & Keys
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

      {/* ----------------- TAB 6: CUSTOM FIELDS & FORM Q&A ----------------- */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          {/* New Questions Detected Section */}
          <div className="bg-white border border-[#E6E6E3] p-5 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1F1F1D] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3B4BDB]" />
                  <span>New Questions Detected from Forms & Ingestions</span>
                </h2>
                <p className="text-xs text-[#6B6B66]">
                  Incoming Meta ad forms, CSV imports, or webhooks with unknown questions are captured here. Promote them to custom fields with 1 click.
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold">
                {unpromotedQuestions.length} pending
              </span>
            </div>

            {unpromotedQuestions.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B6B66] border border-dashed border-[#E6E6E3] rounded-lg bg-[#F7F7F5]/50">
                <Check className="w-5 h-5 text-[#17673A] mx-auto mb-1" />
                All detected questions are currently mapped to official custom fields.
              </div>
            ) : (
              <div className="divide-y divide-[#E6E6E3] border border-[#E6E6E3] rounded-lg overflow-hidden">
                {unpromotedQuestions.map((q) => (
                  <div key={q.key} className="p-3 bg-white flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#1F1F1D] flex items-center gap-2">
                        <span>{q.label}</span>
                        <code className="text-[10px] text-[#6B6B66] bg-[#F7F7F5] px-1.5 py-0.5 rounded">
                          {q.key}
                        </code>
                      </div>
                      <div className="text-[11px] text-[#6B6B66]">
                        Sample answer: <span className="text-[#1F1F1D] font-medium">"{q.sample}"</span> • Detected {q.count} time(s)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        promoteQuestionToCustomField(q.key, q.label, 'text');
                        showToast(`Promoted "${q.label}" to Custom Field!`);
                      }}
                      className="px-3 py-1.5 bg-[#3B4BDB] hover:bg-[#2F3CB8] text-white font-medium text-xs rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Promote to Custom Field</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manage Custom Fields Table */}
          <div className="bg-white border border-[#E6E6E3] p-5 rounded-xl shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-[#1F1F1D]">Custom Fields Directory</h2>
                <p className="text-xs text-[#6B6B66]">
                  Fields available across lead profiles, table grids, filters, sort, and calling qualification. (Never deleted to prevent historical data loss).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFieldOpen(!isAddFieldOpen)}
                className="px-3 py-1.5 bg-[#3B4BDB] hover:bg-[#2F3CB8] text-white font-medium text-xs rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Field</span>
              </button>
            </div>

            {/* Inline Add Field Form */}
            {isAddFieldOpen && (
              <form onSubmit={handleCreateCustomField} className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg text-xs space-y-3">
                <div className="font-semibold text-[#1F1F1D]">Create New Custom Field</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Field Label *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Years of Experience"
                      value={newFieldLabel}
                      onChange={(e) => {
                        setNewFieldLabel(e.target.value);
                        if (!newFieldKey) {
                          setNewFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
                        }
                      }}
                      className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#3B4BDB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Field Key (Unique identifier)</label>
                    <input
                      type="text"
                      placeholder="e.g. experience_years"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#3B4BDB] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Field Type *</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as any)}
                      className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#3B4BDB]"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="single select">Single Select</option>
                      <option value="multi select">Multi Select</option>
                      <option value="date">Date</option>
                      <option value="yes/no">Yes / No</option>
                      <option value="phone">Phone</option>
                      <option value="url">URL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Program Scope</label>
                    <select
                      value={newFieldScope}
                      onChange={(e) => setNewFieldScope(e.target.value as any)}
                      className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#3B4BDB]"
                    >
                      <option value="All">All Programs</option>
                      <option value="AI-PM">AI-PM Only</option>
                      <option value="AI Builder">AI Builder Only</option>
                    </select>
                  </div>
                </div>

                {['single select', 'multi select'].includes(newFieldType) && (
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">
                      Options (comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Working professional, Student, Founder, Job seeker"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#3B4BDB]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddFieldOpen(false)}
                    className="px-3 py-1.5 border border-[#E6E6E3] hover:bg-white text-[#1F1F1D] rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#3B4BDB] hover:bg-[#2F3CB8] text-white rounded text-xs font-semibold"
                  >
                    Save Field
                  </button>
                </div>
              </form>
            )}

            {/* Custom Fields List */}
            <div className="border border-[#E6E6E3] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[11px] font-semibold text-[#6B6B66]">
                  <tr>
                    <th className="py-2.5 px-3">Field Label</th>
                    <th className="py-2.5 px-3">Field Key</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Options</th>
                    <th className="py-2.5 px-3">Scope</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E6E3] bg-white">
                  {customFields.map((field) => (
                    <tr key={field.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#1F1F1D]">{field.label}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B6B66]">{field.key}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#F7F7F5] text-[#1F1F1D] border border-[#E6E6E3] text-[10px] font-medium capitalize">
                          {field.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {field.options && field.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {field.options.slice(0, 3).map((opt) => (
                              <span key={opt} className="px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#6B6B66] text-[10px]">
                                {opt}
                              </span>
                            ))}
                            {field.options.length > 3 && (
                              <span className="text-[10px] text-[#6B6B66]">+{field.options.length - 3} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#6B6B66] text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium text-[#1F1F1D]">{field.programScope}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {field.active ? (
                          <span className="inline-flex items-center gap-1 text-[#17673A] font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#17673A]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#6B6B66] font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6B6B66]" />
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            archiveCustomField(field.id, !field.active);
                            showToast(field.active ? `Archived "${field.label}"` : `Restored "${field.label}"`);
                          }}
                          className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                            field.active
                              ? 'text-[#8E2424] hover:bg-[#FEE4E2]/50'
                              : 'text-[#17673A] hover:bg-[#DDF4E4]/50'
                          }`}
                        >
                          {field.active ? 'Archive' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 7: QUESTION BANK ----------------- */}
      {activeTab === 'question-bank' && (
        <div className="bg-white border border-[#E6E6E3] p-5 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#1F1F1D]">Question Bank</h2>
              <p className="text-xs text-[#6B6B66]">
                Questions reps ask on qualification calls and intake forms, linked to custom fields. Seeded for AI-PM and AI Builder.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddQbOpen(!isAddQbOpen)}
              className="px-3 py-1.5 bg-[#5B2BA8] hover:bg-[#4a228a] text-white font-medium text-xs rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Scope Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E6E6E3] pb-2">
            {(['All', 'AI-PM', 'AI Builder'] as const).map((sc) => (
              <button
                key={sc}
                type="button"
                onClick={() => setQbFilter(sc)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  qbFilter === sc
                    ? 'bg-[#EFE6FF] text-[#5B2BA8] font-semibold'
                    : 'text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6]'
                }`}
              >
                {sc === 'All' ? 'All Questions' : sc}
              </button>
            ))}
          </div>

          {/* Inline Add Question Form */}
          {isAddQbOpen && (
            <form onSubmit={handleCreateQbItem} className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg text-xs space-y-3">
              <div className="font-semibold text-[#1F1F1D]">Add Question to Bank</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Question Prompt *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Have you built anything with AI before?"
                    value={newQbText}
                    onChange={(e) => {
                      setNewQbText(e.target.value);
                      if (!newQbCustomFieldKey) {
                        setNewQbCustomFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
                      }
                    }}
                    className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#5B2BA8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Linked Custom Field Key *</label>
                  <select
                    value={newQbCustomFieldKey}
                    onChange={(e) => setNewQbCustomFieldKey(e.target.value)}
                    className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#5B2BA8]"
                  >
                    <option value="">Select or type key...</option>
                    {customFields.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label} ({f.key})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Program Scope</label>
                  <select
                    value={newQbScope}
                    onChange={(e) => setNewQbScope(e.target.value as any)}
                    className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#5B2BA8]"
                  >
                    <option value="AI-PM">AI-PM</option>
                    <option value="AI Builder">AI Builder</option>
                    <option value="All">All Programs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Order #</label>
                  <input
                    type="number"
                    value={newQbOrder}
                    onChange={(e) => setNewQbOrder(Number(e.target.value))}
                    className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#5B2BA8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Quick Select Options (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Yes, No, In Progress"
                    value={newQbOptions}
                    onChange={(e) => setNewQbOptions(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#5B2BA8]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="qb-required"
                  checked={newQbRequired}
                  onChange={(e) => setNewQbRequired(e.target.checked)}
                  className="rounded border-[#E6E6E3] text-[#5B2BA8] focus:ring-0"
                />
                <label htmlFor="qb-required" className="text-xs text-[#1F1F1D] cursor-pointer">
                  Required before payment link can be sent
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddQbOpen(false)}
                  className="px-3 py-1.5 border border-[#E6E6E3] hover:bg-white text-[#1F1F1D] rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#5B2BA8] hover:bg-[#4a228a] text-white rounded text-xs font-semibold"
                >
                  Save Question
                </button>
              </div>
            </form>
          )}

          {/* Question Bank Table */}
          <div className="border border-[#E6E6E3] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[11px] font-semibold text-[#6B6B66]">
                <tr>
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3">Question</th>
                  <th className="py-2.5 px-3">Linked Custom Field</th>
                  <th className="py-2.5 px-3">Quick Options</th>
                  <th className="py-2.5 px-3">Scope</th>
                  <th className="py-2.5 px-3">Required</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E3] bg-white">
                {questionBank
                  .filter((q) => qbFilter === 'All' || q.programScope === qbFilter || q.programScope === 'All')
                  .sort((a, b) => a.order - b.order)
                  .map((q) => (
                    <tr key={q.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#6B6B66]">{q.order}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#1F1F1D]">{q.questionText}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[#3B4BDB]">{q.customFieldKey || q.questionKey}</td>
                      <td className="py-2.5 px-3">
                        {q.options && q.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {q.options.map((opt) => (
                              <span key={opt} className="px-1.5 py-0.2 rounded bg-[#EEF0FD] text-[#3B4BDB] text-[10px] font-medium">
                                {opt}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#6B6B66] text-[11px]">Free text</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F7F7F5] border border-[#E6E6E3] text-[#1F1F1D]">
                          {q.programScope}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {(q.requiredBeforePaymentLink || q.requiredBeforePayment) ? (
                          <span className="text-[#B42318] font-semibold text-[11px]">Required</span>
                        ) : (
                          <span className="text-[#6B6B66] text-[11px]">Optional</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            deleteQuestionBankItem(q.id);
                            showToast(`Deleted question from bank`);
                          }}
                          className="text-[#8E2424] hover:bg-[#FEE4E2]/50 p-1 rounded"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 8: AUTO TEMPERATURE SCORING RULES ----------------- */}
      {activeTab === 'scoring-rules' && (
        <div className="bg-white border border-[#E6E6E3] p-5 rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#1F1F1D] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#B42318]" />
                <span>Auto Temperature Scoring Rules</span>
              </h2>
              <p className="text-xs text-[#6B6B66]">
                Rules run automatically on lead import, form re-submissions, and call qualification saving. Rep manual overrides (locked) are preserved.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddRuleOpen(!isAddRuleOpen)}
              className="px-3 py-1.5 bg-[#B42318] hover:bg-[#911c13] text-white font-medium text-xs rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scoring Rule</span>
            </button>
          </div>

          {/* Inline Add Rule Form */}
          {isAddRuleOpen && (
            <form onSubmit={handleCreateScoringRule} className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg text-xs space-y-3">
              <div className="font-semibold text-[#1F1F1D]">Create New Scoring Rule</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Rule Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Working PM with Immediate Start"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#B42318]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Program Scope</label>
                  <select
                    value={newRuleScope}
                    onChange={(e) => setNewRuleScope(e.target.value as any)}
                    className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#B42318]"
                  >
                    <option value="All">All Programs</option>
                    <option value="AI-PM">AI-PM Only</option>
                    <option value="AI Builder">AI Builder Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">If Field</label>
                  <select
                    value={newRuleFieldKey}
                    onChange={(e) => setNewRuleFieldKey(e.target.value)}
                    className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#B42318]"
                  >
                    <option value="current_role">Current Role</option>
                    <option value="years_of_experience">Years of Experience</option>
                    <option value="goal">Primary Goal</option>
                    <option value="start_timeline">Start Timeline</option>
                    {customFields.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label} ({f.key})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Operator</label>
                  <select
                    value={newRuleOperator}
                    onChange={(e) => setNewRuleOperator(e.target.value as any)}
                    className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#B42318]"
                  >
                    <option value="equals">equals</option>
                    <option value="contains">contains</option>
                    <option value="gte">greater than or equal (≥)</option>
                    <option value="lte">less than or equal (≤)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Target Value *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Working professional, 3, This month"
                    value={newRuleValue}
                    onChange={(e) => setNewRuleValue(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded text-xs outline-none focus:border-[#B42318]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B6B66] mb-1">Resulting Temperature *</label>
                <div className="flex items-center gap-3">
                  {(['Hot', 'Warm', 'Cold'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="resultingTemp"
                        checked={newRuleTemp === t}
                        onChange={() => setNewRuleTemp(t)}
                        className="text-[#B42318]"
                      />
                      <span className="font-semibold text-xs text-[#1F1F1D]">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-3 py-1.5 border border-[#E6E6E3] hover:bg-white text-[#1F1F1D] rounded text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#B42318] hover:bg-[#911c13] text-white rounded text-xs font-semibold"
                >
                  Save Scoring Rule
                </button>
              </div>
            </form>
          )}

          {/* Scoring Rules List */}
          <div className="border border-[#E6E6E3] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[11px] font-semibold text-[#6B6B66]">
                <tr>
                  <th className="py-2.5 px-3">Rule Name</th>
                  <th className="py-2.5 px-3">Scope</th>
                  <th className="py-2.5 px-3">Condition (IF)</th>
                  <th className="py-2.5 px-3">Resulting Temperature (THEN)</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E6E3] bg-white">
                {scoringRules.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#1F1F1D]">{r.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F7F7F5] border border-[#E6E6E3] text-[#1F1F1D]">
                        {r.programScope}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-0.5">
                        {r.conditions.map((c, i) => (
                          <div key={i} className="font-mono text-[11px] text-[#1F1F1D]">
                            {i > 0 && <span className="text-[#6B6B66] font-sans font-bold">AND </span>}
                            <span className="text-[#3B4BDB]">{c.fieldKey}</span>{' '}
                            <span className="text-[#6B6B66]">{c.operator}</span>{' '}
                            <span className="font-semibold">"{String(c.value)}"</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      {r.resultingTemperature === 'Hot' && (
                        <span className="px-2 py-0.5 rounded bg-[#FEE4E2] text-[#B42318] text-[11px] font-semibold inline-flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Hot
                        </span>
                      )}
                      {r.resultingTemperature === 'Warm' && (
                        <span className="px-2 py-0.5 rounded bg-[#FFF0D6] text-[#8A4B00] text-[11px] font-semibold inline-flex items-center gap-1">
                          <Sun className="w-3 h-3" />
                          Warm
                        </span>
                      )}
                      {r.resultingTemperature === 'Cold' && (
                        <span className="px-2 py-0.5 rounded bg-[#EEF0FD] text-[#3B4BDB] text-[11px] font-semibold inline-flex items-center gap-1">
                          <Snowflake className="w-3 h-3" />
                          Cold
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          saveScoringRule({ ...r, active: !r.active });
                          showToast(`Toggled rule "${r.name}"`);
                        }}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                          r.active
                            ? 'text-[#17673A] bg-[#DDF4E4]/60'
                            : 'text-[#6B6B66] bg-[#F3F4F6]'
                        }`}
                      >
                        {r.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
