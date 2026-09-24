import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  // Phase 8: Funnel Analytics
  const funnelData = [
    { stage: 'Total Leads', count: 1240, conv: '100%', drop: '0%' },
    { stage: 'Contacted', count: 890, conv: '71%', drop: '29%' },
    { stage: 'Interested', count: 450, conv: '36%', drop: '49%' },
    { stage: 'Qualified', count: 210, conv: '17%', drop: '53%' },
    { stage: 'Payment Pending', count: 85, conv: '7%', drop: '60%' },
    { stage: 'Converted', count: 62, conv: '5%', drop: '27%' },
  ];

  // Phase 8: Campaign Attribution
  const campaignAttribution = [
    { campaign: 'Meta_AI_PM_Broad', leads: 450, qualified: 85, customers: 22, revenue: 1099978, cpl: 120, cac: 2450 },
    { campaign: 'Meta_GTM_Retargeting', leads: 210, qualified: 60, customers: 18, revenue: 989982, cpl: 180, cac: 2100 },
    { campaign: 'LinkedIn_Fellowship_CXO', leads: 95, qualified: 45, customers: 15, revenue: 1499985, cpl: 450, cac: 2850 },
    { campaign: 'Google_Search_Intent', leads: 310, qualified: 90, customers: 24, revenue: 1249976, cpl: 150, cac: 1930 },
  ];

  // Phase 8: Lost-Lead Analytics
  const lostReasons = [
    { name: 'Price / No Budget', value: 45 },
    { name: 'Timing / No Urgency', value: 25 },
    { name: 'No Response / Ghosted', value: 15 },
    { name: 'Not Qualified', value: 10 },
    { name: 'Competitor', value: 5 },
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
          <span>📈</span> Executive Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Full-funnel metrics, campaign attribution, and lost-deal analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{t: 'Pipeline Revenue', v: '₹84,50,000'}, {t: 'Collected Revenue', v: '₹32,40,000'}, {t: 'Avg Deal Value', v: '₹54,999'}, {t: 'Win Rate', v: '5.2%'}].map(s => (
          <div key={s.t} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{s.t}</div>
            <div className="text-3xl font-black text-gray-900 dark:text-gray-100">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Funnel Analytics (Drop-off %)">
          <div className="space-y-4">
            {funnelData.map((stage, idx) => (
              <div key={stage.stage} className="relative">
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{stage.stage}</span>
                  <span className="text-gray-900 dark:text-gray-100">{stage.count} leads</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                  <div 
                    className="bg-primary-500 h-full rounded-full absolute left-0 top-0" 
                    style={{ width: `${(stage.count / funnelData[0].count) * 100}%` }}
                  />
                </div>
                {idx > 0 && (
                  <div className="text-[10px] text-gray-400 font-bold uppercase text-right mt-1">
                    {stage.drop} Drop-off
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Lost-Lead Analysis (Top Reasons)">
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
          <div className="grid grid-cols-2 gap-2 mt-4">
            {lostReasons.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {r.name} ({r.value}%)
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Campaign Attribution (Revenue & CAC)">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase tracking-wider">
                <th className="pb-3 font-bold">Campaign / UTM Source</th>
                <th className="pb-3 font-bold">Leads</th>
                <th className="pb-3 font-bold">Qualified</th>
                <th className="pb-3 font-bold">Customers</th>
                <th className="pb-3 font-bold">CPL</th>
                <th className="pb-3 font-bold">CAC</th>
                <th className="pb-3 font-bold">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {campaignAttribution.map((c) => (
                <tr key={c.campaign} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20">
                  <td className="py-4 font-mono text-primary-600 dark:text-primary-400">{c.campaign}</td>
                  <td className="py-4 font-bold text-gray-900 dark:text-gray-100">{c.leads}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-400">{c.qualified}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-400">{c.customers}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-400">₹{c.cpl}</td>
                  <td className="py-4 font-bold text-rose-600 dark:text-rose-400">₹{c.cac}</td>
                  <td className="py-4 font-bold text-emerald-600 dark:text-emerald-400">₹{c.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
