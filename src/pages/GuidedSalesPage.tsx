// src/pages/GuidedSalesPage.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import GuidedSalesWizardModal from '../components/GuidedSalesWizardModal';

export default function GuidedSalesPage() {
  const { leads, selectedLeadId, setSelectedLeadId } = useApp();
  const [isWizardOpen, setIsWizardOpen] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const currentLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const filteredLeads = leads.filter((l) =>
    l.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.currentRole.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.phone.includes(searchFilter) ||
    l.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-purple-800/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-xs font-extrabold tracking-wide uppercase">
            <span>🧠 24-Phase Consultative Framework</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Guided Sales Call Teleprompter & Decision Engine
          </h1>
          <p className="text-purple-200 text-sm max-w-3xl leading-relaxed">
            Algorithmic 24-phase sales decision system for Aivalytics’ AI-Native Project Management program.
            Provides live 1–3 sentence spoken prompts, Hormozi value equation stacking, 11-objection resolution playbooks, real-time 100-point lead scoring, and 1-click Razorpay payment link dispatch.
          </p>
        </div>
      </div>

      {/* Active Lead Selector Bar */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center text-2xl font-black shrink-0">
            👤
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block uppercase">
              Select Prospect for Live Sales Call
            </label>
            <select
              value={currentLead?.id || ''}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="mt-1 w-full max-w-md px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-extrabold text-sm focus:ring-2 focus:ring-purple-500"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.fullName} — {l.currentRole} ({l.yearsOfExperience}y exp) [{l.crmStage}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>⚡ Launch Live Call Teleprompter Wizard</span>
        </button>
      </div>

      {/* Active Lead Intelligence Summary Card */}
      {currentLead && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Prospect Profile */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Prospect Overview
              </span>
              <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black text-xs rounded-lg">
                Fit Score: {currentLead.fitScore}%
              </span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{currentLead.fullName}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {currentLead.currentRole} at {currentLead.currentCompany} ({currentLead.yearsOfExperience} Years Exp)
              </p>
            </div>
            <div className="space-y-2 text-xs divide-y divide-gray-100 dark:divide-gray-700">
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{currentLead.phone}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{currentLead.email}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">City:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">{currentLead.city || 'India'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-500">Program:</span>
                <span className="font-extrabold text-purple-600 dark:text-purple-400">{currentLead.programName}</span>
              </div>
            </div>
          </div>

          {/* Core Pain & Goal */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Discovered Needs & Pain
            </span>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
                <span className="font-extrabold text-amber-800 dark:text-amber-300 block">⚡ Primary Challenge / Pain:</span>
                <p className="text-gray-700 dark:text-gray-300">{currentLead.primaryGoal || 'Manual sprint tracking & fear of AI obsolescence'}</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">🎯 Desired 6–12 Mo Outcome:</span>
                <p className="text-gray-700 dark:text-gray-300">Transition into Lead AI Project Manager / Director of AI PMO</p>
              </div>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Call Execution Actions
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Launch the guided 24-phase wizard to follow the state-driven script, resolve objections live, and dispatch the seat reservation payment link.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => setIsWizardOpen(true)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡ Open Live Teleprompter Wizard</span>
              </button>
              <a
                href={`https://wa.me/${currentLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${currentLead.fullName}, following up from Aivalytics regarding our AI-Native Project Management cohort.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬 WhatsApp Quick Message</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Roster of Available Prospects */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">Prospect Call Queue</h3>
            <p className="text-xs text-gray-500">Select any candidate to start their 24-Phase Guided Sales Decision call.</p>
          </div>
          <input
            type="text"
            placeholder="Search candidates by name, role, phone..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full sm:w-72"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((ld) => {
            const isSelected = ld.id === currentLead?.id;
            return (
              <div
                key={ld.id}
                onClick={() => {
                  setSelectedLeadId(ld.id);
                  setIsWizardOpen(true);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">{ld.fullName}</h4>
                    <span className="text-xs text-gray-500">{ld.currentRole} • {ld.yearsOfExperience}y exp</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-extrabold">
                    {ld.fitScore}% Fit
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{ld.phone}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">⚡ Start Call ➔</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guided Sales Wizard Modal */}
      {currentLead && (
        <GuidedSalesWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          lead={currentLead}
        />
      )}
    </div>
  );
}
