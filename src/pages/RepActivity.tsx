// src/pages/RepActivity.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function RepActivity() {
  const { salespeople, allLeads, leads, callActivities } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'all'>('today');

  const leadsPool = allLeads || leads;
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);

  // One week ago timestamp
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);

  // Filter activities based on selected range
  const filteredActivities = callActivities.filter((c) => {
    if (timeRange === 'today') return c.timestamp.startsWith(todayStr);
    if (timeRange === 'week') return new Date(c.timestamp) >= oneWeekAgo;
    return true;
  });

  // Calculate stats per rep
  const repMetrics = salespeople.map((rep) => {
    const repLeads = leadsPool.filter((l) => l.assignedSalesperson === rep.name);

    // Filter leads assigned in the timeframe
    const repLeadsAssignedInRange = repLeads.filter((l) => {
      if (!l.assignedAt) return false;
      if (timeRange === 'today') return l.assignedAt.startsWith(todayStr);
      if (timeRange === 'week') return new Date(l.assignedAt) >= oneWeekAgo;
      return true;
    });

    const repActivities = filteredActivities.filter((c) => c.salesperson === rep.name);
    const callsMade = repActivities.length;

    const connectedCalls = repActivities.filter(
      (c) =>
        c.outcome === 'Connected' ||
        c.outcome === 'Interested' ||
        c.outcome === 'Qualified' ||
        c.outcome?.toLowerCase().includes('connect')
    ).length;

    const notConnectedCalls = repActivities.filter(
      (c) =>
        c.outcome === 'No answer' ||
        c.outcome === 'Did Not Pick The Call' ||
        c.outcome === 'Busy' ||
        c.outcome === 'Wrong number'
    ).length;

    // Contacted leads: leads that have numberOfCalls > 0 or lastContacted
    const leadsContacted = repLeads.filter((l) => (l.numberOfCalls || 0) > 0).length;

    // Follow-ups due
    const followUpsDue = repLeads.filter((l) => {
      if (!l.nextFollowUp) return false;
      const due = new Date(l.nextFollowUp);
      return due >= now;
    }).length;

    // Overdue follow-ups
    const overdueFollowUps = repLeads.filter((l) => {
      if (!l.nextFollowUp) return false;
      const due = new Date(l.nextFollowUp);
      return due < now && l.crmStage !== 'Converted' && l.crmStage !== 'Lost' && l.crmStage !== 'Unqualified';
    }).length;

    // Enrollments / Payments
    const enrollments = repLeads.filter(
      (l) => l.paymentStatus === 'Paid' || l.crmStage === 'Converted' || l.leadStage === 'Paid / Enrolled'
    ).length;

    // Time to first call computation
    const leadsWithFirstCall = repLeads.filter(
      (l) => typeof l.timeToFirstCallSeconds === 'number' && l.timeToFirstCallSeconds > 0
    );

    let avgTimeToFirstCall = '—';
    if (leadsWithFirstCall.length > 0) {
      const sumSeconds = leadsWithFirstCall.reduce(
        (acc, l) => acc + (l.timeToFirstCallSeconds || 0),
        0
      );
      const avgSec = Math.round(sumSeconds / leadsWithFirstCall.length);
      if (avgSec < 60) avgTimeToFirstCall = `${avgSec}s`;
      else if (avgSec < 3600) avgTimeToFirstCall = `${Math.round(avgSec / 60)}m`;
      else avgTimeToFirstCall = `${(avgSec / 3600).toFixed(1)}h`;
    }

    return {
      rep,
      leadsAssigned: timeRange === 'all' ? repLeads.length : repLeadsAssignedInRange.length,
      totalAssignedPool: repLeads.length,
      leadsContacted,
      callsMade,
      connectedCalls,
      notConnectedCalls,
      followUpsDue,
      overdueFollowUps,
      enrollments,
      avgTimeToFirstCall
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with Time Frame Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Rep Activity & Performance Tracking
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Live Team Audit
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Real-time audit of sales reps' calling pace, connected vs missed rates, overdue follow-ups, converted payments, and average Time to First Call.
          </p>
        </div>

        {/* Time Filter Pill Buttons */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'today'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'week'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'all'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Calls Placed ({timeRange})
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {filteredActivities.length}
            </span>
            <span className="text-xs text-gray-400 font-semibold">calls</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Connected Calls
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {repMetrics.reduce((acc, r) => acc + r.connectedCalls, 0)}
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              {filteredActivities.length > 0
                ? `${Math.round((repMetrics.reduce((acc, r) => acc + r.connectedCalls, 0) / filteredActivities.length) * 100)}% Connect Rate`
                : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Overdue Follow-Ups
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
              {repMetrics.reduce((acc, r) => acc + r.overdueFollowUps, 0)}
            </span>
            <span className="text-xs text-rose-600 font-semibold">requires attention</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Enrollments Won
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-700 dark:text-purple-400">
              {repMetrics.reduce((acc, r) => acc + r.enrollments, 0)}
            </span>
            <span className="text-xs text-purple-600 font-semibold">converted</span>
          </div>
        </div>
      </div>

      {/* Rep Scorecard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <h2 className="text-base font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🏆</span> Salesperson Activity & SLA Breakdown
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            Sorted by rep roster
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Salesperson</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Assigned ({timeRange})</th>
                <th className="py-3 px-3 text-center">Calls Placed</th>
                <th className="py-3 px-3 text-center">Connected</th>
                <th className="py-3 px-3 text-center">No Answer / Busy</th>
                <th className="py-3 px-3 text-center">Time to 1st Call</th>
                <th className="py-3 px-3 text-center">Follow-ups Due</th>
                <th className="py-3 px-3 text-center">Overdue</th>
                <th className="py-3 px-3 text-center">Enrollments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {repMetrics.map((item) => (
                <tr
                  key={item.rep.id}
                  className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${item.rep.avatarColor || 'bg-gray-900'}`}>
                        {item.rep.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                          {item.rep.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {item.rep.title}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.rep.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}
                    >
                      {item.rep.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-gray-800 dark:text-gray-200">
                    {item.leadsAssigned}
                    <span className="text-[10px] text-gray-400 block font-normal">
                      Pool: {item.totalAssignedPool}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-black text-emerald-700 dark:text-emerald-400">
                    {item.callsMade}
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-blue-700 dark:text-blue-400">
                    {item.connectedCalls}
                  </td>

                  <td className="py-3 px-3 text-center text-gray-500 dark:text-gray-400">
                    {item.notConnectedCalls}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-[11px]">
                      {item.avgTimeToFirstCall}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                    {item.followUpsDue}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-black ${
                        item.overdueFollowUps > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.overdueFollowUps}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-black px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {item.enrollments}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
