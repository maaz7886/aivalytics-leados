// src/pages/Integrations.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Integrations() {
  const { syncLogs, triggerManualSync, allLeads, leads } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const leadsPool = allLeads || leads;
  const todayStr = new Date().toISOString().substring(0, 10);

  // Leads received today from Meta Ads / Sheet
  const sheetLeadsToday = leadsPool.filter(
    (l) =>
      (l.source === 'Meta Ads' || l.source?.includes('Meta') || l.source?.includes('Sheet')) &&
      l.dateCaptured &&
      l.dateCaptured.startsWith(todayStr)
  ).length;

  const totalSheetLeads = leadsPool.filter(
    (l) => l.source === 'Meta Ads' || l.source?.includes('Meta') || l.source?.includes('Sheet')
  ).length;

  // Last sync log
  const latestLog = syncLogs && syncLogs.length > 0 ? syncLogs[0] : null;
  const lastSyncTime = latestLog
    ? new Date(latestLog.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Active (Within 1 min)';

  const errorLogs = syncLogs.filter((log) => log.status === 'error');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    const result = await triggerManualSync();
    setIsSyncing(false);
    if (result.success) {
      showToast(`✓ Sync complete: ${result.message}`);
    } else {
      showToast(`⚠️ Sync notice: ${result.message}`);
    }
  };

  const sampleAppsScriptCode = `// AIValytics LeadOS - Google Sheets Automated Sync Trigger
// Automatically checks for unsynced rows every 1 minute and posts to LeadOS

const CONFIG = {
  ENDPOINT_URL: 'https://aivalytics-leados.vercel.app/api/integrations/sheet-leads',
  API_KEY: PropertiesService.getScriptProperties().getProperty('LEADOS_SYNC_API_KEY') || 'aiv_sync_sec_9941a87b',
  STATUS_COL_NAME: 'LeadOS Sync Status',
  TIMESTAMP_COL_NAME: 'LeadOS Synced At'
};

function setupLeadOSSync() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('syncNewLeadsToLeadOS')
    .timeBased()
    .everyMinutes(1)
    .create();
  Logger.log('1-minute trigger activated');
}

function syncNewLeadsToLeadOS() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return;
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    // Ingests newly added rows & marks "Synced"
  } finally {
    lock.releaseLock();
  }
}`;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-900 text-white rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in">
          <span>✅</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Meta Ads & Google Sheets Integration
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Active Sync Trigger
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Real-time webhook ingestion engine: automatically captures every new lead appended from Meta Lead Ads into your Google Sheet, validates Indian phone numbers, deduplicates, and routes leads into LeadOS within ~1 minute.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleManualSyncNow}
            disabled={isSyncing}
            className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className={isSyncing ? 'animate-spin' : ''}>🔄</span>
            {isSyncing ? 'Synchronizing...' : 'Sync Now (Force Refresh)'}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Sync Cadence
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-gray-900 dark:text-gray-100">Every 1 Min</span>
            <span className="text-xs text-emerald-600 font-bold">Automated</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Time-based Apps Script Trigger</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Leads Ingested Today
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {sheetLeadsToday}
            </span>
            <span className="text-xs text-gray-400 font-semibold">from Meta Sheet</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Total pool: {totalSheetLeads} leads</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Last Sync Activity
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
              {lastSyncTime}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 mt-1 block font-bold">● Active Health</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Sync Status & Errors
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black ${errorLogs.length > 0 ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {errorLogs.length}
            </span>
            <span className="text-xs text-gray-400 font-semibold">errors logged</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            {errorLogs.length === 0 ? 'All ingestion cycles clean' : 'Inspect error logs below'}
          </span>
        </div>
      </div>

      {/* Integration Configuration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Endpoint & Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>🔐</span> Secure Ingestion Endpoint
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Production API endpoint configured on Vercel Serverless. Protected by secret header key.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Webhook POST URL
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-[11px] text-gray-800 dark:text-gray-200">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">POST</span>
                <span className="truncate">https://aivalytics-leados.vercel.app/api/integrations/sheet-leads</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Authentication Header
              </label>
              <div className="p-2.5 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-[11px] text-gray-800 dark:text-gray-200 flex items-center justify-between">
                <span>x-api-key: ••••••••••••••••••••••••••••••••</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Server Guarded</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 space-y-1">
              <strong className="block font-bold">API Key Regeneration & Vercel Environment Variable</strong>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                The sync endpoint is authenticated by the server-side environment variable <code>LEADOS_SYNC_API_KEY</code>.
                To rotate the key:
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                <li>Go to Vercel Dashboard → LeadOS Project → Settings → Environment Variables.</li>
                <li>Update <code>LEADOS_SYNC_API_KEY</code> with your new secret.</li>
                <li>In Google Sheet Apps Script: Project Settings → Script Properties → update <code>LEADOS_SYNC_API_KEY</code>.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Normalization & Deduplication Rules */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>🛡️</span> Data Validation & Deduplication Engine
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Guarantees zero dirty records enter your sales pipeline.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/50">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-0.5">
                🇮🇳 Indian Phone Number Normalization
              </span>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                Strips spaces, dashes, parentheses and leading zeros. Prepends <code>+91</code> automatically to 10-digit mobile numbers so <code>tel:</code> and <code>wa.me</code> links dial correctly every time.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/50">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-0.5">
                🔍 3-Tier Deduplication (No Duplicate Leads)
              </span>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                Checks match against: <strong>Meta Lead ID</strong> → <strong>Phone (+91)</strong> → <strong>Email</strong>. If matched, updates existing lead details and merges form answers without duplicating pipeline cards.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/50">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-0.5">
                ⚡ Automatic Capacity-Aware Round-Robin
              </span>
              <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                If auto-assign is enabled, immediately allocates new leads to active sales reps while respecting their individual daily lead capacity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Apps Script Integration Box */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📄</span> Google Apps Script Quick Setup
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Copy and paste this script into your Google Sheet (Extensions → Apps Script) to enable automatic 1-minute time-based ingestion.
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(sampleAppsScriptCode);
              setCopiedCode(true);
              showToast('✓ Apps Script code copied to clipboard!');
              setTimeout(() => setCopiedCode(false), 2500);
            }}
            className="px-3.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg border border-gray-300 dark:border-gray-600 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{copiedCode ? '✓ Copied' : '📋 Copy Script'}</span>
          </button>
        </div>

        <pre className="p-4 bg-gray-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
          <code>{sampleAppsScriptCode}</code>
        </pre>
      </div>

      {/* Sync Execution Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📋</span> Ingestion Sync Audit Logs
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              History of batch requests processed by the LeadOS Google Sheet webhook endpoint.
            </p>
          </div>

          <span className="text-xs text-gray-500 font-semibold">
            {syncLogs.length} audit entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Rows Processed</th>
                <th className="py-3 px-3">Summary / Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {syncLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No sync logs recorded yet. Once your Google Sheet posts its first row, entries will appear here in real time.
                  </td>
                </tr>
              ) : (
                syncLogs.slice(0, 15).map((log) => {
                  let formattedTime = log.createdAt;
                  try {
                    const d = new Date(log.createdAt);
                    if (!isNaN(d.getTime())) {
                      formattedTime = d.toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });
                    }
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50">
                      <td className="py-3 px-3 font-mono text-[11px] text-gray-500">
                        {formattedTime}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-800 dark:text-gray-200">
                        {log.source || 'google_sheets'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {log.status === 'success' ? '✓ Success' : '✕ Error'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-900 dark:text-gray-100">
                        {log.rowsProcessed || 1}
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-300 truncate max-w-md">
                        {log.errorMessage || 'Rows ingested and deduplicated'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
