// src/pages/Pipeline.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import { useNavigate } from 'react-router-dom';
import LeadDetailModal from '../components/LeadDetailModal';
import MetaLeadSimulatorModal from '../components/MetaLeadSimulatorModal';

function formatCollectionDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  } catch {}
  return String(dateStr).split('T')[0] || String(dateStr);
}

const stages: Stage[] = [
  'New Lead',
  'Interested',
  'Follow-Up 1',
  'Follow-Up 2',
  'Follow-Up 3',
  'Qualified',
  'Call Later',
  'Did Not Pick The Call',
  'Details Sent on WhatsApp',
  'Payment Pending',
  'Joined Session',
  'Not Interested',
  'Unqualified',
  'Converted',
  'Lost'
];

export default function Pipeline() {
  const { leads, updateLeadStage, deleteLead, logCall } = useApp();
  const navigate = useNavigate();
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<Lead | null>(null);

  const activeModalLead = selectedLeadForModal
    ? leads.find((l) => l.id === selectedLeadForModal.id) || selectedLeadForModal
    : null;

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    _e.dataTransfer.setData('text/plain', id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (id) {
      updateLeadStage(id, targetStage);
      setDraggedLeadId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lead Pipeline Kanban</h1>
          <p className="text-sm text-gray-500">Drag & drop leads across sales funnel stages to update stage & fire automated AI actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/import')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            📊 Upload Excel / CSV Leads
          </button>
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span> + Simulate Meta Lead
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => {
            if (stage === 'Call Later') {
              return l.crmStage === 'Call Later' || l.crmStage === 'Call Pending';
            }
            if (stage === 'Did Not Pick The Call') {
              return l.crmStage === 'Did Not Pick The Call' || l.crmStage === 'Did Not Receive Call';
            }
            return l.crmStage === stage;
          });

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="w-76 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[calc(100vh-140px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1">
                  {stage.startsWith('Follow-Up') ? '📅 ' + stage : stage}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 font-extrabold text-xs">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-xs text-gray-400">
                    Drop lead here
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => setSelectedLeadForModal(lead)}
                      className="bg-white dark:bg-gray-700 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-xs hover:shadow-md hover:border-primary-500 cursor-pointer transition-all space-y-2.5 group"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600">
                          {lead.fullName}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium">
                          {lead.yearsOfExperience}y exp
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-300 font-medium truncate">
                        {lead.currentRole} • {lead.currentCompany}
                      </p>

                      <div className="text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950 p-1.5 rounded truncate">
                        {lead.programName}
                      </div>

                      <div className="text-[11px] text-gray-500 italic truncate">
                        🎯 {lead.primaryGoal}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-600 text-[11px]">
                        <span className="font-bold text-primary-600">Fit: {lead.fitScore}%</span>
                        <span className="font-bold text-emerald-600">Intent: {lead.intentScore}%</span>
                      </div>

                      {/* Date of Collecting and Follow-up Info (User Requirement) */}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-600/70 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1 font-medium" title="Date of lead collection">
                            <span>📥</span> Collected:
                          </span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {formatCollectionDate(lead.dateCaptured)}
                          </span>
                        </div>

                        {lead.nextFollowUp && (
                          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800/60">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                              <span>⏰</span> Follow-Up:
                            </span>
                            <span className="text-[10px] font-extrabold text-amber-900 dark:text-amber-200 truncate max-w-[120px]">
                              {lead.nextFollowUp}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick Contact & Details Bar */}
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              logCall(lead.id, 'Connected', 'Outgoing call placed from Pipeline Kanban');
                            }}
                            className="p-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 cursor-pointer"
                            title="Call Lead (Logs to Daily Calling Tracker)"
                          >
                            📞
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100"
                            title="WhatsApp Lead"
                          >
                            💬
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to permanently delete lead "${lead.fullName}"?`)) {
                                deleteLead(lead.id);
                              }
                            }}
                            className="p-1 rounded bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer transition-all"
                            title="Delete Lead"
                          >
                            🗑️
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-primary-600 hover:underline">
                          View Details & Move →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LEAD DETAILS & STAGE MOVER MODAL */}
      <LeadDetailModal
        lead={activeModalLead}
        isOpen={!!selectedLeadForModal}
        onClose={() => setSelectedLeadForModal(null)}
        onStageChange={(newStage) => updateLeadStage(selectedLeadForModal!.id, newStage)}
        onDelete={() => setSelectedLeadForModal(null)}
      />

      {/* META ADS LEAD SIMULATOR MODAL */}
      {isSimulatorOpen && (
        <MetaLeadSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
        />
      )}
    </div>
  );
}
