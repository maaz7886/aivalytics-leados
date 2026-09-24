// src/pages/programs/AiPmProgram.tsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MetaLeadSimulatorModal from '../../components/MetaLeadSimulatorModal';
import ProgramCrmKanban from '../../components/ProgramCrmKanban';

export default function AiPmProgram() {
  const { leads, programs, updateProgram } = useApp();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const pmProgram = programs.find((p) => p.id === 'ai-pm') || programs[0];
  const pmLeads = leads.filter((l) => l.programId === 'ai-pm' || (l.programName || '').toLowerCase().includes('project'));

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState<number>(pmProgram.price);

  const handlePriceSave = () => {
    updateProgram({ ...pmProgram, price: Number(tempPrice) });
    setIsEditingPrice(false);
  };

  const totalPmRevenue = pmLeads.length * pmProgram.price;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-primary-900 to-gray-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
              Dedicated Program Operations
            </span>
            <span className="text-xs text-gray-400">ID: ai-pm</span>
          </div>
          <h1 className="text-2xl font-black">
            AI-Native Project Management
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl">
            Empower senior PMs & Operations leaders to build multi-agent workflows, engineer SOPs, and automate sprint status tracking.
          </p>
        </div>
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-sm rounded-xl shadow-lg transition-all text-white shrink-0 cursor-pointer"
        >
          + Simulate AI-PM Meta Lead
        </button>
      </div>

      {/* Program Quick Stats & Editable Pricing */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Pipeline Leads</div>
          <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{pmLeads.length} Candidates</div>
        </div>

        {/* Editable Program Fee Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500">
            <span>Program Fee (INR)</span>
            <button
              onClick={() => (isEditingPrice ? handlePriceSave() : setIsEditingPrice(true))}
              className="text-primary-600 dark:text-primary-400 hover:underline font-bold text-xs cursor-pointer"
            >
              {isEditingPrice ? "Save" : "Edit Fee"}
            </button>
          </div>
          {isEditingPrice ? (
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-500 text-sm">₹</span>
              <input
                type="number"
                value={tempPrice}
                onChange={(e) => setTempPrice(Number(e.target.value))}
                className="w-full px-2 py-1 border border-primary-500 rounded text-sm font-bold text-primary-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          ) : (
            <div className="text-2xl font-black text-primary-600 dark:text-primary-400">
              ₹{pmProgram.price.toLocaleString()}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Program Pipeline Value</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalPmRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Avg Lead Fit Score</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">91%</div>
        </div>
      </div>

      {/* Program Calling CRM & 8-Stage Kanban */}
      <ProgramCrmKanban programId="ai-pm" />

      {/* Curriculum & Capstone Projects Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            3-Month Curriculum Roadmap
          </h2>
          <div className="space-y-4">
            {pmProgram.structure.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider">{item.month}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.title}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {item.topics.map((t, tIdx) => (
                    <span key={tIdx} className="px-2.5 py-1 bg-white dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capstone Projects & Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Practical Capstones
          </h2>
          <div className="space-y-3">
            {pmProgram.projects.map((proj, idx) => (
              <div key={idx} className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">Project #{idx + 1}</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-medium">{proj}</div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span className="font-semibold">Batch Schedule:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{pmProgram.batchTiming}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Target Profile:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">3+ yrs PM / Ops exp</span>
            </div>
          </div>
        </div>
      </div>

      <MetaLeadSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}


