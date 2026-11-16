// src/pages/RepActivity.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SidePanel } from '../components/ui/SidePanel';
import { LeadPanel } from '../components/LeadPanel';
import { Button } from '../components/ui/Button';
import { formatRelativeTime } from '../utils/tableFormatters';
import {
  PhoneCall,
  Search
} from 'lucide-react';

export default function RepActivity() {
  const { salespeople, allLeads, leads, callActivities } = useApp();
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'all'>('today');
  const [selectedRepFilter, setSelectedRepFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Side Panel state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);

  // Filter activities based on timeframe
  const filteredActivities = callActivities.filter((c) => {
    if (selectedRepFilter !== 'all' && c.salesperson !== selectedRepFilter) return false;
    if (timeRange === 'today') return c.timestamp.startsWith(todayStr);
    if (timeRange === 'week') return new Date(c.timestamp) >= oneWeekAgo;
    return true;
  });

  // Calculate team-wide totals for top cards
  const totalCalls = filteredActivities.length;
  const connectedCalls = filteredActivities.filter((c) =>
    ['Connected', 'Interested', 'Qualified', 'Details Sent on WhatsApp'].some((val) =>
      c.outcome.toLowerCase().includes(val.toLowerCase())
    )
  ).length;
  const connectRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

  const totalEnrolled = leadsPool.filter(
    (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid'
  ).length;

  // Stats per rep
  const repStats = salespeople.map((rep) => {
    const repLeads = leadsPool.filter((l) => l.assignedSalesperson === rep.name);
    const repActivities = filteredActivities.filter((c) => c.salesperson === rep.name);
    const callsMade = repActivities.length;

    const connected = repActivities.filter((c) =>
      ['Connected', 'Interested', 'Qualified', 'Details Sent on WhatsApp'].some((val) =>
        c.outcome.toLowerCase().includes(val.toLowerCase())
      )
    ).length;

    const repConnectRate = callsMade > 0 ? Math.round((connected / callsMade) * 100) : 0;

    const overdueFollowUps = repLeads.filter((l) => {
      if (['Not Interested', 'Unqualified', 'Converted', 'Lost'].includes(l.crmStage)) return false;
      const isOverdue =
        (l.nextFollowUp && l.nextFollowUp.substring(0, 10) < todayStr) ||
        (l.nextTask &&
          !l.nextTask.completionStatus?.toLowerCase().includes('complete') &&
          l.nextTask.dueDateTime?.substring(0, 10) < todayStr);
      return Boolean(isOverdue);
    }).length;

    const converted = repLeads.filter(
      (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid'
    ).length;

    const target = rep.dailyCallTarget || 30;
    const quotaPct = Math.min(100, Math.round((callsMade / target) * 100));

    return {
      rep,
      callsMade,
      target,
      quotaPct,
      connected,
      repConnectRate,
      overdueFollowUps,
      converted,
      totalAssigned: repLeads.length
    };
  });

  // Filtered live feed
  const feedActivities = filteredActivities.filter((act) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const repName = (act.salesperson || '').toLowerCase();
    return (
      act.leadName.toLowerCase().includes(q) ||
      (act.leadPhone || '').includes(q) ||
      repName.includes(q) ||
      (act.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Rep Activity & Outreach
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66]">
              Live Activity Audit
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Detailed call logs, conversion pacing, follow-up SLA adherence, and rep outreach stream.
          </p>
        </div>

        {/* Timeframe Segmented Control */}
        <div className="flex items-center bg-[#F7F7F5] border border-[#E6E6E3] rounded-md p-0.5 text-[12px]">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'all', label: 'All Time' }
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1 rounded-[4px] font-medium transition-colors cursor-pointer ${
                timeRange === t.id
                  ? 'bg-white text-[#1F1F1D] shadow-2xs'
                  : 'text-[#6B6B66] hover:text-[#1F1F1D]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Total Calls Logged</span>
            <span className="tabular-nums font-mono text-[11px]">Outbound</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {totalCalls}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Across all sales representatives
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Connected Calls</span>
            <span className="tabular-nums font-mono text-[11px]">{connectRate}% rate</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {connectedCalls}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Conversations discussed with candidates
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Paid Admissions</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              Enrolled
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {totalEnrolled}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            AI Builder & AI-PM cohorts
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Active Representatives</span>
            <span className="tabular-nums font-mono text-[11px]">Roster</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {salespeople.filter((s) => s.status === 'Active').length}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Dialing and qualifying daily leads
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
              Representative Performance Table
            </h3>
            <p className="text-[12px] text-[#6B6B66]">
              Quota pacing, conversation rate, and SLA adherence
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                <th className="py-2.5 px-3">Salesperson</th>
                <th className="py-2.5 px-3">Calls / Target</th>
                <th className="py-2.5 px-3">Connects</th>
                <th className="py-2.5 px-3">Connect Rate</th>
                <th className="py-2.5 px-3">Overdue SLA</th>
                <th className="py-2.5 px-3">Enrolled</th>
                <th className="py-2.5 px-3 text-right">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E3]">
              {repStats.map((item) => (
                <tr key={item.rep.id} className="hover:bg-[#F3F4F6] transition-colors h-11">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold text-[12px] flex items-center justify-center shrink-0">
                        {item.rep.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-medium text-[#1F1F1D]">{item.rep.name}</div>
                        <div className="text-[11px] text-[#6B6B66]">{item.rep.title}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[12px] tabular-nums font-mono">
                        <span className="font-semibold text-[#1F1F1D]">{item.callsMade}</span>
                        <span className="text-[#6B6B66]">/ {item.target}</span>
                        <span className="text-[11px] text-[#3B4BDB] font-medium">({item.quotaPct}%)</span>
                      </div>
                      <div className="w-32 bg-[#F7F7F5] rounded-full h-1 overflow-hidden border border-[#E6E6E3]">
                        <div
                          className="bg-[#3B4BDB] h-full rounded-full"
                          style={{ width: `${item.quotaPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[12px] text-[#1F1F1D]">
                    {item.connected}
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[12px] font-medium text-[#1F1F1D]">
                    {item.repConnectRate}%
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[12px]">
                    {item.overdueFollowUps > 0 ? (
                      <span className="text-[#B42318] font-semibold">
                        {item.overdueFollowUps} overdue
                      </span>
                    ) : (
                      <span className="text-[#17673A] font-medium">0</span>
                    )}
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[12px] font-semibold text-[#17673A]">
                    {item.converted}
                  </td>

                  <td className="py-2 px-3 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/workspace/${item.rep.id}`)}
                      className="h-7 text-[12px] px-2.5"
                    >
                      Workspace
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Outreach Activity Stream */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E6E3] pb-3">
          <div>
            <h3 className="text-[14px] font-semibold text-[#1F1F1D] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#3B4BDB]" />
              <span>Live Outreach Call Activity Stream</span>
            </h3>
            <p className="text-[12px] text-[#6B6B66]">
              Real-time audit log of dials, outcomes, and discussion notes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRepFilter}
              onChange={(e) => setSelectedRepFilter(e.target.value)}
              className="px-2.5 py-1 bg-white border border-[#E6E6E3] rounded-md text-[12px] text-[#1F1F1D]"
            >
              <option value="all">All Representatives</option>
              {salespeople.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-[#6B6B66] absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md text-[12px] text-[#1F1F1D] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {feedActivities.length === 0 ? (
            <div className="p-8 text-center text-[#6B6B66] text-[12px]">
              No call activities logged for this selection.
            </div>
          ) : (
            feedActivities.map((act) => {
              const targetLead = leadsPool.find((l) => l.id === act.leadId);
              return (
                <div
                  key={act.id}
                  className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#3B4BDB] flex items-center justify-center shrink-0 text-[12px] font-semibold">
                      {(act.salesperson || 'Rep')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (targetLead) {
                              setSelectedLeadId(targetLead.id);
                              setIsSidePanelOpen(true);
                            }
                          }}
                          className="font-medium text-[13px] text-[#1F1F1D] hover:text-[#3B4BDB] text-left cursor-pointer"
                        >
                          {act.leadName}
                        </button>
                        <span className="px-2 py-0.2 rounded-full text-[11px] font-medium bg-white border border-[#E6E6E3] text-[#1F1F1D]">
                          {act.outcome}
                        </span>
                        <span className="text-[11px] text-[#6B6B66]">
                          by {act.salesperson}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6B6B66] mt-0.5">{act.notes}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-[11px] text-[#6B6B66] tabular-nums font-mono">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                    {targetLead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLeadId(targetLead.id);
                          setIsSidePanelOpen(true);
                        }}
                        className="h-7 text-[12px] px-2 text-[#3B4BDB]"
                      >
                        Details
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Slide-over Side Panel (480px) */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => {
          setIsSidePanelOpen(false);
          setSelectedLeadId(null);
        }}
      >
        <LeadPanel
          leadId={selectedLeadId}
          onClose={() => {
            setIsSidePanelOpen(false);
            setSelectedLeadId(null);
          }}
        />
      </SidePanel>
    </div>
  );
}
