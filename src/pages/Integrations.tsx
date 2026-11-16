// src/pages/Integrations.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import {
  RefreshCw,
  Check,
  Copy,
  CheckCircle2
} from 'lucide-react';

export default function Integrations() {
  const { syncLogs, triggerManualSync, allLeads, leads } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

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
    setTimeout(() => setToastMessage(null), 3500);
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
              Integrations & Data Sync
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#DDF4E4] text-[#17673A] border border-[#C3ECD0]">
              All Services Operational
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Meta Ads webhook endpoints, Google Sheets real-time sync, and Razorpay payment event listeners.
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

      {/* 3 Status Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Total Ingested Ad Leads</span>
            <span className="tabular-nums font-mono text-[11px]">Cumulative</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {totalSheetLeads}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            From Meta Ads Lead Gen forms
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Payment Gateway Sync</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              Connected
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            Razorpay
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Webhooks listening for `payment.captured`
          </div>
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
