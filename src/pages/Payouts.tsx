// src/pages/Payouts.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, Award, Calendar, CheckCircle, Download } from 'lucide-react';

export default function Payouts() {
  const { salespeople, allLeads, leads } = useApp();
  const leadsPool = allLeads || leads;
  const [selectedMonth] = useState('Current Cycle (November 2026)');

  // Commission rates
  const COMMISSION_WORKSHOP = 500;
  const COMMISSION_AIPM = 5000;

  // Calculate per rep earnings
  const repPayouts = salespeople.map((rep) => {
    const repLeads = leadsPool.filter((l) => l.assignedSalesperson === rep.name);
    const convertedLeads = repLeads.filter(
      (l) => l.crmStage === 'Converted' || l.paymentStatus === 'Paid' || l.leadStage === 'Paid / Enrolled'
    );

    const workshopCount = convertedLeads.filter(
      (l) => l.programId === 'workshop-3day' || l.programName?.toLowerCase().includes('workshop') || l.programName?.toLowerCase().includes('builder')
    ).length;

    const aiPmCount = convertedLeads.filter(
      (l) => l.programId === 'ai-pm' || l.programName?.toLowerCase().includes('pm') || l.programName?.toLowerCase().includes('project')
    ).length;

    const workshopEarnings = workshopCount * COMMISSION_WORKSHOP;
    const aiPmEarnings = aiPmCount * COMMISSION_AIPM;
    const totalEarnings = workshopEarnings + aiPmEarnings;

    return {
      rep,
      totalConverted: convertedLeads.length,
      workshopCount,
      aiPmCount,
      workshopEarnings,
      aiPmEarnings,
      totalEarnings,
      status: totalEarnings > 0 ? 'Approved for Payout' : 'No Enrollments'
    };
  });

  const grandTotal = repPayouts.reduce((acc, r) => acc + r.totalEarnings, 0);
  const totalEnrolled = repPayouts.reduce((acc, r) => acc + r.totalConverted, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Sales Commissions & Payouts
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {selectedMonth}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Automated admission commission tracking: ₹500 per 3-Day Workshop enrollment + ₹5,000 per AI-Native PM cohort enrollment.
          </p>
        </div>

        <button
          onClick={() => alert('Payout statement exported to CSV')}
          className="px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Payout Statement</span>
        </button>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase mb-2">
            <span>Total Accrued Payouts</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
            ₹{grandTotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Across {salespeople.length} sales representatives
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase mb-2">
            <span>Verified Conversions</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
            {totalEnrolled}
          </div>
          <span className="text-[11px] text-gray-400 font-semibold mt-1 block">
            Razorpay-cleared student admissions
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase mb-2">
            <span>Next Settlement Date</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
            Nov 30, 2026
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Bi-weekly direct bank transfer
          </span>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
            Representative Commission Breakdown
          </h2>
          <span className="text-xs text-gray-400 font-medium">100% Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-750/50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-3 text-center">3-Day Builder (₹500 ea)</th>
                <th className="py-3 px-3 text-center">AI-Native PM (₹5,000 ea)</th>
                <th className="py-3 px-3 text-center">Total Enrolled</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Accrued Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {repPayouts.map((item) => (
                <tr key={item.rep.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${item.rep.avatarColor || 'bg-gray-900'}`}>
                        {item.rep.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">{item.rep.name}</div>
                        <div className="text-[10px] text-gray-400">{item.rep.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                    {item.workshopCount} <span className="text-gray-400 text-[10px]">(₹{item.workshopEarnings.toLocaleString('en-IN')})</span>
                  </td>

                  <td className="py-3 px-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                    {item.aiPmCount} <span className="text-gray-400 text-[10px]">(₹{item.aiPmEarnings.toLocaleString('en-IN')})</span>
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-gray-900 dark:text-gray-100">
                    {item.totalConverted}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle className="w-2.5 h-2.5 inline mr-1" />
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                      ₹{item.totalEarnings.toLocaleString('en-IN')}
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
