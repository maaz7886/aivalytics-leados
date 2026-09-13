// src/pages/Integrations.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Integrations() {
  const { integrations, toggleIntegration } = useApp();
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API & Tool Integrations</h1>
          <p className="text-sm text-gray-500">Connect lead sources, AI models, automation engines, messaging APIs, and payment gateways.</p>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary-300 transition-all"
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
                className="text-xs text-primary-600 hover:underline font-bold"
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

      {/* Config Modal Placeholder */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Configure {selectedIntegration}</h3>
            <p className="text-xs text-gray-500">
              API keys and webhooks for {selectedIntegration} can be updated here when live credentials are provided.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">API Key / Token</label>
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
                  value={`https://api.aivalytics.io/v1/webhooks/${selectedIntegration.toLowerCase().replace(/ /g, '-')}`}
                  className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 text-xs font-mono text-gray-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIntegration(null)}
                className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg shadow"
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
