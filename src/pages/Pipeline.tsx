// src/pages/Pipeline.tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Stage } from '../types';
import { useNavigate } from 'react-router-dom';

const stages: Stage[] = [
  'New Lead',
  'AI Prepared',
  'Contact Pending',
  'Connected',
  'Qualified',
  'Details sent',
  'Follow-Up',
  'Payment Link Sent',
  'Seat Reserved',
  'Enrolled'
];

export default function Pipeline() {
  const { leads, updateLeadStage, setSelectedLeadId, deleteLead, deleteBulkLeads, bulkUpdateStage } = useApp();
  const navigate = useNavigate();

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetStage, setTargetStage] = useState<Stage | ''>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    _e.dataTransfer.setData('text/plain', id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetBoardStage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (id) {
      updateLeadStage(id, targetBoardStage);
      setDraggedLeadId(null);
    }
  };

  const handleCardClick = (id: string) => {
    setSelectedLeadId(id);
    navigate('/ai');
  };

  // Selection handlers
  const allLeadIds = leads.map((l) => l.id);
  const isAllSelected = allLeadIds.length > 0 && allLeadIds.every((id) => selectedIds.includes(id));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allLeadIds);
    }
  };

  const handleToggleCardSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleSingleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      deleteLead(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkMove = (stage: Stage) => {
    if (selectedIds.length === 0 || !stage) return;
    bulkUpdateStage(selectedIds, stage);
    setTargetStage('');
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    deleteBulkLeads(selectedIds);
    setSelectedIds([]);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lead Pipeline Kanban</h1>
          <p className="text-sm text-gray-500">
            Drag & drop leads across CRM stages, select multiple cards to move or delete, or click any card for AI Intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAllToggle}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-300 dark:border-gray-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>{isAllSelected ? '☑️' : '⏹️'}</span>
            {isAllSelected ? 'Deselect All' : 'Select All Leads'} ({leads.length})
          </button>
        </div>
      </div>

      {/* STICKY BULK ACTIONS BAR (When items checked) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 bg-gray-900 text-white rounded-2xl border border-gray-700 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary-600 text-white font-black text-xs rounded-xl shadow-xs">
              ✓ {selectedIds.length} Selected
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs font-semibold text-gray-400 hover:text-white underline cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bulk Move Stage Dropdown */}
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700">
              <span className="text-xs font-extrabold text-gray-300">Move to Kanban Board:</span>
              <select
                value={targetStage}
                onChange={(e) => {
                  const val = e.target.value as Stage;
                  setTargetStage(val);
                  if (val) handleBulkMove(val);
                }}
                className="px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">-- Choose Stage --</option>
                {stages.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🗑️</span> Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.crmStage === stage);

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="w-72 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[calc(100vh-160px)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-extrabold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  {stage}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-800 dark:text-primary-200 font-black text-xs">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageLeads.length === 0 ? (
                  <div className="p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center text-xs text-gray-400 italic">
                    Drop lead here
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const isChecked = selectedIds.includes(lead.id);

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => handleCardClick(lead.id)}
                        className={`p-4 rounded-xl border transition-all space-y-2.5 group cursor-grab active:cursor-grabbing ${
                          isChecked
                            ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 ring-2 ring-primary-500 shadow-md'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-xs hover:shadow-md'
                        }`}
                      >
                        {/* Top Card Header with Checkbox & Single Delete */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onClick={(e) => handleToggleCardSelect(e, lead.id)}
                              onChange={() => {}}
                              className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 cursor-pointer"
                              title="Select lead for bulk actions"
                            />
                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors">
                              {lead.fullName}
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleSingleDelete(e, lead.id, lead.fullName)}
                            className="text-gray-400 hover:text-red-600 text-xs p-1 rounded-md transition-colors cursor-pointer"
                            title="Delete this lead"
                          >
                            🗑️
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-300 font-medium truncate">
                          {lead.currentRole} • {lead.currentCompany}
                        </p>

                        <div className="text-xs font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/80 p-1.5 rounded-lg truncate border border-primary-200 dark:border-primary-800">
                          {lead.programName}
                        </div>

                        <div className="text-[11px] text-gray-500 dark:text-gray-400 italic truncate">
                          🎯 Goal: {lead.primaryGoal}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-600 text-[11px]">
                          <span className="font-bold text-primary-600 dark:text-primary-400">
                            Fit: {lead.fitScore}%
                          </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            Intent: {lead.intentScore}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRM BULK DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center text-xl font-black mx-auto">
              ⚠️
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                Confirm Lead Deletion
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Are you sure you want to permanently delete <strong className="text-red-600">{selectedIds.length} selected lead(s)</strong> from your CRM pipeline?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirm Delete ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
