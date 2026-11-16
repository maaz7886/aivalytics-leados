// src/pages/AllLeads.tsx
import { useState, useMemo, Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import { LeadSidePanel } from '../components/LeadSidePanel';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { EmptyState } from '../components/EmptyState';
import {
  LayoutGrid,
  Columns,
  Calendar,
  Filter,
  Plus,
  Search,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { calculate48HourWorkingSla } from '../utils/cadenceUtils';

export default function AllLeads() {
  const {
    allLeads,
    leads,
    salespeople,
    assignLead,
    updateLeadStage,
    updateLead,
    addLead,
    currentUser
  } = useApp();

  const leadsPool = allLeads || leads || [];
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const activeSavedView = searchParams.get('view') || 'all';

  // Local state for interactive table
  const [viewType, setViewType] = useState<'grid' | 'kanban' | 'calendar'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [groupBy, setGroupBy] = useState<'stage' | 'owner' | 'none'>('stage');
  const [sortBy, setSortBy] = useState<'created_desc' | 'due_asc' | 'name_asc'>('created_desc');
  const [rowHeight, setRowHeight] = useState<'compact' | 'normal' | 'relaxed'>('normal');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Quick filter bar toggle
  const [showFilters, setShowFilters] = useState(false);
  const [filterStage, setFilterStage] = useState('All');
  const [filterRep, setFilterRep] = useState('All');
  const [filterProgram, setFilterProgram] = useState('All');

  // Add lead modal state
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadProgram, setNewLeadProgram] = useState('AI-Native PM');

  // View Names lookup
  const viewNames: Record<string, string> = {
    all: 'All leads',
    unassigned: 'Unassigned',
    today: 'My follow-ups today',
    overdue: 'Overdue',
    hot: 'Hot leads',
    payment_pending: 'Payment pending',
    enrolled: 'Enrolled',
    lost: 'Lost'
  };

  // 1. Filter Leads by Saved View and Search
  const filteredLeads = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    return leadsPool.filter((l) => {
      // Saved View Filter
      if (activeSavedView === 'unassigned') {
        if (l.assignedSalesperson && l.assignedSalesperson !== 'Unassigned') return false;
      } else if (activeSavedView === 'today') {
        const due = l.nextTask?.dueDateTime || l.nextFollowUp || '';
        if (!due.startsWith(todayStr)) return false;
      } else if (activeSavedView === 'overdue') {
        const due = l.nextTask?.dueDateTime || l.nextFollowUp || '';
        const isClosed = l.crmStage === 'Lost' || l.crmStage === 'Unqualified' || l.crmStage === 'Converted' || l.enrollmentStatus === 'Enrolled';
        if (isClosed || !due || new Date(due).getTime() >= now.getTime()) return false;
      } else if (activeSavedView === 'hot') {
        const temp = (l as any).temperature || (l as any).leadTemperature || 'Warm';
        if (temp !== 'Hot' && l.crmStage !== 'Interested' && l.crmStage !== 'Qualified') return false;
      } else if (activeSavedView === 'payment_pending') {
        if (l.crmStage !== 'Payment Pending' && l.crmStage !== 'Payment Discussion' && l.paymentState !== 'Payment link sent') return false;
      } else if (activeSavedView === 'enrolled') {
        if (l.crmStage !== 'Converted' && l.enrollmentStatus !== 'Enrolled' && l.paymentStatus !== 'Paid') return false;
      } else if (activeSavedView === 'lost') {
        if (l.crmStage !== 'Lost' && l.crmStage !== 'Unqualified' && l.crmStage !== 'Not Interested') return false;
      }

      // Toolbar Filters
      if (filterStage !== 'All' && l.crmStage !== filterStage) return false;
      if (filterRep !== 'All' && l.assignedSalesperson !== filterRep) return false;
      if (filterProgram !== 'All' && l.programName !== filterProgram) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.fullName?.toLowerCase().includes(q);
        const matchPhone = l.phone?.includes(q);
        const matchEmail = l.email?.toLowerCase().includes(q);
        const matchSource = l.source?.toLowerCase().includes(q) || l.metaCampaign?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchEmail && !matchSource) return false;
      }

      return true;
    });
  }, [leadsPool, activeSavedView, filterStage, filterRep, filterProgram, searchQuery]);

  // 2. Sort Leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      if (sortBy === 'created_desc') {
        return (
          new Date(b.dateCaptured || b.createdTime || 0).getTime() -
          new Date(a.dateCaptured || a.createdTime || 0).getTime()
        );
      }
      if (sortBy === 'due_asc') {
        const dueA = a.nextTask?.dueDateTime || a.nextFollowUp || '9999';
        const dueB = b.nextTask?.dueDateTime || b.nextFollowUp || '9999';
        return dueA.localeCompare(dueB);
      }
      if (sortBy === 'name_asc') {
        return (a.fullName || '').localeCompare(b.fullName || '');
      }
      return 0;
    });
  }, [filteredLeads, sortBy]);

  // 3. Group Leads
  const groupedData = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'All', title: 'All Records', items: sortedLeads }];
    }

    const map: Record<string, Lead[]> = {};
    sortedLeads.forEach((lead) => {
      const groupKey =
        groupBy === 'stage'
          ? lead.crmStage || 'New Lead'
          : lead.assignedSalesperson || 'Unassigned';
      if (!map[groupKey]) map[groupKey] = [];
      map[groupKey].push(lead);
    });

    return Object.entries(map).map(([key, items]) => ({
      key,
      title: key,
      items
    }));
  }, [sortedLeads, groupBy]);

  // Toggle selection
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(sortedLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Side panel navigation
  const currentLeadIndex = selectedLead
    ? sortedLeads.findIndex((l) => l.id === selectedLead.id)
    : -1;
  const hasNextLead = currentLeadIndex >= 0 && currentLeadIndex < sortedLeads.length - 1;
  const hasPrevLead = currentLeadIndex > 0;

  const handleNextLead = () => {
    if (hasNextLead) setSelectedLead(sortedLeads[currentLeadIndex + 1]);
  };
  const handlePrevLead = () => {
    if (hasPrevLead) setSelectedLead(sortedLeads[currentLeadIndex - 1]);
  };

  // Add lead handler
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadPhone.trim()) return;

    addLead({
      fullName: newLeadName.trim(),
      phone: newLeadPhone.trim(),
      email: newLeadEmail.trim() || `${newLeadName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      programName: newLeadProgram,
      source: 'Direct Entry',
      crmStage: 'New Lead',
      assignedSalesperson: currentUser?.role === 'Salesperson' ? currentUser.name : 'Unassigned',
      dateCaptured: new Date().toISOString()
    } as any);

    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    setIsAddLeadOpen(false);
  };

  const rowHeightClasses = {
    compact: 'h-8 py-1',
    normal: 'h-9 py-1.5',
    relaxed: 'h-11 py-2'
  }[rowHeight];

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 1. TOP AIRTABLE TOOLBAR */}
      <div className="h-11 px-4 border-b border-[#E6E6E3] flex items-center justify-between gap-3 bg-white shrink-0 overflow-x-auto">
        {/* Left: View title & count */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-semibold text-[#1F1F1D]">
              {viewNames[activeSavedView] || 'All leads'}
            </span>
            <span className="text-[11px] tabular-nums text-[#6B6B66] font-medium">
              {filteredLeads.length} records
            </span>
          </div>

          {/* View-type segmented switcher */}
          <SegmentedControl
            options={[
              { value: 'grid', label: 'Grid', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { value: 'kanban', label: 'Kanban', icon: <Columns className="w-3.5 h-3.5" /> },
              { value: 'calendar', label: 'Calendar', icon: <Calendar className="w-3.5 h-3.5" /> }
            ]}
            value={viewType}
            onChange={(val) => {
              if (val === 'kanban') navigate('/pipeline');
              else setViewType(val);
            }}
          />
        </div>

        {/* Center/Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant={showFilters ? 'primary' : 'ghost'}
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
            onClick={() => setShowFilters((prev) => !prev)}
          >
            Filter
          </Button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              aria-label="Sort leads by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-7 px-2 bg-transparent hover:bg-[#F3F4F6] border border-transparent hover:border-[#E6E6E3] rounded-[6px] text-xs text-[#1F1F1D] font-medium cursor-pointer outline-none"
            >
              <option value="created_desc">Sort: Newest first</option>
              <option value="due_asc">Sort: Next action due</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
            </select>
          </div>

          {/* Group dropdown */}
          <div className="relative">
            <select
              aria-label="Group records by"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="h-7 px-2 bg-transparent hover:bg-[#F3F4F6] border border-transparent hover:border-[#E6E6E3] rounded-[6px] text-xs text-[#1F1F1D] font-medium cursor-pointer outline-none"
            >
              <option value="stage">Group: Stage</option>
              <option value="owner">Group: Owner</option>
              <option value="none">Group: None</option>
            </select>
          </div>

          {/* Row Height switcher */}
          <div className="relative">
            <select
              aria-label="Table row density"
              value={rowHeight}
              onChange={(e) => setRowHeight(e.target.value as any)}
              className="h-7 px-2 bg-transparent hover:bg-[#F3F4F6] border border-transparent hover:border-[#E6E6E3] rounded-[6px] text-xs text-[#1F1F1D] font-medium cursor-pointer outline-none"
            >
              <option value="compact">Row: Compact</option>
              <option value="normal">Row: Normal</option>
              <option value="relaxed">Row: Relaxed</option>
            </select>
          </div>

          {/* In-view search box */}
          <div className="relative w-44">
            <Search className="w-3 h-3 text-[#6B6B66] absolute left-2 top-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-6 pr-2 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[6px] text-xs text-[#1F1F1D] placeholder-[#9CA3AF] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#3B4BDB]"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddLeadOpen(true)}
          >
            Add lead
          </Button>
        </div>
      </div>

      {/* Optional Filter Row */}
      {showFilters && (
        <div className="px-4 py-2 bg-[#F7F7F5] border-b border-[#E6E6E3] flex items-center gap-3 flex-wrap text-xs animate-in fade-in">
          <span className="text-[#6B6B66] font-medium">Filter by:</span>
          <select
            aria-label="Filter by lifecycle stage"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="h-6 px-2 bg-white border border-[#E6E6E3] rounded-[4px] text-xs text-[#1F1F1D]"
          >
            <option value="All">All Stages</option>
            <option value="New Lead">New Lead</option>
            <option value="Interested">Interested</option>
            <option value="Qualified">Qualified</option>
            <option value="Follow-Up 1">Follow-Up 1</option>
            <option value="Details Sent on WhatsApp">Details Sent on WhatsApp</option>
            <option value="Payment pending">Payment pending</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            aria-label="Filter by salesperson owner"
            value={filterRep}
            onChange={(e) => setFilterRep(e.target.value)}
            className="h-6 px-2 bg-white border border-[#E6E6E3] rounded-[4px] text-xs text-[#1F1F1D]"
          >
            <option value="All">All Owners</option>
            <option value="Unassigned">Unassigned</option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by program offering"
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="h-6 px-2 bg-white border border-[#E6E6E3] rounded-[4px] text-xs text-[#1F1F1D]"
          >
            <option value="All">All Programs</option>
            <option value="AI-Native PM">AI-Native PM Program</option>
            <option value="3-Day Workshop">3-Day AI Builder Workshop</option>
          </select>

          {(filterStage !== 'All' || filterRep !== 'All' || filterProgram !== 'All') && (
            <button
              onClick={() => {
                setFilterStage('All');
                setFilterRep('All');
                setFilterProgram('All');
              }}
              className="text-xs text-[#3B4BDB] hover:underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* 2. GRID TABLE WORK AREA */}
      <div className="flex-1 overflow-auto relative">
        <table className="w-full border-collapse text-left text-[13px] border-b border-[#E6E6E3]">
          {/* Sticky Header Row */}
          <thead>
            <tr className="bg-[#F7F7F5] border-b border-[#E6E6E3] text-[11px] font-semibold text-[#6B6B66] uppercase tracking-wider sticky top-0 z-20">
              <th className="w-8 px-3 py-2 text-center sticky left-0 bg-[#F7F7F5] z-30 border-r border-[#E6E6E3]">
                <input
                  type="checkbox"
                  aria-label="Select all leads"
                  checked={sortedLeads.length > 0 && selectedLeadIds.length === sortedLeads.length}
                  onChange={handleToggleSelectAll}
                  className="rounded-[3px] border-[#E6E6E3] text-[#3B4BDB] focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="px-3 py-2 sticky left-8 bg-[#F7F7F5] z-30 border-r border-[#E6E6E3] min-w-[180px]">
                Lead name
              </th>
              <th className="px-3 py-2 min-w-[120px] border-r border-[#E6E6E3]/60">Phone</th>
              <th className="px-3 py-2 min-w-[130px] border-r border-[#E6E6E3]/60">Program</th>
              <th className="px-3 py-2 min-w-[120px] border-r border-[#E6E6E3]/60">Stage</th>
              <th className="px-3 py-2 min-w-[130px] border-r border-[#E6E6E3]/60">Owner</th>
              <th className="px-3 py-2 min-w-[90px] border-r border-[#E6E6E3]/60">Temp</th>
              <th className="px-3 py-2 min-w-[160px] border-r border-[#E6E6E3]/60">Next action</th>
              <th className="px-3 py-2 min-w-[120px] border-r border-[#E6E6E3]/60">Due</th>
              <th className="px-3 py-2 min-w-[130px] border-r border-[#E6E6E3]/60">Source / Ad</th>
              <th className="px-3 py-2 min-w-[90px] border-r border-[#E6E6E3]/60">Last touch</th>
              <th className="px-3 py-2 min-w-[100px]">Created</th>
            </tr>
          </thead>

          {/* Table Body with Collapsible Groups */}
          <tbody>
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-16 text-center">
                  <EmptyState
                    icon={FileSpreadsheet}
                    title="No records found in this view."
                    description="Adjust your filters or add a new lead using the button above."
                  />
                </td>
              </tr>
            ) : (
              groupedData.map((group) => {
                const isCollapsed = collapsedGroups[group.key];
                return (
                  <Fragment key={group.key}>
                    {/* Collapsible Group Header Row */}
                    {groupBy !== 'none' && (
                      <tr className="bg-[#F7F7F5]/80 border-y border-[#E6E6E3] text-xs font-semibold text-[#1F1F1D]">
                        <td
                          colSpan={12}
                          className="px-3 py-1.5 cursor-pointer hover:bg-[#F3F4F6] transition-colors"
                          onClick={() =>
                            setCollapsedGroups((prev) => ({
                              ...prev,
                              [group.key]: !prev[group.key]
                            }))
                          }
                        >
                          <div className="flex items-center gap-2">
                            {isCollapsed ? (
                              <ChevronRight className="w-3.5 h-3.5 text-[#6B6B66]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#6B6B66]" />
                            )}
                            <span className="font-semibold">{group.title}</span>
                            <span className="text-[11px] font-normal text-[#6B6B66] tabular-nums">
                              • {group.items.length} {group.items.length === 1 ? 'record' : 'records'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Group Items Rows */}
                    {!isCollapsed &&
                      group.items.map((lead) => {
                        const isSelected = selectedLeadIds.includes(lead.id);
                        const sla = calculate48HourWorkingSla(lead.dateCaptured);
                        const isOverdue = !sla.isWithin48Hours;

                        return (
                          <tr
                            key={lead.id}
                            className={`group border-b border-[#E6E6E3]/60 transition-colors ${rowHeightClasses} ${
                              isSelected
                                ? 'bg-[#EEF0FD]'
                                : 'hover:bg-[#F3F4F6] bg-white'
                            }`}
                          >
                            {/* Checkbox Cell */}
                            <td className="px-3 text-center sticky left-0 z-10 bg-inherit border-r border-[#E6E6E3]">
                              <input
                                type="checkbox"
                                aria-label={`Select lead ${lead.fullName}`}
                                checked={isSelected}
                                onChange={() => handleToggleLead(lead.id)}
                                className="rounded-[3px] border-[#E6E6E3] text-[#3B4BDB] focus:ring-0 cursor-pointer"
                              />
                            </td>

                            {/* Sticky Name Cell */}
                            <td className="px-3 sticky left-8 z-10 bg-inherit border-r border-[#E6E6E3] font-medium text-[#1F1F1D] min-w-[180px]">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  onClick={() => setSelectedLead(lead)}
                                  className="cursor-pointer hover:text-[#3B4BDB] truncate font-medium text-[13px]"
                                  title={lead.fullName}
                                >
                                  {lead.fullName}
                                </span>

                                {/* Quick hover action icons */}
                                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                                  <a
                                    href={`tel:${lead.phone}`}
                                    aria-label={`Call ${lead.fullName}`}
                                    className="p-1 rounded-[3px] text-[#6B6B66] hover:text-[#3B4BDB] hover:bg-white"
                                    title="Call lead"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </a>
                                  <a
                                    href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`WhatsApp ${lead.fullName}`}
                                    className="p-1 rounded-[3px] text-[#6B6B66] hover:text-[#059669] hover:bg-white"
                                    title="Open WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="px-3 border-r border-[#E6E6E3]/60 text-xs text-[#1F1F1D] tabular-nums">
                              {lead.phone || '—'}
                            </td>

                            {/* Program */}
                            <td className="px-3 border-r border-[#E6E6E3]/60 text-xs truncate max-w-[140px]">
                              {lead.programName || 'AI Program'}
                            </td>

                            {/* Stage (Interactive Dropdown Inline Edit) */}
                            <td className="px-3 border-r border-[#E6E6E3]/60">
                              <select
                                aria-label="Lead Stage"
                                value={lead.crmStage}
                                onChange={(e) => updateLeadStage(lead.id, e.target.value as Stage)}
                                className="text-xs bg-transparent border-0 font-medium cursor-pointer outline-none hover:bg-[#F3F4F6] rounded py-0.5"
                              >
                                {[
                                  'New Lead',
                                  'Interested',
                                  'Follow-Up 1',
                                  'Follow-Up 2',
                                  'Details Sent on WhatsApp',
                                  'Qualified',
                                  'Meeting booked',
                                  'Payment pending',
                                  'Enrolled',
                                  'Lost'
                                ].map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Owner (Interactive Inline Edit) */}
                            <td className="px-3 border-r border-[#E6E6E3]/60">
                              <div className="flex items-center gap-1.5">
                                <Avatar name={lead.assignedSalesperson || 'Unassigned'} size={20} />
                                <select
                                  aria-label="Lead Owner"
                                  value={lead.assignedSalesperson || 'Unassigned'}
                                  onChange={(e) => assignLead(lead.id, e.target.value)}
                                  className="text-xs bg-transparent border-0 font-medium text-[#1F1F1D] cursor-pointer outline-none hover:bg-[#F3F4F6] rounded py-0.5 truncate max-w-[95px]"
                                >
                                  <option value="Unassigned">Unassigned</option>
                                  {salespeople.map((s) => (
                                    <option key={s.id} value={s.name}>
                                      {s.name.split(' ')[0]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>

                            {/* Temperature (Inline Edit) */}
                            <td className="px-3 border-r border-[#E6E6E3]/60">
                              <select
                                aria-label="Lead Temperature"
                                value={(lead as any).temperature || 'Warm'}
                                onChange={(e) => updateLead(lead.id, { temperature: e.target.value } as any)}
                                className="text-xs bg-transparent border-0 font-medium cursor-pointer outline-none hover:bg-[#F3F4F6] rounded py-0.5"
                              >
                                <option value="Hot">Hot</option>
                                <option value="Warm">Warm</option>
                                <option value="Cold">Cold</option>
                              </select>
                            </td>

                            {/* Next Action */}
                            <td className="px-3 border-r border-[#E6E6E3]/60 text-xs truncate max-w-[160px]" title={lead.nextTask?.notes || lead.nextFollowUp}>
                              {lead.nextTask?.notes || lead.nextFollowUp || 'No action scheduled'}
                            </td>

                            {/* Due Date (Relative, Red if Overdue) */}
                            <td
                              className={`px-3 border-r border-[#E6E6E3]/60 text-xs tabular-nums ${
                                isOverdue ? 'text-[#B42318] font-bold' : 'text-[#6B6B66]'
                              }`}
                            >
                              {lead.nextTask?.dueDateTime ? (
                                isOverdue ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#B42318]" />
                                    Overdue
                                  </span>
                                ) : (
                                  lead.nextTask.dueDateTime.split('T')[0]
                                )
                              ) : (
                                '—'
                              )}
                            </td>

                            {/* Source / Ad */}
                            <td className="px-3 border-r border-[#E6E6E3]/60 text-xs text-[#6B6B66] truncate max-w-[130px]">
                              {lead.metaCampaign || lead.source || 'Meta Ads'}
                            </td>

                            {/* Last Touch */}
                            <td className="px-3 border-r border-[#E6E6E3]/60 text-xs text-[#6B6B66] tabular-nums">
                              {lead.numberOfCalls ? `${lead.numberOfCalls} touches` : 'Recent'}
                            </td>

                            {/* Created */}
                            <td className="px-3 text-xs text-[#6B6B66] tabular-nums whitespace-nowrap">
                              {lead.dateCaptured ? new Date(lead.dateCaptured).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        );
                      })}
                  </Fragment>
                );
              })
            )}
          </tbody>

          {/* Footer Total Row */}
          <tfoot>
            <tr className="bg-[#F7F7F5] border-t border-[#E6E6E3] text-xs font-semibold text-[#6B6B66]">
              <td className="px-3 py-2 text-center sticky left-0 bg-[#F7F7F5] border-r border-[#E6E6E3]">
                Σ
              </td>
              <td className="px-3 py-2 sticky left-8 bg-[#F7F7F5] border-r border-[#E6E6E3]">
                Total: {filteredLeads.length} leads
              </td>
              <td colSpan={10} className="px-3 py-2 text-right">
                Active View: <strong>{viewNames[activeSavedView] || 'All leads'}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 3. FLOATING BULK ACTIONS BAR */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1F1F1D] text-white px-4 py-2.5 rounded-[8px] shadow-2xl flex items-center gap-3.5 text-xs animate-in slide-in-from-bottom duration-150">
          <span className="font-semibold text-white">
            {selectedLeadIds.length} {selectedLeadIds.length === 1 ? 'lead' : 'leads'} selected
          </span>

          <div className="h-3.5 w-px bg-white/20" />

          {/* Bulk Assign */}
          <select
            aria-label="Bulk assign selected leads to salesperson"
            onChange={(e) => {
              if (!e.target.value) return;
              selectedLeadIds.forEach((id) => assignLead(id, e.target.value));
              setSelectedLeadIds([]);
            }}
            className="bg-[#2D2D2A] text-white text-xs border border-white/20 rounded-[4px] px-2 py-1 cursor-pointer outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Assign to...
            </option>
            {salespeople.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Bulk Stage Change */}
          <select
            aria-label="Bulk change stage for selected leads"
            onChange={(e) => {
              if (!e.target.value) return;
              selectedLeadIds.forEach((id) => updateLeadStage(id, e.target.value as Stage));
              setSelectedLeadIds([]);
            }}
            className="bg-[#2D2D2A] text-white text-xs border border-white/20 rounded-[4px] px-2 py-1 cursor-pointer outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Change stage...
            </option>
            {[
              'New Lead',
              'Interested',
              'Follow-Up 1',
              'Qualified',
              'Payment pending',
              'Enrolled',
              'Lost'
            ].map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSelectedLeadIds([])}
            className="text-white/60 hover:text-white p-1 ml-1 cursor-pointer"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. 480PX LEAD SIDE PANEL */}
      <LeadSidePanel
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onNext={handleNextLead}
        onPrev={handlePrevLead}
        hasNext={hasNextLead}
        hasPrev={hasPrevLead}
      />

      {/* 5. ADD LEAD MODAL */}
      {isAddLeadOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsAddLeadOpen(false)}
        >
          <form
            onSubmit={handleCreateLead}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white border border-[#E6E6E3] rounded-[8px] p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-2.5">
              <h3 className="font-semibold text-sm text-[#1F1F1D]">Add New Lead</h3>
              <button
                type="button"
                onClick={() => setIsAddLeadOpen(false)}
                className="text-[#6B6B66] hover:text-[#1F1F1D]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#1F1F1D] mb-1">Full name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Mehta"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded-[6px] text-xs focus:ring-1 focus:ring-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1F1F1D] mb-1">Phone number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded-[6px] text-xs focus:ring-1 focus:ring-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1F1F1D] mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="rohan@example.com"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  className="w-full h-8 px-2.5 bg-white border border-[#E6E6E3] rounded-[6px] text-xs focus:ring-1 focus:ring-[#3B4BDB]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1F1F1D] mb-1">Program interested in</label>
                <select
                  value={newLeadProgram}
                  onChange={(e) => setNewLeadProgram(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs font-medium"
                >
                  <option value="AI-Native PM">AI-Native PM Program (4 Certifications)</option>
                  <option value="3-Day Workshop">3-Day AI Builder Workshop</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddLeadOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create record
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
