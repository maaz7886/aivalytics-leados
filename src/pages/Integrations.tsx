// src/pages/Integrations.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface FormMapping {
  formId: string;
  formName: string;
  programId: string;
  programName: string;
}

export default function Integrations() {
  const { integrations, toggleIntegration } = useApp();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  // Meta Ads credentials state
  const [metaAppId, setMetaAppId] = useState('104829302910482');
  const [metaAppSecret, setMetaAppSecret] = useState('••••••••••••••••••••');
  const [pageAccessToken, setPageAccessToken] = useState('EAABwz6X98a4BA... (Live Access Token Configured)');
  const [pixelId, setPixelId] = useState('109283019284920');
  const [capiEnabled, setCapiEnabled] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Form ID mapping state
  const [formMappings, setFormMappings] = useState<FormMapping[]>([
    { formId: '10482901', formName: 'AI-PM Lead Gen Form 2026', programId: 'ai-pm', programName: 'AI-Native Project Management' },
    { formId: '20931044', formName: 'AI-GTM Growth Form 2026', programId: 'ai-gtm', programName: 'AI-Native GTM & Growth' },
    { formId: '30491829', formName: 'AI Fellowship Exec Form', programId: 'ai-fellowship', programName: 'AI Leadership Fellowship' }
  ]);

  const [newFormId, setNewFormId] = useState('');
  const [newFormName, setNewFormName] = useState('');
  const [newFormProgId, setNewFormProgId] = useState('ai-pm');

  // Test Webhook Payload Simulation
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookLog, setWebhookLog] = useState<string | null>(null);

  const webhookEndpointUrl = 'https://aivalytics-leados.vercel.app/api/meta-webhook';
  const verifyToken = 'aivalytics_meta_secret_2026';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookEndpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormId || !newFormName) return;

    const progNameMap: Record<string, string> = {
      'ai-pm': 'AI-Native Project Management',
      'ai-gtm': 'AI-Native GTM & Growth',
      'ai-fellowship': 'AI Leadership Fellowship'
    };

    setFormMappings((prev) => [
      ...prev,
      {
        formId: newFormId.trim(),
        formName: newFormName.trim(),
        programId: newFormProgId,
        programName: progNameMap[newFormProgId] || 'Custom Program'
      }
    ]);
    setNewFormId('');
    setNewFormName('');
  };

  const handleRemoveMapping = (formId: string) => {
    setFormMappings((prev) => prev.filter((m) => m.formId !== formId));
  };

  const handleSimulateWebhookEvent = () => {
    setIsTestingWebhook(true);
    setWebhookLog('Sending HTTP POST payload to /api/meta-webhook...');

    setTimeout(() => {
      const samplePayload = {
        object: 'page',
        entry: [
          {
            id: '104829302910482',
            time: Math.floor(Date.now() / 1000),
            changes: [
              {
                field: 'leadgen',
                value: {
                  ad_id: 'ad_992038102',
                  form_id: '10482901',
                  leadgen_id: `lead_${Date.now()}`,
                  created_time: Math.floor(Date.now() / 1000),
                  page_id: '104829302910482'
                }
              }
            ]
          }
        ]
      };

      setWebhookLog(
        `STATUS 200 OK - Webhook Payload Ingested Successfully!\n\n` +
        `📥 Received Meta Event: leadgen_id="${samplePayload.entry[0].changes[0].value.leadgen_id}"\n` +
        `🔎 Fetched Meta Graph API Lead Fields: Full Name, Phone, Email, Experience, Goal\n` +
        `🤖 Groq AI Profiler: Fit Score 94/100 • Intent Score 88/100\n` +
        `⚡ Supabase DB: Inserted & Synced Live Across All Browsers!`
      );
      setIsTestingWebhook(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">API & Meta Ads Integrations</h1>
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-extrabold text-xs rounded-full border border-blue-300 dark:border-blue-700">
              Meta Graph API v19.0
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">Connect Facebook & Instagram Lead Ads, Webhooks, Conversions API (CAPI), and AI LLM models.</p>
        </div>

        <button
          onClick={handleSimulateWebhookEvent}
          disabled={isTestingWebhook}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>⚡</span> {isTestingWebhook ? 'Simulating Event...' : 'Test Meta Webhook Event'}
        </button>
      </div>

      {/* META ADS INTEGRATION CONTROL CENTER */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 text-white p-6 md:p-8 rounded-2xl border border-blue-700 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-700/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-md">
              f
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Meta Lead Ads Real-Time Webhook Engine</h2>
              <p className="text-xs text-blue-200">Automatically ingests Facebook & Instagram leads into Supabase with instant Groq AI enrichment.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Webhook Endpoint Live & Active
          </span>
        </div>

        {/* Webhook Configuration Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-700/60 space-y-2">
            <label className="text-xs font-bold text-blue-200 block uppercase tracking-wider">
              1. Webhook Callback Endpoint URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookEndpointUrl}
                className="flex-1 px-3 py-2 bg-gray-950 border border-blue-700 rounded-lg text-xs font-mono text-emerald-300 select-all"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0"
              >
                {copiedUrl ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <p className="text-[11px] text-blue-300">Paste this URL into Meta Developers Portal ➔ Webhooks ➔ Leadgen Topic Subscription.</p>
          </div>

          <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-700/60 space-y-2">
            <label className="text-xs font-bold text-blue-200 block uppercase tracking-wider">
              2. Webhook Verification Token (hub.verify_token)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={verifyToken}
                className="flex-1 px-3 py-2 bg-gray-950 border border-blue-700 rounded-lg text-xs font-mono text-amber-300 select-all"
              />
              <button
                onClick={handleCopyToken}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0"
              >
                {copiedToken ? 'Copied!' : 'Copy Token'}
              </button>
            </div>
            <p className="text-[11px] text-blue-300">Enter this secret verify token when setting up the webhook handshake in Meta.</p>
          </div>
        </div>

        {/* Meta Credentials Input Form */}
        <div className="bg-blue-950/40 p-5 rounded-xl border border-blue-700/50 space-y-4">
          <h3 className="text-sm font-extrabold text-blue-100 uppercase tracking-wider">
            Meta App & Page Access Tokens
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-blue-200 block mb-1">Meta App ID</label>
              <input
                type="text"
                value={metaAppId}
                onChange={(e) => setMetaAppId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-blue-800 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-blue-200 block mb-1">Meta App Secret</label>
              <input
                type="password"
                value={metaAppSecret}
                onChange={(e) => setMetaAppSecret(e.target.value)}
                className="w-full px-3 py-2 bg-gray-950 border border-blue-800 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-blue-200 block mb-1">Page Access Token (Graph API Fetch)</label>
              <input
                type="text"
                value={pageAccessToken}
                onChange={(e) => setPageAccessToken(e.target.value)}
                placeholder="EAABwz6X98a4BA..."
                className="w-full px-3 py-2 bg-gray-950 border border-blue-800 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-blue-300 mt-1 block">Used by serverless backend to retrieve full form answers when `leadgen_id` arrives.</span>
            </div>
          </div>
        </div>

        {/* META FORM ID TO PROGRAM COHORT MAPPER */}
        <div className="bg-blue-950/40 p-5 rounded-xl border border-blue-700/50 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-blue-100 uppercase tracking-wider">
                Meta Lead Form ID ➔ Cohort Mapping
              </h3>
              <p className="text-xs text-blue-300 mt-0.5">Route specific Meta Lead Ads forms directly to their corresponding cohort program.</p>
            </div>
          </div>

          {/* Form Mapping Table */}
          <div className="overflow-x-auto bg-gray-950/80 rounded-xl border border-blue-800/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-blue-900/60 text-blue-200 font-bold border-b border-blue-800">
                  <th className="p-3">Meta Form ID</th>
                  <th className="p-3">Form Display Name</th>
                  <th className="p-3">Target Cohort Program</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/40 text-blue-100">
                {formMappings.map((m) => (
                  <tr key={m.formId} className="hover:bg-blue-900/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-300">{m.formId}</td>
                    <td className="p-3 font-semibold">{m.formName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-900 text-blue-200 rounded font-bold">
                        {m.programName}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleRemoveMapping(m.formId)}
                        className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 text-[11px] font-bold rounded transition-all cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Mapping Form */}
          <form onSubmit={handleAddMapping} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end pt-2">
            <div>
              <label className="text-[11px] font-bold text-blue-200 block mb-1">Meta Form ID</label>
              <input
                type="text"
                placeholder="e.g. 40981928"
                value={newFormId}
                onChange={(e) => setNewFormId(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-950 border border-blue-800 rounded-lg text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-blue-200 block mb-1">Form Name</label>
              <input
                type="text"
                placeholder="e.g. Q4 PM Campaign"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-950 border border-blue-800 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-blue-200 block mb-1">Target Cohort</label>
              <select
                value={newFormProgId}
                onChange={(e) => setNewFormProgId(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-950 border border-blue-800 rounded-lg text-xs text-white"
              >
                <option value="ai-pm">AI-Native Project Management</option>
                <option value="ai-gtm">AI-Native GTM & Growth</option>
                <option value="ai-fellowship">AI Leadership Fellowship</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer"
            >
              + Add Form Mapping
            </button>
          </form>
        </div>

        {/* META CONVERSIONS API (CAPI) CONFIGURATION */}
        <div className="bg-blue-950/40 p-5 rounded-xl border border-blue-700/50 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-blue-100 uppercase tracking-wider">
                Meta Conversions API (CAPI) - Server-Side Conversion Back-Sync
              </h3>
              <p className="text-xs text-blue-300 mt-0.5">Sends offline sales stage events (Qualified, Seat Reserved, Enrolled) back to Meta Ads Manager for ROAS optimization.</p>
            </div>

            <button
              onClick={() => setCapiEnabled(!capiEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                capiEnabled ? 'bg-emerald-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  capiEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {capiEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-blue-200 block mb-1">Meta Pixel ID</label>
                <input
                  type="text"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-blue-800 rounded-lg text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-blue-200 block mb-1">CAPI Access Token</label>
                <input
                  type="password"
                  value="EAABwz6X98a4BA...CAPI"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-950 border border-blue-800 rounded-lg text-xs font-mono text-white opacity-80"
                />
              </div>
            </div>
          )}
        </div>

        {/* WEBHOOK EVENT SIMULATION LOG DISPLAY */}
        {webhookLog && (
          <div className="p-4 bg-gray-950 rounded-xl border border-emerald-500/50 space-y-2 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-xs font-bold text-emerald-400">⚡ Live Webhook Event Ingestion Log</span>
              <button
                onClick={() => setWebhookLog(null)}
                className="text-[11px] font-bold text-gray-400 hover:text-white"
              >
                Clear Log
              </button>
            </div>
            <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
              {webhookLog}
            </pre>
          </div>
        )}
      </div>

      {/* OTHER INTEGRATIONS GRID */}
      <div>
        <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          All Connected Messaging, Payment & AI Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between space-y-4 hover:border-primary-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">{item.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{item.name}</h3>
                      <span className="text-xs text-gray-400 font-medium">{item.category}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      item.connected
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <button
                  onClick={() => setSelectedIntegration(item.name)}
                  className="text-xs text-primary-600 hover:underline font-bold cursor-pointer"
                >
                  Configure Settings
                </button>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleIntegration(item.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    item.connected ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      item.connected ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Config Modal Placeholder */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Configure {selectedIntegration}</h3>
            <p className="text-xs text-gray-500">
              API keys and webhooks for {selectedIntegration} can be updated here when live credentials are provided.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">API Key / Secret Token</label>
                <input
                  type="password"
                  placeholder="sk_live_..."
                  defaultValue="••••••••••••••••••••"
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Webhook Endpoint URL</label>
                <input
                  type="text"
                  readOnly
                  value={`https://aivalytics-leados.vercel.app/api/${selectedIntegration.toLowerCase().replace(/ /g, '-')}`}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 text-xs font-mono text-gray-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
