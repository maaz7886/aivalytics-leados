// src/pages/Programs.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CORE_OFFERINGS,
  WORKSHOP_DIRECT_SALE_SCRIPT,
  WEBINAR_INVITATION_SCRIPT,
  getWorkshopDirectSaleWhatsApp,
  getWebinarInviteWhatsApp,
  getMentorMeetingWithMaazWhatsApp,
  getAiPmFallbackToBuilderWhatsApp
} from '../utils/offeringTemplates';
import { Button } from '../components/ui/Button';
import {
  BookOpen,
  Copy,
  Check,
  Phone,
  Zap
} from 'lucide-react';

export default function Programs() {
  const { allLeads, leads } = useApp();
  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;

  const [activeTab, setActiveTab] = useState<'ai-builder' | 'ai-pm' | 'scripts'>('ai-builder');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const workshopDef = CORE_OFFERINGS['workshop-3day'];
  const aiPmDef = CORE_OFFERINGS['ai-pm'];

  const workshopFullScript = `HOOK:\n${WORKSHOP_DIRECT_SALE_SCRIPT.hook}\n\nPITCH:\n${WORKSHOP_DIRECT_SALE_SCRIPT.valuePitch}\n\nCLOSE:\n${WORKSHOP_DIRECT_SALE_SCRIPT.inCallClose}\n\nOBJECTION (TIME):\n${WORKSHOP_DIRECT_SALE_SCRIPT.objectionNoTime}\n\nOBJECTION (BUDGET):\n${WORKSHOP_DIRECT_SALE_SCRIPT.objectionBudget}`;

  const webinarFullScript = `TRANSITION:\n${WEBINAR_INVITATION_SCRIPT.transition}\n\nPITCH:\n${WEBINAR_INVITATION_SCRIPT.pitch}\n\nCLOSE:\n${WEBINAR_INVITATION_SCRIPT.close}`;

  const workshopLeads = leadsPool.filter(
    (l) =>
      l.programId === 'ai-builder' ||
      l.programId === 'workshop-3day' ||
      (l.programName || '').toLowerCase().includes('builder') ||
      (l.programName || '').toLowerCase().includes('workshop')
  );

  const aiPmLeads = leadsPool.filter(
    (l) =>
      l.programId === 'ai-pm' ||
      (l.programName || '').toLowerCase().includes('pm') ||
      (l.programName || '').toLowerCase().includes('project')
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Programs & Enablement Scripts
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66]">
              2 Core Offerings
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Official admissions curriculum, pitch tracks, objection handling scripts, and WhatsApp dispatch templates.
          </p>
        </div>
      </div>

      {/* Program Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: AI Native Builder */}
        <button
          type="button"
          onClick={() => setActiveTab('ai-builder')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            activeTab === 'ai-builder'
              ? 'bg-[#EEF0FD] border-[#3B4BDB]'
              : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#DDF4E4] text-[#17673A]">
              Weekend Sprint
            </span>
            <span className="text-[14px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
              ₹{workshopDef.price.toLocaleString('en-IN')}
            </span>
          </div>
          <h3 className="font-semibold text-[14px] text-[#1F1F1D] mt-2">
            1. AI Native Builder Program
          </h3>
          <p className="text-[12px] text-[#6B6B66] mt-1 line-clamp-2">
            Weekend intensive hands-on sprint. Build practical autonomous agents with live guidance.
          </p>
          <div className="mt-3 pt-2 border-t border-[#E6E6E3] flex justify-between text-[11px] text-[#6B6B66]">
            <span>Active Pipeline:</span>
            <strong className="text-[#1F1F1D] tabular-nums font-mono font-semibold">
              {workshopLeads.length} leads
            </strong>
          </div>
        </button>

        {/* Card 2: AI Native PM */}
        <button
          type="button"
          onClick={() => setActiveTab('ai-pm')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            activeTab === 'ai-pm'
              ? 'bg-[#EEF0FD] border-[#3B4BDB]'
              : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#E3EBFF] text-[#1E3FA8]">
              Flagship Cohort
            </span>
            <span className="text-[14px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
              ₹{aiPmDef.price.toLocaleString('en-IN')}
            </span>
          </div>
          <h3 className="font-semibold text-[14px] text-[#1F1F1D] mt-2">
            2. AI Native Project Management
          </h3>
          <p className="text-[12px] text-[#6B6B66] mt-1 line-clamp-2">
            Comprehensive multi-agent career transformation with No-Cost EMI from ₹8,333/month.
          </p>
          <div className="mt-3 pt-2 border-t border-[#E6E6E3] flex justify-between text-[11px] text-[#6B6B66]">
            <span>Active Pipeline:</span>
            <strong className="text-[#1F1F1D] tabular-nums font-mono font-semibold">
              {aiPmLeads.length} leads
            </strong>
          </div>
        </button>

        {/* Card 3: Pitch & WhatsApp Templates */}
        <button
          type="button"
          onClick={() => setActiveTab('scripts')}
          className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
            activeTab === 'scripts'
              ? 'bg-[#EEF0FD] border-[#3B4BDB]'
              : 'bg-white border-[#E6E6E3] hover:border-[#3B4BDB]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66]">
              Enablement Library
            </span>
            <span className="text-[12px] text-[#3B4BDB] font-medium">1-Click Dispatch</span>
          </div>
          <h3 className="font-semibold text-[14px] text-[#1F1F1D] mt-2">
            3. WhatsApp & Call Scripts
          </h3>
          <p className="text-[12px] text-[#6B6B66] mt-1 line-clamp-2">
            Objection handling, mentor session invites, webinar replays, and downsell scripts.
          </p>
          <div className="mt-3 pt-2 border-t border-[#E6E6E3] flex justify-between text-[11px] text-[#6B6B66]">
            <span>Templates Available:</span>
            <strong className="text-[#1F1F1D] font-semibold">6 Official Scripts</strong>
          </div>
        </button>
      </div>

      {/* TAB 1: AI BUILDER WORKSHOP */}
      {activeTab === 'ai-builder' && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1F1F1D]">
                AI Native Builder Program (₹{workshopDef.price.toLocaleString('en-IN')})
              </h2>
              <p className="text-[12px] text-[#6B6B66]">
                Weekend intensive hands-on sprint · Fri Evening (7-10 PM), Sat Full Day (10-6 PM), Sun Full Day (10-6 PM)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium px-2.5 py-1 rounded-md bg-[#DDF4E4] text-[#17673A] border border-[#C3ECD0]">
                Commission: ₹500 / enrollment
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: What Students Build */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-semibold text-[#1F1F1D] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3B4BDB]" />
                <span>Hands-on Deliverables</span>
              </h3>
              <div className="space-y-2 text-[12px] text-[#1F1F1D]">
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1">
                  <div className="font-medium text-[#1F1F1D]">Day 1: Autonomous AI Researcher Agent</div>
                  <p className="text-[#6B6B66] text-[11px]">Build a web-crawling agent that extracts competitive intelligence and summarizes key insights.</p>
                </div>
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1">
                  <div className="font-medium text-[#1F1F1D]">Day 2: Full-Stack Multi-Agent System</div>
                  <p className="text-[#6B6B66] text-[11px]">Connect agents with tool calling, memory state, and automated reasoning pipelines.</p>
                </div>
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1">
                  <div className="font-medium text-[#1F1F1D]">Day 3: Production Deployment & Showcase</div>
                  <p className="text-[#6B6B66] text-[11px]">Deploy on cloud endpoints with authentication and real-time dashboard UI.</p>
                </div>
              </div>
            </div>

            {/* Right: Direct Pitch Script */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#1F1F1D] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#3B4BDB]" />
                  <span>Direct Sale Phone Script</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(workshopFullScript, 'workshop_script')}
                  className="h-7 text-[11px] gap-1"
                >
                  {copiedLabel === 'workshop_script' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLabel === 'workshop_script' ? 'Copied' : 'Copy Script'}</span>
                </Button>
              </div>
              <div className="p-3.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md font-mono text-[11px] leading-relaxed text-[#1F1F1D] max-h-56 overflow-y-auto whitespace-pre-wrap">
                {workshopFullScript}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI NATIVE PM FLAGSHIP */}
      {activeTab === 'ai-pm' && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1F1F1D]">
                AI-Native Project Management Program (₹{aiPmDef.price.toLocaleString('en-IN')})
              </h2>
              <p className="text-[12px] text-[#6B6B66]">
                Comprehensive 10-week career transformation · 1-on-1 mentor guidance · No-Cost EMI from ₹8,333/mo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium px-2.5 py-1 rounded-md bg-[#DDF4E4] text-[#17673A] border border-[#C3ECD0]">
                Commission: ₹5,000 / enrollment (10%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: 4-Attempt Sales Motion */}
            <div className="space-y-3">
              <h3 className="text-[13px] font-semibold text-[#1F1F1D] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#3B4BDB]" />
                <span>Official 4-Attempt Sales Track</span>
              </h3>
              <div className="space-y-2 text-[12px]">
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1">
                  <div className="font-semibold text-[#1F1F1D]">Attempt 1: Sell on the Call (₹49,999)</div>
                  <p className="text-[#6B6B66] text-[11px]">Position salary uplift and offer 3-month or 6-month No-Cost EMI from ₹8,333/month.</p>
                </div>
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1">
                  <div className="font-semibold text-[#1F1F1D]">Attempt 2: 1-on-1 Mentor Session with Maaz</div>
                  <p className="text-[#6B6B66] text-[11px]">Book a 15-minute diagnostic call with Maaz to resolve curriculum and career trajectory questions.</p>
                </div>
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1">
                  <div className="font-semibold text-[#1F1F1D]">Attempt 3: 90-min Zoom Masterclass Pass</div>
                  <p className="text-[#6B6B66] text-[11px]">Invite candidate to the upcoming live Saturday demo masterclass to observe live agent building.</p>
                </div>
                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md space-y-1">
                  <div className="font-semibold text-[#1F1F1D]">Attempt 4: Downsell to AI Builder (₹6,999)</div>
                  <p className="text-[#6B6B66] text-[11px]">100% of the ₹6,999 paid is credited toward AI-PM if they upgrade within 30 days.</p>
                </div>
              </div>
            </div>

            {/* Right: Pitch Script & Objection Handling */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#1F1F1D] flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#3B4BDB]" />
                  <span>Webinar & Discovery Pitch Script</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(webinarFullScript, 'aipm_script')}
                  className="h-7 text-[11px] gap-1"
                >
                  {copiedLabel === 'aipm_script' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLabel === 'aipm_script' ? 'Copied' : 'Copy Script'}</span>
                </Button>
              </div>
              <div className="p-3.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md font-mono text-[11px] leading-relaxed text-[#1F1F1D] max-h-56 overflow-y-auto whitespace-pre-wrap">
                {webinarFullScript}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHATSAPP TEMPLATES LIBRARY */}
      {activeTab === 'scripts' && (
        <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
          <div className="border-b border-[#E6E6E3] pb-3">
            <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
              Official WhatsApp Outreach & Nurture Templates
            </h3>
            <p className="text-[12px] text-[#6B6B66]">
              Copy and dispatch directly to prospective students via WhatsApp Web
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template 1 */}
            <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#1F1F1D]">
                  1. AI Builder Direct Sale Pitch
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      getWorkshopDirectSaleWhatsApp('Candidate', 'Admissions'),
                      'wa_builder'
                    )
                  }
                  className="h-6 text-[11px] px-2"
                >
                  {copiedLabel === 'wa_builder' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] font-mono text-[#6B6B66] bg-white p-2.5 rounded border border-[#E6E6E3] whitespace-pre-wrap">
                {getWorkshopDirectSaleWhatsApp('Candidate', 'Admissions')}
              </p>
            </div>

            {/* Template 2 */}
            <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#1F1F1D]">
                  2. 1-on-1 Mentor Meeting with Maaz
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      getMentorMeetingWithMaazWhatsApp('Candidate', 'Admissions'),
                      'wa_maaz'
                    )
                  }
                  className="h-6 text-[11px] px-2"
                >
                  {copiedLabel === 'wa_maaz' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] font-mono text-[#6B6B66] bg-white p-2.5 rounded border border-[#E6E6E3] whitespace-pre-wrap">
                {getMentorMeetingWithMaazWhatsApp('Candidate', 'Admissions')}
              </p>
            </div>

            {/* Template 3 */}
            <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#1F1F1D]">
                  3. 90-min Live Webinar Masterclass Pass
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      getWebinarInviteWhatsApp('Candidate', 'Admissions'),
                      'wa_webinar'
                    )
                  }
                  className="h-6 text-[11px] px-2"
                >
                  {copiedLabel === 'wa_webinar' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] font-mono text-[#6B6B66] bg-white p-2.5 rounded border border-[#E6E6E3] whitespace-pre-wrap">
                {getWebinarInviteWhatsApp('Candidate', 'Admissions')}
              </p>
            </div>

            {/* Template 4 */}
            <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[#1F1F1D]">
                  4. Downsell to AI Builder with 100% Credit
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      getAiPmFallbackToBuilderWhatsApp('Candidate'),
                      'wa_downsell'
                    )
                  }
                  className="h-6 text-[11px] px-2"
                >
                  {copiedLabel === 'wa_downsell' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] font-mono text-[#6B6B66] bg-white p-2.5 rounded border border-[#E6E6E3] whitespace-pre-wrap">
                {getAiPmFallbackToBuilderWhatsApp('Candidate')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
