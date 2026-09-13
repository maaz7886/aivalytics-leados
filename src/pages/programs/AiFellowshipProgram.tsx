// src/pages/programs/AiFellowshipProgram.tsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import MetaLeadSimulatorModal from '../../components/MetaLeadSimulatorModal';
import ProgramCrmKanban from '../../components/ProgramCrmKanban';

export default function AiFellowshipProgram() {
  const { leads, programs, updateProgram, setSelectedLeadId } = useApp();
  const navigate = useNavigate();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const fellowshipProgram = programs.find((p) => p.id === 'ai-fellowship') || programs[2];
  const fellowshipLeads = leads.filter((l) => l.programId === 'ai-fellowship' || l.programName.toLowerCase().includes('fellowship') || l.programName.toLowerCase().includes('leadership'));

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState<number>(fellowshipProgram.price);

  const handlePriceSave = () => {
    updateProgram({ ...fellowshipProgram, price: Number(tempPrice) });
    setIsEditingPrice(false);
  };

  const totalFellowshipRevenue = fellowshipLeads.length * fellowshipProgram.price;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-yellow-900 to-gray-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full border border-amber-500/30">
              Executive Peer Network & Lab
            </span>
            <span className="text-xs text-gray-400">ID: ai-fellowship</span>
          </div>
          <h1 className="text-2xl font-black">
            AI Leadership Fellowship
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl">
            Elite 4-month executive fellowship & venture lab for Founders, VP/CXOs, & Senior Consultants building enterprise AI advisory or transformation units.
          </p>
        </div>
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 font-bold text-sm rounded-xl shadow-lg transition-all text-white shrink-0 cursor-pointer"
        >
          + Simulate Fellowship Executive Lead
        </button>
      </div>

      {/* Program Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Executive Candidates</div>
          <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{fellowshipLeads.length} Leaders</div>
        </div>

        {/* Editable Program Fee Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500">
            <span>Fellowship Investment (INR)</span>
            <button
              onClick={() => (isEditingPrice ? handlePriceSave() : setIsEditingPrice(true))}
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold text-xs cursor-pointer"
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
                className="w-full px-2 py-1 border border-amber-500 rounded text-sm font-bold text-amber-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          ) : (
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              ₹{fellowshipProgram.price.toLocaleString()}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Program Pipeline Value</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalFellowshipRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Avg Lead Fit Score</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">96%</div>
        </div>
      </div>

      {/* Program Calling CRM & 8-Stage Kanban */}
      <ProgramCrmKanban programId="ai-fellowship" />


      {/* Fellowship Structure & Masterminds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            4-Month Executive Structure
          </h2>
          <div className="space-y-4">
            {fellowshipProgram.structure.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">{item.month}</span>
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

        {/* Executive Network Privileges */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Executive Network Privileges
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-200">Investor & Founder Mastermind Dinners</div>
              <div className="text-amber-700 dark:text-amber-400">Quarterly offline dinners & board advisory roundtables.</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800 text-xs space-y-1">
              <div className="font-bold text-purple-900 dark:text-purple-200">Enterprise AI Transformation Audits</div>
              <div className="text-purple-700 dark:text-purple-400">Validated architecture audit templates to sell $50k+ AI advisory contracts.</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span className="font-semibold">Schedule:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{fellowshipProgram.batchTiming}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Eligibility:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">10+ yrs exp (CXO / Founders)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Executive Candidates */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            AI Leadership Fellowship Candidates ({fellowshipLeads.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/60 text-xs text-gray-500 font-bold uppercase">
                <th className="p-3">Executive</th>
                <th className="p-3">Role & Firm</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Primary Goal</th>
                <th className="p-3 text-center">Fit Score</th>
                <th className="p-3">CRM Stage</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fellowshipLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{lead.fullName}</td>
                  <td className="p-3 text-xs">{lead.currentRole} at {lead.currentCompany}</td>
                  <td className="p-3 text-xs">{lead.yearsOfExperience} yrs</td>
                  <td className="p-3 text-xs font-semibold text-gray-600 dark:text-gray-300">{lead.primaryGoal}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-xs rounded">
                      {lead.fitScore}/100
                    </span>
                  </td>
                  <td className="p-3 text-xs font-bold text-amber-600">{lead.crmStage}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        navigate('/ai');
                      }}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      View AI Intelligence
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MetaLeadSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
}

