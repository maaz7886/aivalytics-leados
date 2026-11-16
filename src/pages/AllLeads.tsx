// src/pages/AllLeads.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import { DataTable, ALL_COLUMNS } from '../components/ui/DataTable';
import { KanbanView } from '../components/ui/KanbanView';
import { CalendarView } from '../components/ui/CalendarView';
import { SidePanel } from '../components/ui/SidePanel';
import { LeadPanel } from '../components/LeadPanel';
import { LostReasonModal } from '../components/LostReasonModal';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Button } from '../components/ui/Button';
import {
  Filter,
  ArrowUpDown,
  FolderTree,
  EyeOff,
  Rows,
  Plus,
  Search,
  X,
  Check,
  Download
} from 'lucide-react';
import {
  getUserViewPrefs,
  setUserViewPrefs
} from '../utils/tableFormatters';
import type { UserViewPreferences } from '../utils/tableFormatters';

const VIEW_NAMES: Record<string, string> = {
  all: 'All leads',
  unassigned: 'Unassigned',
  today: 'My follow-ups today',
  overdue: 'Overdue leads',
  hot: 'Hot leads',
  payment_pending: 'Payment pending',
  enrolled: 'Enrolled',
  lost: 'Lost leads'
};

interface FilterCondition {
  id: string;
  field: string;
  operator: 'is' | 'is_not' | 'contains' | 'is_empty';
  value: string;
}

export default function AllLeads() {
  const {
    allLeads,
    leads,
    salespeople,
    assignLead,
    bulkAssignLeads,
    updateLeadStage,
    bulkUpdateStage,
    updateLead,
    addLead,
    currentUser,
    customFields
  } = useApp();

  const leadsPool = allLeads || leads || [];
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const activeSavedView = searchParams.get('view') || 'all';
  const urlLeadId = searchParams.get('lead');

  const isAdmin = currentUser?.role === 'Admin';
  const currentUserId = currentUser?.id || 'default_user';

  // Stored preferences per view
  const [viewPrefs, setViewPrefs] = useState<UserViewPreferences>(() => {
    return (
      getUserViewPrefs(activeSavedView, currentUserId) || {
        visibleColumns: ALL_COLUMNS.map((c) => c.id),
        columnOrder: ALL_COLUMNS.map((c) => c.id),
        columnWidths: {},
        sortBy: [{ field: 'created', direction: 'desc' }],
        groupBy: 'stage',
        rowHeight: 'default'
      }
    );
  });

  // Re-load preferences when active view changes
  useEffect(() => {
    const loaded = getUserViewPrefs(activeSavedView, currentUserId);
    if (loaded) {
      setViewPrefs(loaded);
    } else {
      setViewPrefs({
        visibleColumns: ALL_COLUMNS.map((c) => c.id),
        columnOrder: ALL_COLUMNS.map((c) => c.id),
        columnWidths: {},
        sortBy: [{ field: 'created', direction: 'desc' }],
        groupBy: 'stage',
        rowHeight: 'default'
      });
    }
  }, [activeSavedView, currentUserId]);

  const updateAndSavePrefs = (partial: Partial<UserViewPreferences>) => {
    setViewPrefs((prev) => {
      const next = { ...prev, ...partial };
      setUserViewPrefs(activeSavedView, currentUserId, next);
      return next;
    });
  };

  // Step 2C: Dynamic columns including active Custom Fields
  const availableColumns = useMemo(() => {
    const cfCols = (customFields || []).filter((f) => f.active).map((f) => ({
      id: `cf_${f.key}`,
      label: f.label,
      defaultWidth: 150,
      minWidth: 110,
      sortable: true
    }));
    return [...ALL_COLUMNS, ...cfCols];
  }, [customFields]);

  // Top Bar Segmented Control: Grid | Kanban | Calendar
  const urlMode = (searchParams.get('mode') as 'grid' | 'kanban' | 'calendar') || 'grid';
  const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'calendar'>(urlMode);

  useEffect(() => {
    const m = searchParams.get('mode') as 'grid' | 'kanban' | 'calendar';
    if (m && ['grid', 'kanban', 'calendar'].includes(m)) {
      setViewMode(m);
    }
  }, [location.search]);

  const handleViewModeChange = (mode: 'grid' | 'kanban' | 'calendar') => {
    setViewMode(mode);
    const params = new URLSearchParams(location.search);
    if (mode === 'grid') {
      params.delete('mode');
    } else {
      params.set('mode', mode);
    }
    navigate(`?${params.toString()}`);
  };

  // Search query with 300ms debounce
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Toolbar Popover Open States
  const [activePopover, setActivePopover] = useState<'filter' | 'sort' | 'group' | 'hide' | 'rowHeight' | null>(null);

  // Filter conditions state
  const [customFilters, setCustomFilters] = useState<FilterCondition[]>([]);

  // Selection & Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkActionTarget, setBulkActionTarget] = useState<'stage' | 'assign' | 'temp' | null>(null);

  // Lost Reason Modal State
  const [lostTargetLead, setLostTargetLead] = useState<Lead | null>(null);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);

  // Add Lead Modal State
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadProgram, setNewLeadProgram] = useState('AI-Native Project Management');

  // Close Popovers on Outside Click
  const toolbarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filtered Leads based on Saved View, Custom Filters, and Search
  const filteredLeads = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    return leadsPool.filter((l) => {
      // 1. Saved View Preset Criteria
      if (activeSavedView === 'unassigned') {
        if (l.assignedSalesperson && l.assignedSalesperson !== 'Unassigned' && l.assignedSalesperson.trim() !== '') {
          return false;
        }
      } else if (activeSavedView === 'today') {
        const due = l.nextTask?.dueDateTime || l.nextFollowUp || '';
        const isAssignedToMe = l.assignedSalesperson === currentUser.name;
        if (!due.startsWith(todayStr) || (!isAdmin && !isAssignedToMe)) return false;
      } else if (activeSavedView === 'overdue') {
        const due = l.nextTask?.dueDateTime || l.nextFollowUp || '';
        const isClosed = l.crmStage === 'Lost' || l.crmStage === 'Unqualified' || l.crmStage === 'Converted';
        if (isClosed || !due || new Date(due).getTime() >= now.getTime()) return false;
      } else if (activeSavedView === 'hot') {
        const temp = (l as any).temperature || (l as any).leadTemperature || 'Warm';
        if (temp !== 'Hot' && l.crmStage !== 'Interested' && l.crmStage !== 'Qualified') return false;
      } else if (activeSavedView === 'payment_pending') {
        if (
          l.crmStage !== 'Payment Pending' &&
          l.crmStage !== 'Payment Discussion' &&
          l.paymentState !== 'Payment link sent'
        ) {
          return false;
        }
      } else if (activeSavedView === 'enrolled') {
        if (l.crmStage !== 'Converted' && l.enrollmentStatus !== 'Enrolled' && l.paymentStatus !== 'Paid') return false;
      } else if (activeSavedView === 'lost') {
        if (l.crmStage !== 'Lost' && l.crmStage !== 'Unqualified' && l.crmStage !== 'Not Interested') return false;
      }

      // 2. Custom Filter Conditions (AND combined)
      for (const cond of customFilters) {
        let fieldVal = '';
        if (cond.field.startsWith('cf_')) {
          const k = cond.field.replace('cf_', '');
          fieldVal = String(l.customFields?.[k] ?? (l as any)[k] ?? '');
        } else if (cond.field === 'stage') fieldVal = l.crmStage || '';
        else if (cond.field === 'owner') fieldVal = l.assignedSalesperson || '';
        else if (cond.field === 'program') fieldVal = l.programName || '';
        else if (cond.field === 'temperature') fieldVal = (l as any).temperature || (l as any).leadTemperature || 'Warm';
        else if (cond.field === 'source') fieldVal = l.source || '';
        else if (cond.field === 'campaign') fieldVal = l.metaCampaign || '';

        const valLower = fieldVal.toLowerCase();
        const condValLower = cond.value.toLowerCase();

        if (cond.operator === 'is' && valLower !== condValLower) return false;
        if (cond.operator === 'is_not' && valLower === condValLower) return false;
        if (cond.operator === 'contains' && !valLower.includes(condValLower)) return false;
        if (cond.operator === 'is_empty' && fieldVal.trim() !== '') return false;
      }

      // 3. Search input (name / phone / email)
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const matchName = l.fullName?.toLowerCase().includes(q);
        const matchPhone = l.phone?.replace(/\D/g, '').includes(q.replace(/\D/g, ''));
        const matchEmail = l.email?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }

      return true;
    });
  }, [leadsPool, activeSavedView, customFilters, debouncedSearch, currentUser, isAdmin]);

  // Lead Panel Navigation
  const handleOpenLead = (lead: Lead) => {
    const params = new URLSearchParams(location.search);
    params.set('lead', lead.id);
    navigate(`?${params.toString()}`);
  };

  const handleCloseLead = () => {
    const params = new URLSearchParams(location.search);
    params.delete('lead');
    navigate(`?${params.toString()}`);
  };

  const currentLeadIndex = filteredLeads.findIndex((l) => l.id === urlLeadId);
  const hasNextLead = currentLeadIndex >= 0 && currentLeadIndex < filteredLeads.length - 1;
  const hasPrevLead = currentLeadIndex > 0;

  const handleNextLead = () => {
    if (hasNextLead) {
      handleOpenLead(filteredLeads[currentLeadIndex + 1]);
    }
  };

  const handlePrevLead = () => {
    if (hasPrevLead) {
      handleOpenLead(filteredLeads[currentLeadIndex - 1]);
    }
  };

  // Selection handlers
  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  // Bulk Actions
  const handleBulkStageChange = (newStage: Stage) => {
    if (selectedLeadIds.length > 20) {
      if (!window.confirm(`Are you sure you want to change the stage of ${selectedLeadIds.length} leads?`)) {
        return;
      }
    }
    bulkUpdateStage(selectedLeadIds, newStage);
    setSelectedLeadIds([]);
    setBulkActionTarget(null);
  };

  const handleBulkAssign = (salespersonName: string) => {
    if (!isAdmin) return;
    if (selectedLeadIds.length > 20) {
      if (!window.confirm(`Are you sure you want to reassign ${selectedLeadIds.length} leads?`)) {
        return;
      }
    }
    bulkAssignLeads(selectedLeadIds, salespersonName);
    setSelectedLeadIds([]);
    setBulkActionTarget(null);
  };

  const handleBulkTemperature = (temp: 'Hot' | 'Warm' | 'Cold') => {
    selectedLeadIds.forEach((id) => {
      updateLead(id, { temperature: temp } as any);
    });
    setSelectedLeadIds([]);
    setBulkActionTarget(null);
  };

  const handleExportCSV = () => {
    if (!isAdmin) return;
    const leadsToExport = filteredLeads.filter((l) => selectedLeadIds.includes(l.id));
    const rows = [
      ['Name', 'Phone', 'Email', 'Program', 'Stage', 'Owner', 'City', 'Created'].join(','),
      ...leadsToExport.map((l) =>
        [
          `"${l.fullName}"`,
          `"${l.phone}"`,
          `"${l.email}"`,
          `"${l.programName}"`,
          `"${l.crmStage}"`,
          `"${l.assignedSalesperson}"`,
          `"${l.city}"`,
          `"${l.dateCaptured}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add Lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    addLead({
      id: `lead-manual-${Date.now()}`,
      fullName: newLeadName,
      phone: newLeadPhone,
      email: newLeadEmail,
      programName: newLeadProgram,
      crmStage: 'New Lead',
      assignedSalesperson: isAdmin ? '' : currentUser.name,
      source: 'Direct Manual Entry',
      dateCaptured: new Date().toISOString()
    } as any);

    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    setIsAddLeadModalOpen(false);
  };

  // Lost Reason Callback
  const handleConfirmLostReason = (reason: string, notes?: string) => {
    if (!lostTargetLead) return;
    updateLead(lostTargetLead.id, {
      crmStage: 'Lost',
      objection: reason,
      comments: (lostTargetLead.comments ? `${lostTargetLead.comments}\n` : '') + `[Lost Reason: ${reason}] ${notes || ''}`
    });
    setLostTargetLead(null);
    setIsLostModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-hidden relative text-[#1F1F1D]">
      {/* =====================================================
          A. TOP BAR (One row, wraps on small screens)
         ===================================================== */}
      <div
        ref={toolbarRef}
        className="px-4 py-2.5 border-b border-[#E6E6E3] bg-white flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-20"
      >
        {/* Left: View title + count */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D]">
              {VIEW_NAMES[activeSavedView] || 'Leads'}
            </h1>
            <span className="text-[13px] text-[#6B6B66] tabular-nums font-normal">
              {filteredLeads.length} leads
            </span>
          </div>

          {/* SegmentedControl: Grid | Kanban | Calendar */}
          <SegmentedControl
            options={[
              { value: 'grid', label: 'Grid' },
              { value: 'kanban', label: 'Kanban' },
              { value: 'calendar', label: 'Calendar' }
            ]}
            value={viewMode}
            onChange={(val) => handleViewModeChange(val as any)}
          />
        </div>

        {/* Middle Toolbar: Ghost buttons (32px tall) */}
        <div className="flex items-center gap-1">
          {/* Filter Popover Toggle */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'filter' ? null : 'filter')}
            className={`h-8 px-2.5 text-xs font-medium rounded-[6px] flex items-center gap-1.5 transition-colors ${
              customFilters.length > 0 || activePopover === 'filter'
                ? 'bg-[#EEF0FD] text-[#3B4BDB]'
                : 'text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {customFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#3B4BDB] text-white text-[10px] flex items-center justify-center tabular-nums">
                {customFilters.length}
              </span>
            )}
          </button>

          {/* Sort Popover Toggle */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'sort' ? null : 'sort')}
            className={`h-8 px-2.5 text-xs font-medium rounded-[6px] flex items-center gap-1.5 transition-colors ${
              activePopover === 'sort'
                ? 'bg-[#EEF0FD] text-[#3B4BDB]'
                : 'text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6]'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort</span>
          </button>

          {/* Group Popover Toggle */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'group' ? null : 'group')}
            className={`h-8 px-2.5 text-xs font-medium rounded-[6px] flex items-center gap-1.5 transition-colors ${
              viewPrefs.groupBy !== 'none' || activePopover === 'group'
                ? 'bg-[#EEF0FD] text-[#3B4BDB]'
                : 'text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Group</span>
          </button>

          {/* Hide fields Popover Toggle */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'hide' ? null : 'hide')}
            className={`h-8 px-2.5 text-xs font-medium rounded-[6px] flex items-center gap-1.5 transition-colors ${
              activePopover === 'hide'
                ? 'bg-[#EEF0FD] text-[#3B4BDB]'
                : 'text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6]'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hide fields</span>
          </button>

          {/* Row height Toggle */}
          <button
            type="button"
            onClick={() => setActivePopover(activePopover === 'rowHeight' ? null : 'rowHeight')}
            className={`h-8 px-2.5 text-xs font-medium rounded-[6px] flex items-center gap-1.5 transition-colors ${
              activePopover === 'rowHeight'
                ? 'bg-[#EEF0FD] text-[#3B4BDB]'
                : 'text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-[#F3F4F6]'
            }`}
          >
            <Rows className="w-3.5 h-3.5" />
            <span>Row height</span>
          </button>
        </div>

        {/* Right: Search box (300ms debounce) + Add lead */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6B6B66] absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search view..."
              className="w-44 h-8 pl-8 pr-2.5 bg-[#F7F7F5] border border-[#E6E6E3] focus:border-[#3B4BDB] rounded-[6px] text-xs text-[#1F1F1D] outline-none"
            />
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsAddLeadModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add lead</span>
          </Button>
        </div>

        {/* ================= POPOVERS ================= */}
        {/* 1. Filter Popover */}
        {activePopover === 'filter' && (
          <div className="absolute top-14 left-44 z-50 w-80 bg-white border border-[#E6E6E3] rounded-[8px] shadow-lg p-3 space-y-3 text-xs animate-in fade-in duration-150">
            <div className="font-semibold text-[#1F1F1D] flex items-center justify-between">
              <span>Filter records</span>
              <button onClick={() => setActivePopover(null)} className="text-[#6B6B66] hover:text-[#1F1F1D]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Conditions List */}
            <div className="space-y-2">
              {customFilters.map((cond, idx) => (
                <div key={cond.id} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#6B6B66] w-6">{idx === 0 ? 'Where' : 'And'}</span>
                  <select
                    value={cond.field}
                    onChange={(e) => {
                      const updated = [...customFilters];
                      updated[idx].field = e.target.value as any;
                      setCustomFilters(updated);
                    }}
                    className="h-7 px-1.5 bg-white border border-[#E6E6E3] rounded text-[11px] outline-none"
                  >
                    <option value="stage">Stage</option>
                    <option value="owner">Owner</option>
                    <option value="program">Program</option>
                    <option value="temperature">Temperature</option>
                    <option value="source">Source</option>
                    <option value="campaign">Campaign</option>
                    {customFields && customFields.length > 0 && (
                      <optgroup label="Custom Fields">
                        {customFields.filter(f => f.active).map(f => (
                          <option key={f.key} value={`cf_${f.key}`}>
                            {f.label}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  <select
                    value={cond.operator}
                    onChange={(e) => {
                      const updated = [...customFilters];
                      updated[idx].operator = e.target.value as any;
                      setCustomFilters(updated);
                    }}
                    className="h-7 px-1.5 bg-white border border-[#E6E6E3] rounded text-[11px] outline-none"
                  >
                    <option value="is">is</option>
                    <option value="is_not">is not</option>
                    <option value="contains">contains</option>
                    <option value="is_empty">is empty</option>
                  </select>

                  <input
                    type="text"
                    value={cond.value}
                    placeholder="value..."
                    onChange={(e) => {
                      const updated = [...customFilters];
                      updated[idx].value = e.target.value;
                      setCustomFilters(updated);
                    }}
                    className="h-7 px-1.5 w-24 bg-white border border-[#E6E6E3] rounded text-[11px] outline-none"
                  />

                  <button
                    onClick={() => setCustomFilters(customFilters.filter((_, i) => i !== idx))}
                    className="text-[#6B6B66] hover:text-[#B42318] p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#E6E6E3]">
              <button
                type="button"
                onClick={() =>
                  setCustomFilters([
                    ...customFilters,
                    { id: `c-${Date.now()}`, field: 'stage', operator: 'is', value: 'Interested' }
                  ])
                }
                className="text-[#3B4BDB] hover:underline font-medium text-xs"
              >
                + Add condition
              </button>

              {customFilters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomFilters([])}
                  className="text-[#B42318] hover:underline text-xs"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. Group Popover */}
        {activePopover === 'group' && (
          <div className="absolute top-14 left-72 z-50 w-52 bg-white border border-[#E6E6E3] rounded-[8px] shadow-lg p-2 text-xs space-y-1 animate-in fade-in duration-150">
            <div className="px-2 py-1 text-[11px] font-semibold text-[#6B6B66] uppercase">Group by</div>
            {[
              { id: 'stage', label: 'Stage' },
              { id: 'owner', label: 'Owner' },
              { id: 'program', label: 'Program' },
              { id: 'temperature', label: 'Temperature' },
              { id: 'source', label: 'Source' },
              { id: 'none', label: 'None (flat list)' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  updateAndSavePrefs({ groupBy: opt.id as any });
                  setActivePopover(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-[4px] flex items-center justify-between ${
                  viewPrefs.groupBy === opt.id
                    ? 'bg-[#EEF0FD] text-[#3B4BDB] font-medium'
                    : 'hover:bg-[#F3F4F6] text-[#1F1F1D]'
                }`}
              >
                <span>{opt.label}</span>
                {viewPrefs.groupBy === opt.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}

        {/* 3. Hide fields Popover */}
        {activePopover === 'hide' && (
          <div className="absolute top-14 left-80 z-50 w-64 bg-white border border-[#E6E6E3] rounded-[8px] shadow-lg p-2.5 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="font-semibold text-[#1F1F1D] px-1">Column Visibility</div>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {availableColumns.filter((c) => c.id !== 'select' && c.id !== 'name').map((col) => {
                const isChecked = viewPrefs.visibleColumns.includes(col.id);
                const isCustom = col.id.startsWith('cf_');
                return (
                  <label
                    key={col.id}
                    className="flex items-center justify-between px-1.5 py-1 hover:bg-[#F3F4F6] rounded cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const nextCols = isChecked
                            ? viewPrefs.visibleColumns.filter((id) => id !== col.id)
                            : [...viewPrefs.visibleColumns, col.id];
                          updateAndSavePrefs({ visibleColumns: nextCols });
                        }}
                        className="rounded border-[#E6E6E3] text-[#3B4BDB] focus:ring-0"
                      />
                      <span className="text-xs text-[#1F1F1D]">{col.label}</span>
                    </div>
                    {isCustom && (
                      <span className="text-[10px] text-[#3B4BDB] bg-[#EEF0FD] px-1 py-0.2 rounded font-medium">
                        Custom
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Row Height Popover */}
        {activePopover === 'rowHeight' && (
          <div className="absolute top-14 left-96 z-50 w-44 bg-white border border-[#E6E6E3] rounded-[8px] shadow-lg p-1.5 text-xs space-y-0.5 animate-in fade-in duration-150">
            {[
              { id: 'compact', label: 'Compact (32px)' },
              { id: 'default', label: 'Default (40px)' },
              { id: 'tall', label: 'Tall (56px)' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  updateAndSavePrefs({ rowHeight: opt.id as any });
                  setActivePopover(null);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-[4px] flex items-center justify-between ${
                  viewPrefs.rowHeight === opt.id
                    ? 'bg-[#EEF0FD] text-[#3B4BDB] font-medium'
                    : 'hover:bg-[#F3F4F6] text-[#1F1F1D]'
                }`}
              >
                <span>{opt.label}</span>
                {viewPrefs.rowHeight === opt.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}

        {/* 5. Sort Popover */}
        {activePopover === 'sort' && (
          <div className="absolute top-14 left-60 z-50 w-64 bg-white border border-[#E6E6E3] rounded-[8px] shadow-lg p-3 text-xs space-y-2 animate-in fade-in duration-150">
            <div className="font-semibold text-[#1F1F1D]">Sort records</div>
            <div className="space-y-1.5">
              <div className="text-[11px] text-[#6B6B66]">Sort by Due date or Created</div>
              <button
                onClick={() => {
                  updateAndSavePrefs({ sortBy: [{ field: 'due', direction: 'asc' }] });
                  setActivePopover(null);
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-[#F3F4F6]"
              >
                Due date (earliest first)
              </button>
              <button
                onClick={() => {
                  updateAndSavePrefs({ sortBy: [{ field: 'created', direction: 'desc' }] });
                  setActivePopover(null);
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-[#F3F4F6]"
              >
                Created date (newest first)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          ACTIVE FILTERS PILL BAR (Removable pills)
         ===================================================== */}
      {customFilters.length > 0 && (
        <div className="px-4 py-1.5 bg-[#F7F7F5] border-b border-[#E6E6E3] flex items-center gap-2 overflow-x-auto shrink-0 text-xs">
          <span className="text-[#6B6B66] text-[11px] font-medium">Active filters:</span>
          {customFilters.map((cond, idx) => (
            <span
              key={cond.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-white border border-[#E6E6E3] text-[#1F1F1D] text-xs"
            >
              <span className="font-medium capitalize">{cond.field}</span>
              <span className="text-[#6B6B66]">{cond.operator.replace('_', ' ')}</span>
              <span className="font-semibold">{cond.value || '""'}</span>
              <button
                onClick={() => setCustomFilters(customFilters.filter((_, i) => i !== idx))}
                className="text-[#6B6B66] hover:text-[#B42318] ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            onClick={() => setCustomFilters([])}
            className="text-[#3B4BDB] hover:underline text-xs font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* =====================================================
          B. MAIN VIEW CONTENT (Grid | Kanban | Calendar)
         ===================================================== */}
      <div className="flex-1 min-h-0 relative">
        {viewMode === 'grid' && (
          <DataTable
            leads={filteredLeads}
            selectedLeadIds={selectedLeadIds}
            onToggleSelectLead={handleToggleSelectLead}
            onSelectAllVisible={handleSelectAllVisible}
            isAllVisibleSelected={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
            selectedLeadId={urlLeadId}
            onOpenLead={handleOpenLead}
            onUpdateStage={(id, stage) => updateLeadStage(id, stage)}
            onUpdateOwner={(id, owner) => assignLead(id, owner)}
            onUpdateTemperature={(id, temp) => updateLead(id, { temperature: temp } as any)}
            onRequestLostReason={(lead) => {
              setLostTargetLead(lead);
              setIsLostModalOpen(true);
            }}
            visibleColumns={viewPrefs.visibleColumns}
            columnWidths={viewPrefs.columnWidths}
            onColumnWidthChange={(colId, w) => {
              updateAndSavePrefs({
                columnWidths: { ...viewPrefs.columnWidths, [colId]: w }
              });
            }}
            rowHeight={viewPrefs.rowHeight}
            groupBy={viewPrefs.groupBy}
            isFiltered={customFilters.length > 0 || debouncedSearch.trim() !== ''}
            onClearFilters={() => {
              setCustomFilters([]);
              setSearchInput('');
            }}
            isAdmin={isAdmin}
            salespeople={salespeople}
            customFields={customFields}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            leads={filteredLeads}
            onOpenLead={handleOpenLead}
            onUpdateStage={(id, stage) => updateLeadStage(id, stage)}
            onRequestLostReason={(lead) => {
              setLostTargetLead(lead);
              setIsLostModalOpen(true);
            }}
            isAdmin={isAdmin}
            onAddLeadInStage={() => setIsAddLeadModalOpen(true)}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView
            leads={filteredLeads}
            onOpenLead={handleOpenLead}
          />
        )}
      </div>

      {/* =====================================================
          E. BULK ACTIONS FLOATING BAR (Appears when 1+ rows checked)
         ===================================================== */}
      {selectedLeadIds.length > 0 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#1F1F1D] text-white px-4 py-2.5 rounded-[8px] shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-200">
          <span className="font-semibold tabular-nums text-white">
            {selectedLeadIds.length} selected
          </span>

          <span className="text-[#6B6B66]">|</span>

          {/* Assign to... (Admin only) */}
          {isAdmin && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setBulkActionTarget(bulkActionTarget === 'assign' ? null : 'assign')}
                className="hover:text-white/80 font-medium"
              >
                Assign to…
              </button>
              {bulkActionTarget === 'assign' && (
                <div className="absolute bottom-8 left-0 w-44 bg-white text-[#1F1F1D] border border-[#E6E6E3] rounded-[6px] shadow-lg p-1.5 space-y-1">
                  {salespeople.map((rep) => (
                    <button
                      key={rep.id}
                      onClick={() => handleBulkAssign(rep.name)}
                      className="w-full text-left px-2 py-1 text-xs hover:bg-[#F3F4F6] rounded"
                    >
                      {rep.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change stage */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBulkActionTarget(bulkActionTarget === 'stage' ? null : 'stage')}
              className="hover:text-white/80 font-medium"
            >
              Change stage…
            </button>
            {bulkActionTarget === 'stage' && (
              <div className="absolute bottom-8 left-0 w-44 bg-white text-[#1F1F1D] border border-[#E6E6E3] rounded-[6px] shadow-lg p-1.5 space-y-1">
                {['Interested', 'Qualified', 'Payment Pending', 'Lost'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleBulkStageChange(st as Stage)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-[#F3F4F6] rounded"
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Change temperature */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBulkActionTarget(bulkActionTarget === 'temp' ? null : 'temp')}
              className="hover:text-white/80 font-medium"
            >
              Change temperature…
            </button>
            {bulkActionTarget === 'temp' && (
              <div className="absolute bottom-8 left-0 w-32 bg-white text-[#1F1F1D] border border-[#E6E6E3] rounded-[6px] shadow-lg p-1.5 space-y-1">
                {(['Hot', 'Warm', 'Cold'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleBulkTemperature(t)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-[#F3F4F6] rounded"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV (Admin only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="hover:text-white/80 font-medium flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Deselect All */}
          <button
            type="button"
            onClick={() => setSelectedLeadIds([])}
            className="text-white/60 hover:text-white p-1 ml-1"
            title="Deselect all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================
          F. 480PX LEAD SIDE PANEL (Grid stays visible & usable behind it)
         ===================================================== */}
      <SidePanel isOpen={Boolean(urlLeadId)} onClose={handleCloseLead}>
        <LeadPanel
          leadId={urlLeadId}
          onClose={handleCloseLead}
          onNext={handleNextLead}
          onPrev={handlePrevLead}
          hasNext={hasNextLead}
          hasPrev={hasPrevLead}
        />
      </SidePanel>

      {/* LOST REASON MODAL */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        leadName={lostTargetLead?.fullName}
        onClose={() => {
          setIsLostModalOpen(false);
          setLostTargetLead(null);
        }}
        onConfirm={handleConfirmLostReason}
      />

      {/* ADD LEAD MODAL */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[420px] bg-white border border-[#E6E6E3] rounded-[8px] shadow-xl p-5 text-[#1F1F1D] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
              <span className="font-semibold text-sm">Add New Lead</span>
              <button onClick={() => setIsAddLeadModalOpen(false)}>
                <X className="w-4 h-4 text-[#6B6B66]" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-[#1F1F1D] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Seth"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#1F1F1D] block mb-1">Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#1F1F1D] block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="vikram@example.com"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#1F1F1D] block mb-1">Program</label>
                <select
                  value={newLeadProgram}
                  onChange={(e) => setNewLeadProgram(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
                >
                  <option value="AI-Native Project Management">AI-Native Project Management</option>
                  <option value="3-Day AI Builder Workshop">3-Day AI Builder Workshop</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddLeadModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
