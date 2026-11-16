// src/pages/Payouts.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import {
  Download,
  CheckCircle2
} from 'lucide-react';

export default function Payouts() {
  const { salespeople, allLeads, leads } = useApp();
  const navigate = useNavigate();
  const leadsPool = allLeads && allLeads.length > 0 ? allLeads : leads;
  const [selectedCycle] = useState('Current Cycle (November 2026)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Commission rule rates
  const COMMISSION_WORKSHOP = 500; // AI Builder Workshop (₹6,999)
  const COMMISSION_AIPM = 5000;    // AI-PM Program (₹49,999)

  // Calculate per rep earnings
  const repPayouts = salespeople.map((rep) => {
    const repLeads = leadsPool.filter((l) => l.assignedSalesperson === rep.name);
    const convertedLeads = repLeads.filter(
      (l) =>
        l.crmStage === 'Converted' ||
        l.paymentStatus === 'Paid' ||
        l.leadStage === 'Paid / Enrolled' ||
        l.paymentState === 'Paid in full'
    );

    const workshopCount = convertedLeads.filter((l) => {
      const p = (l.programName || '').toLowerCase();
      return l.programId === 'ai-builder' || p.includes('builder') || p.includes('workshop');
    }).length;

    const aiPmCount = convertedLeads.filter((l) => {
      const p = (l.programName || '').toLowerCase();
      return l.programId === 'ai-pm' || p.includes('pm') || p.includes('project');
    }).length;

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

  const grandTotalPayouts = repPayouts.reduce((acc, r) => acc + r.totalEarnings, 0);
  const grandTotalEnrolled = repPayouts.reduce((acc, r) => acc + r.totalConverted, 0);
  const eligibleRepsCount = repPayouts.filter((r) => r.totalEarnings > 0).length;

  const handleExportCSV = () => {
    const headers = 'Salesperson,Email,AI Builder Count,AI-PM Count,Total Enrollments,Total Commission (INR),Status\n';
    const rows = repPayouts
      .map(
        (r) =>
          `"${r.rep.name}","${r.rep.email}",${r.workshopCount},${r.aiPmCount},${r.totalConverted},${r.totalEarnings},"${r.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leados_payouts_nov2026.csv`;
    a.click();
    showToast('Exported payout statement to CSV');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Commissions & Payouts
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66]">
              {selectedCycle}
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Automated admission commission tracking: ₹500 per AI Builder enrollment + ₹5,000 per AI-PM enrollment.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 text-[13px]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Payout Statement</span>
        </Button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Total Accrued Payouts</span>
            <span className="text-[11px] font-medium text-[#17673A] bg-[#DDF4E4] px-1.5 py-0.2 rounded">
              Current Cycle
            </span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            ₹{grandTotalPayouts.toLocaleString('en-IN')}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Total commission payable to active sales reps
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Total Paid Admissions</span>
            <span className="tabular-nums font-mono text-[11px]">Converted</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {grandTotalEnrolled}
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Cohort students enrolled through reps
          </div>
        </div>

        <div className="p-4 bg-white border border-[#E6E6E3] rounded-lg space-y-2">
          <div className="flex items-center justify-between text-[#6B6B66] text-[12px]">
            <span className="font-medium">Eligible Representatives</span>
            <span className="tabular-nums font-mono text-[11px]">Pacing</span>
          </div>
          <div className="text-[24px] font-semibold text-[#1F1F1D] tabular-nums font-mono">
            {eligibleRepsCount}
            <span className="text-[14px] text-[#6B6B66] ml-1">/ {salespeople.length} reps</span>
          </div>
          <div className="text-[12px] text-[#6B6B66]">
            Reps with qualified enrolled admissions this cycle
          </div>
        </div>
      </div>

      {/* Commission Structure Rule Box */}
      <div className="p-4 bg-[#F7F7F5] border border-[#E6E6E3] rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#1F1F1D]">
            Official Admissions Commission Structure
          </h3>
          <span className="text-[11px] text-[#6B6B66]">
            Calculated automatically from paid Stripe / Razorpay transactions
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white border border-[#E6E6E3] rounded-md text-[12px] space-y-1">
            <div className="font-medium text-[#1F1F1D]">
              AI Native Builder Program (₹6,999)
            </div>
            <div className="text-[#17673A] font-semibold tabular-nums font-mono">
              ₹500 Commission / Enrollment
            </div>
            <p className="text-[11px] text-[#6B6B66]">
              Payable upon completed student payment or confirmed workshop entry.
            </p>
          </div>

          <div className="p-3 bg-white border border-[#E6E6E3] rounded-md text-[12px] space-y-1">
            <div className="font-medium text-[#1F1F1D]">
              AI Native Project Management Program (₹49,999)
            </div>
            <div className="text-[#17673A] font-semibold tabular-nums font-mono">
              ₹5,000 Commission / Enrollment (10%)
            </div>
            <p className="text-[11px] text-[#6B6B66]">
              Payable upon full payment or first EMI installment receipt.
            </p>
          </div>
        </div>
      </div>

      {/* Payout Statement Table */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#1F1F1D]">
              Representative Payout Statements
            </h3>
            <p className="text-[12px] text-[#6B6B66]">
              Monthly breakdown by representative and cohort program
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                <th className="py-2.5 px-3">Salesperson</th>
                <th className="py-2.5 px-3">AI Builder (₹500/ea)</th>
                <th className="py-2.5 px-3">AI-PM (₹5,000/ea)</th>
                <th className="py-2.5 px-3">Total Admissions</th>
                <th className="py-2.5 px-3">Accrued Commission</th>
                <th className="py-2.5 px-3">Payout Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E3]">
              {repPayouts.map((row) => (
                <tr key={row.rep.id} className="hover:bg-[#F3F4F6] transition-colors h-11">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EEF0FD] text-[#3B4BDB] font-semibold text-[12px] flex items-center justify-center shrink-0">
                        {row.rep.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-medium text-[#1F1F1D]">{row.rep.name}</div>
                        <div className="text-[11px] text-[#6B6B66]">{row.rep.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[12px]">
                    <span className="font-medium text-[#1F1F1D]">{row.workshopCount}</span>
                    <span className="text-[11px] text-[#6B6B66] ml-1">
                      (₹{row.workshopEarnings.toLocaleString('en-IN')})
                    </span>
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[12px]">
                    <span className="font-medium text-[#1F1F1D]">{row.aiPmCount}</span>
                    <span className="text-[11px] text-[#6B6B66] ml-1">
                      (₹{row.aiPmEarnings.toLocaleString('en-IN')})
                    </span>
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[12px] font-semibold text-[#1F1F1D]">
                    {row.totalConverted}
                  </td>

                  <td className="py-2 px-3 tabular-nums font-mono text-[13px] font-semibold text-[#17673A]">
                    ₹{row.totalEarnings.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                        row.totalEarnings > 0
                          ? 'bg-[#DDF4E4] text-[#17673A] border-[#C3ECD0]'
                          : 'bg-[#F7F7F5] text-[#6B6B66] border-[#E6E6E3]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/workspace/${row.rep.id}`)}
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
    </div>
  );
}
