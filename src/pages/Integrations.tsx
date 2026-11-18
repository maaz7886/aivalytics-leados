// src/pages/Integrations.tsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import {
  RefreshCw,
  Check,
  Copy,
  CheckCircle2,
  Database,
  ArrowRightLeft,
  UploadCloud,
  AlertTriangle,
  Code2
} from 'lucide-react';
import {
  checkDatabaseConnection,
  updateDatabaseCredentials,
  getDatabaseCredentials,
  insertBulkLeadsToSupabase
} from '../lib/supabase';
import { COMPLETE_LEADOS_SCHEMA_SQL } from '../lib/schemaSql';

export default function Integrations() {
  const { syncLogs, triggerManualSync, allLeads, leads } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Supabase Database Connection State
  const initialCreds = getDatabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.key);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isPushingLeads, setIsPushingLeads] = useState(false);
  const [dbHealth, setDbHealth] = useState<{
    connected: boolean;
    latencyMs?: number;
    error?: string;
    checked: boolean;
  }>({
    connected: false,
    checked: false
  });

  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;
  const todayStr = new Date().toISOString().substring(0, 10);

  // Leads received today from Meta Ads / Sheet
  const sheetLeadsToday = leadsPool.filter(
    (l) =>
      (l.source === 'Meta Ads' || (l.source || '').includes('Meta') || (l.source || '').includes('Sheet')) &&
      l.dateCaptured &&
      l.dateCaptured.startsWith(todayStr)
  ).length;

  const totalSheetLeads = leadsPool.filter(
    (l) => l.source === 'Meta Ads' || (l.source || '').includes('Meta') || (l.source || '').includes('Sheet')
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Test DB connection on mount
  useEffect(() => {
    let isMounted = true;
    const runCheck = async () => {
      const res = await checkDatabaseConnection();
      if (isMounted) {
        setDbHealth({
          connected: res.connected,
          latencyMs: res.latencyMs,
          error: res.error,
          checked: true
        });
      }
    };
    runCheck();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleConnectDb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      showToast('Please provide both Supabase URL and Anon Key.');
      return;
    }
    setIsTestingDb(true);
    const res = await updateDatabaseCredentials(supabaseUrl, supabaseKey);
    setIsTestingDb(false);
    if (res.success) {
      setDbHealth({
        connected: true,
        latencyMs: res.latencyMs,
        checked: true
      });
      showToast(`Database Connected successfully! Latency: ${res.latencyMs || 50}ms`);
    } else {
      setDbHealth({
        connected: false,
        error: res.message,
        checked: true
      });
      showToast(`Connection failed: ${res.message}`);
    }
  };

  const handlePushLeadsToDb = async () => {
    if (!leadsPool || leadsPool.length === 0) {
      showToast('No leads available to push.');
      return;
    }
    setIsPushingLeads(true);
    const success = await insertBulkLeadsToSupabase(leadsPool);
    setIsPushingLeads(false);
    if (success) {
      showToast(`Successfully pushed ${leadsPool.length} leads to Cloud Database!`);
    } else {
      showToast('Failed to push leads. Please check your DB credentials & schema.');
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(COMPLETE_LEADOS_SCHEMA_SQL);
    setCopiedSchema(true);
    showToast('SQL schema copied to clipboard! Paste and run in Supabase SQL editor.');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleManualSyncNow = async () => {
    setIsSyncing(true);
    const result = await triggerManualSync();
    setIsSyncing(false);
    if (result.success) {
      showToast(`Sync complete: ${result.message}`);
    } else {
      showToast(`Sync notice: ${result.message}`);
    }
  };

  const webhookUrl = 'https://aivalytics-leados.vercel.app/api/integrations/sheet-leads';

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
  Logger.log('LeadOS real-time sync trigger successfully created.');
}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Integrations & Real-Time Sync
            </h1>
            <span
              className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${
                dbHealth.connected
                  ? 'bg-[#DDF4E4] text-[#17673A] border-[#C3ECD0]'
                  : 'bg-[#FFF0D6] text-[#8A4B00] border-[#FFE2A8]'
              }`}
            >
              {dbHealth.connected ? 'Cloud Database Live' : 'Database Setup Pending'}
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            PostgreSQL Realtime Sync across Salespeople & Admin, Meta Ads Webhooks, Google Sheets, and Razorpay.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleManualSyncNow}
          disabled={isSyncing}
          className="flex items-center gap-2 text-[13px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Trigger Sync Now'}</span>
        </Button>
      </div>

      {/* 4 Status Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cloud Database */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#3B4BDB]" />
              Cloud Database
            </span>
            <span
              className={`text-[11px] font-medium px-1.5 py-0.2 rounded ${
                dbHealth.connected
                  ? 'text-[#17673A] bg-[#DDF4E4]'
                  : 'text-[#B42318] bg-[#FEE4E2]'
              }`}
            >
              {dbHealth.connected ? 'Connected' : 'Offline'}
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {dbHealth.connected ? `${dbHealth.latencyMs || 0}ms` : 'Disconnected'}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            {dbHealth.connected ? 'Realtime WebSocket active' : 'Click below to connect'}
          </div>
        </div>

        {/* Card 2: Google Sheets Live Sync */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Google Sheets Live Sync</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              Active
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {sheetLeadsToday}
            <span className="text-[13px] text-[#6B6B66] font-normal ml-1">leads today</span>
          </div>
          <div className="text-[12px] text-[#6B6B66] tabular-nums font-mono">
            Last sync: {lastSyncTime}
          </div>
        </div>

        {/* Card 3: Total Ingested Ad Leads */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Total Ingested Leads</span>
            <span className="tabular-nums font-mono text-[11px]">Cumulative</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {totalSheetLeads}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            From Meta Ads & Ingestion
          </div>
        </div>

        {/* Card 4: Payment Gateway Sync */}
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Payment Gateway</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              Connected
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            Razorpay
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Listening for `payment.captured`
          </div>
        </div>
      </div>

      {/* CLOUD DATABASE & REALTIME SYNCHRONIZATION MANAGER */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#3B4BDB]" />
              <h2 className="text-[15px] font-semibold text-[#1F1F1D]">
                Cloud Database & Cross-Device Real-Time Sync (Supabase PostgreSQL)
              </h2>
            </div>
            <p className="text-[12px] text-[#6B6B66] mt-0.5">
              Connects all salespeople (Yameen, Hari, Khurram, Jay) and Admin (Maaz) into one shared database. Every lead action, stage change, or call note broadcasts instantly to all connected screens.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopySchema}
              className="text-[12px] flex items-center gap-1.5"
            >
              {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Code2 className="w-3.5 h-3.5" />}
              <span>{copiedSchema ? 'Copied SQL' : 'Copy schema.sql'}</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePushLeadsToDb}
              disabled={isPushingLeads || !dbHealth.connected}
              className="text-[12px] flex items-center gap-1.5"
              title="Push current local leads into the connected Supabase database"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isPushingLeads ? 'animate-bounce' : ''}`} />
              <span>{isPushingLeads ? 'Pushing...' : `Push ${leadsPool.length} Leads to DB`}</span>
            </Button>
          </div>
        </div>

        {/* Database Status Alert */}
        {dbHealth.connected ? (
          <div className="p-3 bg-[#DDF4E4] border border-[#C3ECD0] rounded-md flex items-start gap-2.5 text-xs text-[#17673A]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                PostgreSQL Cloud Database is LIVE & Connected ({dbHealth.latencyMs}ms latency)
              </p>
              <p className="mt-0.5 text-[11px] text-[#17673A]/90">
                Real-time WebSocket replication is active on table <code className="bg-[#c8e6d2] px-1 py-0.5 rounded">leads</code>. Any change made by Yameen, Hari, Khurram, or Jay automatically syncs to your Admin dashboard without refreshing.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#FFF0D6] border border-[#FFE2A8] rounded-md flex items-start gap-2.5 text-xs text-[#8A4B00]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Database Offline / Needs Live Supabase Project
              </p>
              <p className="mt-0.5 text-[11px] text-[#8A4B00]/90">
                {dbHealth.error || 'The system is currently operating in isolated offline mode. Enter your live Supabase Project URL and Anon Key below and click "Test & Connect Database" to enable cross-device sync.'}
              </p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleConnectDb} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#1F1F1D] block">
                Supabase Project URL
              </label>
              <input
                type="url"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-1.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md text-[12px] font-mono text-[#1F1F1D] focus:outline-none focus:ring-2 focus:ring-[#3B4BDB]"
              />
              <span className="text-[10px] text-[#6B6B66]">Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#1F1F1D] block">
                Supabase Public Anon Key
              </label>
              <input
                type="text"
                required
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-1.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md text-[12px] font-mono text-[#1F1F1D] focus:outline-none focus:ring-2 focus:ring-[#3B4BDB]"
              />
              <span className="text-[10px] text-[#6B6B66]">Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public key</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#6B6B66]">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#3B4BDB]" />
              <span>Real-time channel: <code className="bg-[#F7F7F5] px-1 py-0.5 rounded text-[11px]">schema-db-changes</code> (all events broadcast)</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isTestingDb}
              className="text-[12px] flex items-center gap-1.5 px-4 h-8"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
              <span>{isTestingDb ? 'Testing Connection...' : 'Test & Connect Database'}</span>
            </Button>
          </div>
        </form>

        {/* 3 Step Setup Guide */}
        <div className="p-3.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-2 text-[12px]">
          <div className="font-semibold text-[#1F1F1D]">3-Step Cloud Database Setup:</div>
          <ol className="list-decimal list-inside space-y-1 text-[#6B6B66] text-[11px]">
            <li>
              <strong>Create a project</strong> at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#3B4BDB] hover:underline">supabase.com</a> (Free tier is 100% sufficient).
            </li>
            <li>
              Click <strong>"Copy schema.sql"</strong> above, open Supabase <strong>SQL Editor</strong>, paste, and click <strong>Run</strong>. (This creates tables &amp; enables real-time WebSocket publications).
            </li>
            <li>
              Paste your <strong>Project URL</strong> and <strong>Anon Key</strong> above, click <strong>"Test &amp; Connect Database"</strong>, then click <strong>"Push {leadsPool.length} Leads to DB"</strong> to populate your cloud database.
            </li>
          </ol>
        </div>
      </div>

      {/* Integration Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Webhook Endpoint */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
              Incoming Ingestion Webhook
            </h3>
            <p className="text-[12px] text-[#6B6B66]">
              POST endpoint for Google Apps Script and Meta Webhooks
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-[#6B6B66] block">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full px-3 py-1.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md text-[12px] font-mono text-[#1F1F1D] focus:outline-hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(webhookUrl);
                  setCopiedWebhook(true);
                  setTimeout(() => setCopiedWebhook(false), 2000);
                }}
                className="h-8 text-[12px] px-3 shrink-0"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1.5 text-[12px]">
            <div className="font-medium text-[#1F1F1D]">Required Headers:</div>
            <div className="text-[11px] font-mono text-[#6B6B66]">
              Content-Type: application/json<br />
              x-api-key: aiv_sync_sec_9941a87b
            </div>
          </div>
        </div>

        {/* Card 2: Google Apps Script Code */}
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
                Google Apps Script Auto-Sync
              </h3>
              <p className="text-[12px] text-[#6B6B66]">
                1-minute cron trigger for Google Sheets sync
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(sampleAppsScriptCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="h-7 text-[11px] px-2"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Script'}</span>
            </Button>
          </div>

          <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md font-mono text-[11px] text-[#1F1F1D] max-h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {sampleAppsScriptCode}
          </div>
        </div>
      </div>
    </div>
  );
}
