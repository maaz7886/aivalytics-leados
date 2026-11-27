import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { TrendingUp, IndianRupee, Target, Award, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

export default function Analytics() {
  const { leads, allLeads, currentUser } = useApp();
  const pool = currentUser?.role === 'Salesperson' ? leads : (allLeads || leads);

  const totalLeads = pool.length;
  const contacted = pool.filter(
    (l) => (l.numberOfCalls && l.numberOfCalls > 0) || (l.lastContacted && l.lastContacted !== 'Not Contacted') || l.crmStage !== 'New Lead'
  ).length;
  const interested = pool.filter((l) => l.crmStage === 'Interested' || l.lastActivityOutcome === 'Interested').length;
  const qualified = pool.filter(
    (l) => l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp' || l.leadStage === 'Qualified'
  ).length;
  const paymentPending = pool.filter(
    (l) => l.crmStage === 'Payment Pending' || l.paymentState === 'Payment link sent' || l.paymentState === 'Deposit pending'
  ).length;
  const converted = pool.filter(
    (l) => l.crmStage === 'Converted' || l.paymentState === 'Paid in full' || l.paymentStatus === 'Paid'
  ).length;

  const funnelData = [
    { stage: 'Total Captured Leads', count: totalLeads, conv: '100%', drop: '0%' },
    {
      stage: 'Contacted',
      count: contacted,
      conv: totalLeads > 0 ? `${Math.round((contacted / totalLeads) * 100)}%` : '0%',
      drop: totalLeads > 0 ? `${Math.round(((totalLeads - contacted) / totalLeads) * 100)}%` : '0%'
    },
    {
      stage: 'Interested',
      count: interested,
      conv: totalLeads > 0 ? `${Math.round((interested / totalLeads) * 100)}%` : '0%',
      drop: contacted > 0 ? `${Math.round(((contacted - interested) / contacted) * 100)}%` : '0%'
    },
    {
      stage: 'Qualified',
      count: qualified,
      conv: totalLeads > 0 ? `${Math.round((qualified / totalLeads) * 100)}%` : '0%',
      drop: interested > 0 ? `${Math.round(((interested - qualified) / (interested || 1)) * 100)}%` : '0%'
    },
    {
      stage: 'Payment Pending',
      count: paymentPending,
      conv: totalLeads > 0 ? `${Math.round((paymentPending / totalLeads) * 100)}%` : '0%',
      drop: qualified > 0 ? `${Math.round(((qualified - paymentPending) / (qualified || 1)) * 100)}%` : '0%'
    },
    {
      stage: 'Converted / Paid',
      count: converted,
      conv: totalLeads > 0 ? `${Math.round((converted / totalLeads) * 100)}%` : '0%',
      drop: paymentPending > 0 ? `${Math.round(((paymentPending - converted) / (paymentPending || 1)) * 100)}%` : '0%'
    },
  ];

  // Pipeline revenue calculation aligned with Dashboard
  const pipelineRevenue = pool.reduce((sum, l) => {
    const paid = Number(l.amountPaid || 0);
    if (paid > 0) return sum + paid;
    if (l.crmStage === 'Converted' || l.paymentStatus === 'Paid') {
      return sum + (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999);
    }
    if (l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp') {
      return sum + (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999) * 0.5;
    }
    return sum;
  }, 0);

  const collectedRevenue = pool.reduce((sum, l) => {
    const paid = Number(l.amountPaid || 0);
    if (paid > 0) return sum + paid;
    if (l.crmStage === 'Converted' || l.paymentStatus === 'Paid') {
      return sum + (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999);
    }
    return sum;
  }, 0);

  const winRate = totalLeads > 0 && converted > 0 ? `${((converted / totalLeads) * 100).toFixed(1)}%` : '0.0%';
  const avgDealValue = converted > 0
    ? `₹${Math.round(collectedRevenue / converted).toLocaleString('en-IN')}`
    : '₹49,999';

  // Dynamic Campaign Attribution from Live Database
  const campaignMap = new Map<string, { leads: number; qualified: number; customers: number; revenue: number }>();
  pool.forEach((l) => {
    const camp = l.metaCampaign || l.source || 'Meta_Direct_Ad';
    const entry = campaignMap.get(camp) || { leads: 0, qualified: 0, customers: 0, revenue: 0 };
    entry.leads++;
    if (l.crmStage === 'Qualified' || l.crmStage === 'Details Sent on WhatsApp') entry.qualified++;
    if (l.crmStage === 'Converted' || l.paymentStatus === 'Paid') {
      entry.customers++;
      entry.revenue += (l.programId === 'ai-fellowship' ? 99999 : l.programId === 'ai-gtm' ? 54999 : 49999);
    }
    campaignMap.set(camp, entry);
  });

  const campaignAttribution = Array.from(campaignMap.entries()).slice(0, 6).map(([campaign, data]) => {
    const cpl = 140;
    const cac = data.customers > 0 ? Math.round((data.leads * cpl) / data.customers) : 0;
    return {
      campaign,
      leads: data.leads,
      qualified: data.qualified,
      customers: data.customers,
      cpl,
      cac,
      revenue: data.revenue
    };
  });

  // Dynamic Lost Lead Analysis from Candidate Qualification & Stage Data
  const priceObjection = pool.filter((l) => (l.investment && l.investment.includes('budget')) || (l.objection && l.objection.includes('budget'))).length || 1;
  const skillsObjection = pool.filter((l) => (l.blocker && l.blocker.includes('skills')) || (l.mainChallenge && l.mainChallenge.includes('skills'))).length || 1;
  const timingObjection = pool.filter((l) => l.expectedTimeline && (l.expectedTimeline.includes('6_months') || l.expectedTimeline.includes('later'))).length || 1;
  const ghosted = pool.filter((l) => l.crmStage === 'Did Not Pick The Call' || (l.numberOfCalls && l.numberOfCalls > 2)).length || 1;
  const unqual = pool.filter((l) => l.crmStage === 'Unqualified' || (l.yearsOfExperience && l.yearsOfExperience < 2)).length || 1;

  const totalReasons = priceObjection + skillsObjection + timingObjection + ghosted + unqual;

  const lostReasons = [
    { name: 'Price / Budget Mismatch', value: Math.round((priceObjection / totalReasons) * 100) },
    { name: 'Irrelevant Skills Uncertainty', value: Math.round((skillsObjection / totalReasons) * 100) },
    { name: 'Timing / Delayed Cohort', value: Math.round((timingObjection / totalReasons) * 100) },
    { name: 'Unreachable / Did Not Pick', value: Math.round((ghosted / totalReasons) * 100) },
    { name: 'Experience Unqualified', value: Math.round((unqual / totalReasons) * 100) },
  ];

  const COLORS = ['#B42318', '#D97706', '#6B6B66', '#3B4BDB', '#7C3AED'];

  const Card = ({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) => (
    <div className="bg-white p-5 rounded-[8px] border border-[#E6E6E3]">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#E6E6E3]">
        {Icon && <Icon className="w-4 h-4 text-[#3B4BDB]" />}
        <h2 className="text-[14px] font-semibold text-[#1F1F1D] tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );

  const metricCards = [
    { label: 'Pipeline Revenue', value: `₹${Math.round(pipelineRevenue).toLocaleString('en-IN')}`, icon: TrendingUp, badge: 'Active Pipeline' },
    { label: 'Collected Revenue', value: `₹${Math.round(collectedRevenue).toLocaleString('en-IN')}`, icon: IndianRupee, badge: 'Realized' },
    { label: 'Avg Deal Value', value: avgDealValue, icon: Target, badge: 'Per Cohort' },
    { label: 'Conversion / Win Rate', value: winRate, icon: Award, badge: `${converted} converted` }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12 bg-white text-[#1F1F1D]">
      <div>
        <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-[13px] text-[#6B6B66] mt-0.5">
          Live synchronized funnel metrics, real-time campaign attribution, and candidate objection analysis.
        </p>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="p-4 bg-[#FAFAF9] border border-[#E6E6E3] rounded-[8px] space-y-2">
              <div className="flex items-center justify-between text-[12px] text-[#6B6B66]">
                <span className="font-medium">{m.label}</span>
                <Icon className="w-3.5 h-3.5 text-[#3B4BDB]" />
              </div>
              <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
                {m.value}
              </div>
              <div className="text-[11px] font-medium text-[#6B6B66]">
                {m.badge}
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel & Objections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Funnel Drop-Off Analytics (Live Data)" icon={BarChart3}>
          <div className="space-y-4">
            {funnelData.map((stage, idx) => (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-[#1F1F1D]">{stage.stage}</span>
                  <span className="font-semibold text-[#1F1F1D] tabular-nums font-mono">{stage.count} leads</span>
                </div>
                <div className="w-full bg-[#F7F7F5] border border-[#E6E6E3] rounded-full h-3 overflow-hidden relative">
                  <div
                    className="bg-[#3B4BDB] h-full rounded-full transition-all"
                    style={{ width: `${funnelData[0].count > 0 ? Math.max((stage.count / funnelData[0].count) * 100, stage.count > 0 ? 3 : 0) : 0}%` }}
                  />
                </div>
                {idx > 0 && (
                  <div className="text-[11px] text-[#6B6B66] text-right tabular-nums">
                    {stage.conv} of total · {stage.drop} drop-off
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Candidate Objection Analysis (Lost Reasons)" icon={PieChartIcon}>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lostReasons}
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {lostReasons.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E6E6E3',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1F1F1D'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-[#E6E6E3]">
            {lostReasons.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 text-[12px] font-medium text-[#1F1F1D]">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                <span className="truncate">{r.name}</span>
                <span className="ml-auto text-[#6B6B66] tabular-nums font-mono">{r.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Campaign Attribution Table */}
      <Card title="Campaign Attribution & CAC (Sources & Ads)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-[#E6E6E3] bg-[#FAFAF9] text-[#6B6B66] text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 font-semibold">Campaign / Source</th>
                <th className="py-2.5 px-3 font-semibold">Leads</th>
                <th className="py-2.5 px-3 font-semibold">Qualified</th>
                <th className="py-2.5 px-3 font-semibold">Paid Students</th>
                <th className="py-2.5 px-3 font-semibold">Est. CPL</th>
                <th className="py-2.5 px-3 font-semibold">Est. CAC</th>
                <th className="py-2.5 px-3 font-semibold text-right">Realized Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E3]">
              {campaignAttribution.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[13px] text-[#6B6B66]">
                    No campaign attribution data available yet.
                  </td>
                </tr>
              ) : (
                campaignAttribution.map((c) => (
                  <tr key={c.campaign} className="hover:bg-[#FAFAF9] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[12px] font-medium text-[#3B4BDB]">{c.campaign}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#1F1F1D] tabular-nums font-mono">{c.leads}</td>
                    <td className="py-2.5 px-3 text-[#6B6B66] tabular-nums font-mono">{c.qualified}</td>
                    <td className="py-2.5 px-3 text-[#6B6B66] tabular-nums font-mono">{c.customers}</td>
                    <td className="py-2.5 px-3 text-[#6B6B66] tabular-nums font-mono">₹{c.cpl}</td>
                    <td className="py-2.5 px-3 font-medium text-[#B42318] tabular-nums font-mono">
                      {c.cac > 0 ? `₹${c.cac}` : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#17673A] text-right tabular-nums font-mono">
                      ₹{c.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
