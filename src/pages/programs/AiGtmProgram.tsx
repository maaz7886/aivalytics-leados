// src/pages/programs/AiGtmProgram.tsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import MetaLeadSimulatorModal from '../../components/MetaLeadSimulatorModal';
import ProgramCrmKanban from '../../components/ProgramCrmKanban';


export default function AiGtmProgram() {
  const { leads, programs, updateProgram, setSelectedLeadId, deleteLead } = useApp();
  const navigate = useNavigate();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const gtmProgram = programs.find((p) => p.id === 'ai-gtm') || programs[1];
  const gtmLeads = leads.filter((l) => {
    const pName = (l.programName || '').toLowerCase();
    return l.programId === 'ai-gtm' || pName.includes('gtm') || pName.includes('growth');
  });

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState<number>(gtmProgram.price);

  const handlePriceSave = () => {
    updateProgram({ ...gtmProgram, price: Number(tempPrice) });
    setIsEditingPrice(false);
  };

  const totalGtmRevenue = gtmLeads.length * gtmProgram.price;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-gray-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-bold text-xs rounded-full border border-blue-500/30">
              Dedicated Program Operations
            </span>
            <span className="text-xs text-gray-400">ID: ai-gtm</span>
          </div>
          <h1 className="text-2xl font-black">
            AI-Native Go-To-Market (GTM)
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl">
            Scale qualified B2B lead volume 3x while cutting research time by 70% using autonomous outbound AI agents, Clay enrichment, & n8n growth loops.
          </p>
        </div>
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 font-bold text-sm rounded-xl shadow-lg transition-all text-white shrink-0 cursor-pointer"
        >
          + Simulate GTM Meta Lead
        </button>
      </div>

      {/* Program Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Pipeline Leads</div>
          <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{gtmLeads.length} Candidates</div>
        </div>

        {/* Editable Program Fee Card */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500">
            <span>Program Fee (INR)</span>
            <button
              onClick={() => (isEditingPrice ? handlePriceSave() : setIsEditingPrice(true))}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-xs cursor-pointer"
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
                className="w-full px-2 py-1 border border-blue-500 rounded text-sm font-bold text-blue-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          ) : (
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
              ₹{gtmProgram.price.toLocaleString()}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Program Pipeline Value</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalGtmRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-bold text-gray-500">Avg Lead Intent Score</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">84%</div>
        </div>
      </div>

      {/* Program Calling CRM & 8-Stage Kanban */}
      <ProgramCrmKanban programId="ai-gtm" />


      {/* Curriculum & Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            3-Month GTM Curriculum
          </h2>
          <div className="space-y-4">
            {gtmProgram.structure.map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{item.month}</span>
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

        {/* Growth Stack & Outcomes */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Automated GTM Stack
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800 text-xs space-y-1">
              <div className="font-bold text-blue-900 dark:text-blue-200">Clay + n8n Outbound Engine</div>
              <div className="text-blue-700 dark:text-blue-400">Automated lead research, LinkedIn scrapers, and personalized prompt pipelines.</div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
              <div className="font-bold text-indigo-900 dark:text-indigo-200">Multi-Turn Personalization Agent</div>
              <div className="text-indigo-700 dark:text-indigo-400">Context-aware outreach agent that avoids generic spam formatting.</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span className="font-semibold">Batch Schedule:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{gtmProgram.batchTiming}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Target Audience:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">Growth Leads, Marketing & Founders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated GTM Leads */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            AI-Native GTM Candidates ({gtmLeads.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/60 text-xs text-gray-500 font-bold uppercase">
                <th className="p-3">Candidate</th>
                <th className="p-3">Role & Studio</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Primary Goal</th>
                <th className="p-3 text-center">Fit Score</th>
                <th className="p-3">CRM Stage</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {gtmLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td className="p-3 font-bold text-gray-900 dark:text-gray-100">{lead.fullName}</td>
                  <td className="p-3 text-xs">{lead.currentRole} at {lead.currentCompany}</td>
                  <td className="p-3 text-xs">{lead.yearsOfExperience} yrs</td>
                  <td className="p-3 text-xs font-semibold text-gray-600 dark:text-gray-300">{lead.primaryGoal}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded">
                      {lead.fitScore}/100
                    </span>
                  </td>
                  <td className="p-3 text-xs font-bold text-blue-600">{lead.crmStage}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        navigate('/ai');
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      View AI Intelligence
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to permanently delete lead "${lead.fullName}"?`)) {
                          deleteLead(lead.id);
                        }
                      }}
                      className="ml-2 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 font-bold text-xs rounded-lg border border-red-200 dark:border-red-900/60 cursor-pointer transition-all"
                      title="Delete Lead"
                    >
                      🗑️
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

