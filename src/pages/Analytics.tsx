import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';

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

  const COLORS = ['#ef4444', '#f59e0b', '#6b7280', '#3b82f6', '#8b5cf6'];

  const Card = ({ title, children }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>📈</span> Executive Analytics & Performance
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Live synchronized funnel metrics, real-time attribution, and candidate qualification objection analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { t: 'Pipeline Revenue', v: `₹${Math.round(pipelineRevenue).toLocaleString('en-IN')}` },
          { t: 'Collected Revenue', v: `₹${Math.round(collectedRevenue).toLocaleString('en-IN')}` },
          { t: 'Avg Deal Value', v: avgDealValue },
          { t: 'Conversion / Win Rate', v: winRate }
        ].map((s) => (
          <div key={s.t} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{s.t}</div>
            <div className="text-3xl font-black text-gray-900 dark:text-gray-100">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Funnel Drop-Off Analytics (Live Data)">
          <div className="space-y-4">
            {funnelData.map((stage, idx) => (
              <div key={stage.stage} className="relative">
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{stage.stage}</span>
                  <span className="text-gray-900 dark:text-gray-100">{stage.count} leads</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                  <div
                    className="bg-[#133926] h-full rounded-full absolute left-0 top-0 transition-all"
                    style={{ width: `${funnelData[0].count > 0 ? (stage.count / funnelData[0].count) * 100 : 0}%` }}
                  />
                </div>
                {idx > 0 && (
                  <div className="text-[10px] text-gray-400 font-bold uppercase text-right mt-1">
                    {stage.conv} of total • {stage.drop} drop-off
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Candidate Objection Analysis (Real Form Qualifiers)">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lostReasons}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {lostReasons.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {lostReasons.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                <span>{r.name} ({r.value}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Campaign Attribution & CAC (Live Ingestion Data)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase tracking-wider text-xs">
                <th className="pb-3 font-bold">Campaign / Ingestion Source</th>
                <th className="pb-3 font-bold">Leads Ingested</th>
                <th className="pb-3 font-bold">Qualified</th>
                <th className="pb-3 font-bold">Paid Students</th>
                <th className="pb-3 font-bold">Est. CPL</th>
                <th className="pb-3 font-bold">Est. CAC</th>
                <th className="pb-3 font-bold">Realized Revenue</th>
              </tr>
            </thead>
            <tbody>
              {campaignAttribution.map((c) => (
                <tr key={c.campaign} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20 text-xs">
                  <td className="py-3 font-mono font-bold text-[#133926] dark:text-emerald-400">{c.campaign}</td>
                  <td className="py-3 font-black text-gray-900 dark:text-gray-100">{c.leads}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300 font-semibold">{c.qualified}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-300 font-semibold">{c.customers}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">₹{c.cpl}</td>
                  <td className="py-3 font-bold text-rose-600 dark:text-rose-400">{c.cac > 0 ? `₹${c.cac}` : 'N/A'}</td>
                  <td className="py-3 font-black text-emerald-700 dark:text-emerald-400">₹{c.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
