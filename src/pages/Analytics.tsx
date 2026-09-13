// src/pages/Analytics.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const revenueByProgram = [
  { name: 'AI Project Management', value: 450000 },
  { name: 'AI GTM & Growth', value: 275000 },
  { name: 'AI Fellowship', value: 399000 }
];

const conversionByExp = [
  { range: '0–3 Yrs', rate: 12 },
  { range: '3–7 Yrs', rate: 24 },
  { range: '7–12 Yrs', rate: 42 },
  { range: '12+ Yrs', rate: 31 }
];

const COLORS = ['#0A6F3D', '#3AA757', '#9CD3AB'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Revenue & Conversion Analytics</h1>
          <p className="text-sm text-gray-500">Track acquisition performance, conversion funnels, and best-performing lead personas.</p>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold">Total Leads Ingested</span>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">1,240</p>
          <span className="text-[11px] text-emerald-600 font-medium">↑ +18% vs last month</span>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold">Cost per Lead (CPL)</span>
          <p className="text-2xl font-extrabold text-primary-600 mt-1">₹420</p>
          <span className="text-[11px] text-gray-400">Meta Ad API Placeholder</span>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold">Lead-to-Contact Rate</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">82.4%</p>
          <span className="text-[11px] text-gray-400">Avg 22 mins response time</span>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <span className="text-xs text-gray-500 font-semibold">Qualified-to-Enrollment</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">28.6%</p>
          <span className="text-[11px] text-gray-400">Avg 4.2 calls to close</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue by Program */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Revenue Generation by Program</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByProgram}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#0A6F3D"
                  label={(entry) => `${entry.name}: ₹${(entry.value / 1000).toFixed(0)}k`}
                >
                  {revenueByProgram.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion by Experience */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Conversion Rate by Experience Level (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionByExp}>
                <XAxis dataKey="range" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} unit="%" />
                <Tooltip formatter={(val: any) => `${val}%`} />
                <Bar dataKey="rate" fill="#0A6F3D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Best-Converting Lead Personas */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🏆</span> Best-Converting Lead Personas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-xl space-y-2">
            <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Top Persona #1</span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Senior PMs (7–12 Yrs Exp)</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Project & Program Managers seeking company switch or promotion by adding AI execution layers.
            </p>
            <span className="inline-block px-2 py-0.5 bg-primary-600 text-white font-extrabold text-[10px] rounded">
              42% Conversion Rate
            </span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Persona #2</span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Growth & Marketing Leads</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Marketers wanting fast 1-3 month AI agent outbound automation engines.
            </p>
            <span className="inline-block px-2 py-0.5 bg-gray-600 text-white font-extrabold text-[10px] rounded">
              34% Conversion Rate
            </span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-600 rounded-xl space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Campaign Analysis</span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">Top Meta Ad Creative</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              "Ad_04_PM_Agentic_Workflows" driving 65% of high-intent qualified leads.
            </p>
            <span className="inline-block px-2 py-0.5 bg-emerald-600 text-white font-extrabold text-[10px] rounded">
              ₹310 Cost/Qualified Lead
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
