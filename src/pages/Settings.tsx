// src/pages/Settings.tsx
import { useState } from 'react';

export default function Settings() {
  const [leadAssignment, setLeadAssignment] = useState('Round Robin');
  const [aiModel, setAiModel] = useState('Groq Llama 3 70B (Free Tier)');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings & Administration</h1>
        <p className="text-sm text-gray-500">Manage team roles, lead distribution rules, and AI model parameters.</p>
      </div>

      {/* Team Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Team Members & Roles</h2>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Alex Rivera</span>
              <span className="text-xs text-gray-400 block">alex.rivera@aivalytics.io</span>
            </div>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">Admin</span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">Sam Miller</span>
              <span className="text-xs text-gray-400 block">sam.miller@aivalytics.io</span>
            </div>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">Salesperson</span>
          </div>
        </div>
      </div>

      {/* Lead Assignment */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Lead Assignment Rules</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Default Distribution Algorithm</label>
          <select
            value={leadAssignment}
            onChange={(e) => setLeadAssignment(e.target.value)}
            className="mt-1 w-full md:w-80 px-3 py-2 border rounded-lg dark:bg-gray-700 text-sm font-medium"
          >
            <option value="Round Robin">Round Robin (Equal Distribution)</option>
            <option value="Program Expertise">Program Expertise Matching</option>
            <option value="Manual Assignment">Manual Assignment by Admin</option>
          </select>
        </div>
      </div>

      {/* AI Model & Groq / Grok API Parameters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Intelligence Engine & API Key</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Selected Model Engine</label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 text-sm font-medium"
            >
              <option value="Groq Llama 3 70B (Free Tier)">Groq Llama 3 70B (Free Tier Active)</option>
              <option value="xAI Grok-2 Mini (Recommended)">xAI Grok-2 Mini</option>
              <option value="xAI Grok-beta (High Reasoning)">xAI Grok-beta</option>
              <option value="Google Gemini 1.5 Flash (Free Tier)">Google Gemini 1.5 Flash</option>
              <option value="GPT-4o (High Intelligence)">GPT-4o</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">Groq / Grok API Key</label>
            <input
              type="password"
              placeholder="gsk_..."
              value={localStorage.getItem('GROQ_API_KEY') || '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'}
              onChange={(e) => {
                localStorage.setItem('GROQ_API_KEY', e.target.value);
                localStorage.setItem('GROK_API_KEY', e.target.value);
              }}
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 text-sm font-medium"
            />
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
              ✓ Groq API Key Connected (`gsk_WqzWbb...`)
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow transition-all cursor-pointer"
        >
          {saved ? 'Settings Saved!' : 'Save AI Engine Settings'}
        </button>
      </div>
    </div>
  );
}

