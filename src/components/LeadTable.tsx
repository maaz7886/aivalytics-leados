// src/components/LeadTable.tsx
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Stage, Lead } from '../types';
import LeadDetailModal from './LeadDetailModal';

export default function LeadTable() {
  const { leads, setSelectedLeadId, updateLeadStage, deleteLead, deleteBulkLeads, bulkUpdateStage } = useApp();

  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedView, setSelectedView] = useState('All Leads');

  // Multi-selection state for checkboxes
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkStageChoice, setBulkStageChoice] = useState<Stage | ''>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<Lead | null>(null);

  // Filter leads based on search, program, stage, and saved view
  const filteredLeads = leads.filter((lead) => {
    const searchLower = (search || '').toLowerCase();
    const matchesSearch =
      !searchLower ||
      (lead.fullName || '').toLowerCase().includes(searchLower) ||
      (lead.currentRole || '').toLowerCase().includes(searchLower) ||
      (lead.currentCompany || '').toLowerCase().includes(searchLower) ||
      (lead.industry || '').toLowerCase().includes(searchLower) ||
      (lead.phone || '').includes(search) ||
      (lead.email || '').toLowerCase().includes(searchLower);

    const matchesProgram = programFilter === 'All' || (lead.programName || '').includes(programFilter);
    const matchesStage = stageFilter === 'All' || lead.crmStage === stageFilter;

    if (selectedView === 'Hot Leads') return matchesSearch && matchesProgram && matchesStage && lead.leadTemperature === 'Hot';
    if (selectedView === 'High Fit Leads') return matchesSearch && matchesProgram && matchesStage && (lead.fitScore || 0) >= 85;
    if (selectedView === 'Qualified') return matchesSearch && matchesProgram && matchesStage && lead.crmStage === 'Qualified';
    if (selectedView === 'Details Sent') return matchesSearch && matchesProgram && matchesStage && lead.crmStage === 'Details Sent on WhatsApp';
    if (selectedView === 'Payment Pending') return matchesSearch && matchesProgram && matchesStage && (lead.crmStage === 'Payment Pending' || lead.paymentStatus === 'Unpaid');

    return matchesSearch && matchesProgram && matchesStage;
  });

  // Select All Toggle Logic
  const allFilteredIds = filteredLeads.map((l) => l.id);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedLeadIds.includes(id));
  const isSomeSelected = selectedLeadIds.length > 0;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      // Deselect all filtered
      setSelectedLeadIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered
      const combined = Array.from(new Set([...selectedLeadIds, ...allFilteredIds]));
      setSelectedLeadIds(combined);
    }
  };

  const handleLeadCheckboxToggle = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedLeadIds((prev) => [...prev, id]);
    }
  };

  const handleOpenLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setSelectedLeadForModal(lead);
  };

  // Bulk Actions
  const handleExecuteBulkStageChange = (stage: Stage) => {
    if (selectedLeadIds.length === 0 || !stage) return;
    bulkUpdateStage(selectedLeadIds, stage);
    setBulkStageChoice('');
  };

  const handleConfirmBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    deleteBulkLeads(selectedLeadIds);
    setSelectedLeadIds([]);
    setShowDeleteConfirm(false);
  };

  const handleDeleteSingle = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      deleteLead(id);
      setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Export Selected Leads to CSV
  const handleExportSelectedCsv = () => {
    const selectedLeadsList = leads.filter((l) => selectedLeadIds.includes(l.id));
    if (selectedLeadsList.length === 0) return;

    const headers = ['ID', 'Full Name', 'Phone', 'Email', 'City', 'Program', 'Role', 'Company', 'Experience', 'CRM Stage', 'Fit Score', 'Intent Score'];
    const rows = selectedLeadsList.map((l) => [
      l.id,
      `"${l.fullName}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.city}"`,
      `"${l.programName}"`,
      `"${l.currentRole}"`,
      `"${l.currentCompany}"`,
      l.yearsOfExperience,
      `"${l.crmStage}"`,
      l.fitScore,
      l.intentScore
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Aivalytics_Selected_Leads_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <input
            type="text"
            placeholder="Search by name, role, company, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[280px] focus:ring-2 focus:ring-primary-500"
          />

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="All">All Programs Catalog</option>
            <option value="Project Management">Project Management</option>
            <option value="GTM">GTM & Growth</option>
            <option value="Fellowship">Fellowship</option>
          </select>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="All">All CRM Stages</option>
            <option value="Lead">Lead (New Incoming)</option>
            <option value="Interested">Interested</option>
            <option value="Qualified">Qualified</option>
            <option value="Details Sent on WhatsApp">Details sent</option>
            <option value="Joined Session">Seat Reserved</option>
            <option value="Converted">Enrolled</option>
            <option value="Didn't attempt the call">Didn't attempt call</option>
            <option value="Not Interested">Not interested</option>
            <option value="Unqualified">Not qualified</option>
            <option value="Invalid number">Invalid number</option>
          </select>
        </div>

        {/* Saved Views Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-gray-400 font-bold mr-1">Views:</span>
          {['All Leads', 'Hot Leads', 'High Fit Leads', 'Qualified', 'Details Sent', 'Payment Pending'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedView === view
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR (Sticky when items checked) */}
      {isSomeSelected && (
        <div className="p-3 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-primary-600 text-white font-extrabold text-xs rounded-lg shadow-xs">
              ✓ {selectedLeadIds.length} Selected
            </span>
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-xs font-semibold text-gray-400 hover:text-white underline cursor-pointer"
            >
              Clear Selection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bulk Stage Updater Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-800 p-1 rounded-lg border border-gray-700">
              <span className="text-xs font-bold text-gray-300 pl-1">Move to Stage:</span>
              <select
                value={bulkStageChoice}
                onChange={(e) => {
                  const val = e.target.value as Stage;
                  setBulkStageChoice(val);
                  if (val) handleExecuteBulkStageChange(val);
                }}
                className="px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded border border-gray-600 focus:ring-1 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">-- Choose Stage --</option>
                <option value="Lead">Lead</option>
                <option value="Interested">Interested</option>
                <option value="Qualified">Qualified</option>
                <option value="Details Sent on WhatsApp">Details sent</option>
                <option value="Joined Session">Seat Reserved</option>
                <option value="Converted">Enrolled</option>
                <option value="Didn't attempt the call">Didn't attempt call</option>
                <option value="Not Interested">Not interested</option>
                <option value="Unqualified">Not qualified</option>
                <option value="Invalid number">Invalid number</option>
              </select>
            </div>

            {/* Export Selected */}
            <button
              onClick={handleExportSelectedCsv}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold rounded-lg border border-gray-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>📥</span> Export CSV ({selectedLeadIds.length})
            </button>

            {/* Delete Selected Leads Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>🗑️</span> Delete Selected ({selectedLeadIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-bold uppercase tracking-wider">
              {/* SELECT ALL CHECKBOX */}
              <th className="p-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAllToggle}
                  title="Select All Visible Leads"
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 cursor-pointer"
                />
              </th>
              <th className="p-3.5">Lead Name</th>
              <th className="p-3.5">Program</th>
              <th className="p-3.5">Current Role</th>
              <th className="p-3.5">Exp</th>
              <th className="p-3.5">Primary Goal</th>
              <th className="p-3.5 text-center">Fit Score</th>
              <th className="p-3.5 text-center">Intent Score</th>
              <th className="p-3.5">CRM Stage</th>
              <th className="p-3.5">Assigned Salesperson</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-gray-500 italic">
                  No leads found matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const isChecked = selectedLeadIds.includes(lead.id);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => handleOpenLead(lead)}
                    className={`transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-primary-50/60 dark:bg-primary-950/40'
                        : 'hover:bg-primary-50/30 dark:hover:bg-primary-950/20'
                    }`}
                  >
                    {/* ROW CHECKBOX */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleLeadCheckboxToggle(lead.id)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 font-bold text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-1.5">
                        <span className="hover:text-primary-600">{lead.fullName}</span>
                      </div>
                      <div className="text-xs font-normal text-gray-400">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${lead.phone.replace(/[^0-9+]/g, '')}`, '_self');
                          }}
                          className="hover:underline hover:text-emerald-600"
                        >
                          📞 {lead.phone}
                        </span>{' '}
                        • {lead.city}
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-gray-800 dark:text-gray-200">{lead.programName}</td>
                    <td className="p-3.5 text-gray-700 dark:text-gray-300">
                      <div>{lead.currentRole}</div>
                      <div className="text-xs text-gray-400">{lead.currentCompany}</div>
                    </td>
                    <td className="p-3.5 font-medium">{lead.yearsOfExperience} yrs</td>
                    <td className="p-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300">{lead.primaryGoal}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-1 rounded bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-extrabold text-xs border border-primary-200 dark:border-primary-800">
                        {lead.fitScore}/100
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800">
                        {lead.intentScore}/100
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={lead.crmStage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                        className="px-2 py-1 border rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-1 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Interested">Interested</option>
                        <option value="Call Later">Call Later</option>
                        <option value="Did Not Pick The Call">Did Not Pick The Call</option>
                        <option value="Not Interested">Not Interested</option>
                        <option value="Unqualified">Unqualified</option>
                        <option value="Details Sent on WhatsApp">Details Sent</option>
                        <option value="Payment Pending">Payment Pending</option>
                        <option value="Joined Session">Seat Reserved</option>
                        <option value="Converted">Enrolled</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-xs text-gray-500">{lead.assignedSalesperson || 'Alex Rivera'}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenLead(lead);
                          }}
                          className="px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          👁️ Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSingle(lead.id, lead.fullName);
                          }}
                          title="Delete Lead"
                          className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 text-gray-500 rounded-lg transition-all cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
                Are you sure you want to permanently remove <strong className="text-red-600">{selectedLeadIds.length} lead(s)</strong>? This action will remove them from React state and your live Supabase Cloud database.
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
                Confirm Delete ({selectedLeadIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAD DETAILS & STAGE MOVER MODAL */}
      <LeadDetailModal
        lead={selectedLeadForModal ? leads.find(l => l.id === selectedLeadForModal.id) || selectedLeadForModal : null}
        isOpen={!!selectedLeadForModal}
        onClose={() => setSelectedLeadForModal(null)}
        onStageChange={(newStage) => updateLeadStage(selectedLeadForModal!.id, newStage)}
      />
    </div>
  );
}
