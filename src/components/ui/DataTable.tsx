// src/components/ui/DataTable.tsx
import React, { useState, useRef, useMemo } from 'react';
import type { Lead, Stage, CustomField } from '../../types';
import { StageChip } from './StageChip';
import { TempTag } from './TempTag';
import { Avatar } from './Avatar';
import { EmptyState } from '../EmptyState';
import {
  formatPhoneNumber,
  formatRelativeDue,
  formatRelativeTime,
  formatProgramName
} from '../../utils/tableFormatters';
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Phone,
  MessageSquare,
  PanelRightClose
} from 'lucide-react';

export interface ColumnDef {
  id: string;
  label: string;
  defaultWidth: number;
  minWidth?: number;
  sortable?: boolean;
}

export const ALL_COLUMNS: ColumnDef[] = [
  { id: 'select', label: '', defaultWidth: 40, minWidth: 40, sortable: false },
  { id: 'name', label: 'Lead name', defaultWidth: 210, minWidth: 140, sortable: true },
  { id: 'phone', label: 'Phone', defaultWidth: 140, minWidth: 120, sortable: true },
  { id: 'program', label: 'Program', defaultWidth: 110, minWidth: 90, sortable: true },
  { id: 'stage', label: 'Stage', defaultWidth: 160, minWidth: 130, sortable: true },
  { id: 'owner', label: 'Owner', defaultWidth: 140, minWidth: 120, sortable: true },
  { id: 'temperature', label: 'Temperature', defaultWidth: 120, minWidth: 100, sortable: true },
  { id: 'nextAction', label: 'Next action', defaultWidth: 180, minWidth: 130, sortable: false },
  { id: 'due', label: 'Due', defaultWidth: 150, minWidth: 120, sortable: true },
  { id: 'source', label: 'Source / Ad', defaultWidth: 180, minWidth: 130, sortable: true },
  { id: 'lastTouch', label: 'Last touch', defaultWidth: 110, minWidth: 90, sortable: true },
  { id: 'created', label: 'Created', defaultWidth: 110, minWidth: 90, sortable: true }
];

interface DataTableProps {
  leads: Lead[];
  loading?: boolean;
  selectedLeadIds: string[];
  onToggleSelectLead: (id: string) => void;
  onSelectAllVisible: () => void;
  isAllVisibleSelected: boolean;
  selectedLeadId: string | null;
  onOpenLead: (lead: Lead) => void;
  // Inline updates
  onUpdateStage: (leadId: string, stage: Stage) => void;
  onUpdateOwner: (leadId: string, ownerName: string) => void;
  onUpdateTemperature: (leadId: string, temp: 'Hot' | 'Warm' | 'Cold') => void;
  // Lost modal callback
  onRequestLostReason: (lead: Lead) => void;
  // Customization
  visibleColumns?: string[];
  columnWidths?: Record<string, number>;
  onColumnWidthChange?: (colId: string, width: number) => void;
  rowHeight?: 'compact' | 'default' | 'tall';
  groupBy?: 'stage' | 'owner' | 'program' | 'temperature' | 'source' | 'none';
  customFields?: CustomField[];
  // Sorting
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (colId: string) => void;
  // Filtering & clear
  isFiltered?: boolean;
  onClearFilters?: () => void;
  // Roles
  isAdmin?: boolean;
  salespeople?: { id: string; name: string }[];
}

export const DataTable: React.FC<DataTableProps> = ({
  leads,
  loading = false,
  selectedLeadIds,
  onToggleSelectLead,
  onSelectAllVisible,
  isAllVisibleSelected,
  selectedLeadId,
  onOpenLead,
  onUpdateStage,
  onUpdateOwner,
  onUpdateTemperature,
  onRequestLostReason,
  visibleColumns = ALL_COLUMNS.map((c) => c.id),
  columnWidths = {},
  onColumnWidthChange,
  rowHeight = 'default',
  groupBy = 'stage',
  sortColumn,
  sortDirection,
  onSortChange,
  isFiltered = false,
  onClearFilters,
  isAdmin = false,
  salespeople = [],
  customFields = []
}) => {
  // Pagination / Load more (100 rows per batch for 2,000+ lead smoothness)
  const [visibleCount, setVisibleCount] = useState(100);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Column Resizing state
  const resizingRef = useRef<{ colId: string; startX: number; startWidth: number } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, colId: string, currentWidth: number) => {
    e.stopPropagation();
    e.preventDefault();
    resizingRef.current = { colId, startX: e.clientX, startWidth: currentWidth };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(80, resizingRef.current.startWidth + delta);
      if (onColumnWidthChange) {
        onColumnWidthChange(resizingRef.current.colId, newWidth);
      }
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const rowHeightClass = {
    compact: 'h-8 text-xs',
    default: 'h-10 text-[13px]',
    tall: 'h-14 text-sm'
  }[rowHeight];

  // Grouping logic
  const groupedData = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', title: 'All records', items: leads }];
    }

    const groups: Record<string, Lead[]> = {};
    leads.forEach((lead) => {
      let key = 'Other';
      if (groupBy === 'stage') key = lead.crmStage || 'New Lead';
      else if (groupBy === 'owner') key = lead.assignedSalesperson || 'Unassigned';
      else if (groupBy === 'program') key = formatProgramName(lead.programName);
      else if (groupBy === 'temperature') key = (lead as any).temperature || (lead as any).leadTemperature || 'Warm';
      else if (groupBy === 'source') key = lead.source || 'Meta Ads';

      if (!groups[key]) groups[key] = [];
      groups[key].push(lead);
    });

    return Object.entries(groups).map(([title, items]) => ({
      key: title,
      title,
      items
    }));
  }, [leads, groupBy]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 10 Skeleton rows when loading
  if (loading) {
    return (
      <div className="w-full h-full overflow-hidden flex flex-col bg-white">
        <div className="h-9 border-b border-[#E6E6E3] bg-[#F7F7F5] flex items-center px-4">
          <div className="h-4 w-32 bg-[#E6E6E3] rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-4 h-4 bg-[#F3F4F6] rounded" />
              <div className="w-44 h-5 bg-[#F3F4F6] rounded" />
              <div className="w-28 h-5 bg-[#F3F4F6] rounded" />
              <div className="w-24 h-5 bg-[#F3F4F6] rounded" />
              <div className="w-28 h-5 bg-[#F3F4F6] rounded" />
              <div className="w-36 h-5 bg-[#F3F4F6] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (leads.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white p-8">
        <EmptyState
          title="No leads in this view."
          description={
            isFiltered
              ? 'Try modifying or clearing your filters to see matching leads.'
              : 'There are currently no records assigned or captured under this view.'
          }
          actionText={isFiltered && onClearFilters ? 'Clear filters' : undefined}
          onAction={isFiltered && onClearFilters ? onClearFilters : undefined}
        />
      </div>
    );
  }

  const isColVisible = (colId: string) => visibleColumns.includes(colId);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      {/* Scrollable container with real table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        <table className="w-full border-collapse border-spacing-0 text-left">
          {/* STICKY HEADER ROW */}
          <thead className="sticky top-0 z-30 bg-[#F7F7F5] border-b border-[#E6E6E3] select-none text-[12px] font-medium text-[#6B6B66]">
            <tr>
              {/* 1. Checkbox Column (Sticky Col 1) */}
              {isColVisible('select') && (
                <th
                  style={{ width: 40 }}
                  className="sticky left-0 z-40 bg-[#F7F7F5] px-3 border-r border-[#E6E6E3] text-center"
                >
                  <input
                    type="checkbox"
                    aria-label="Select all leads"
                    checked={isAllVisibleSelected}
                    onChange={onSelectAllVisible}
                    className="w-3.5 h-3.5 rounded-[3px] border-[#E6E6E3] text-[#3B4BDB] focus:ring-0 cursor-pointer"
                  />
                </th>
              )}

              {/* 2. Lead Name Column (Sticky Col 2) */}
              {isColVisible('name') && (
                <th
                  style={{ width: columnWidths['name'] || 210 }}
                  className="sticky left-10 z-40 bg-[#F7F7F5] px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('name')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Lead name</span>
                    {sortColumn === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40" />
                    )}
                  </div>
                  {/* Resize handle */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'name', columnWidths['name'] || 210)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 3. Phone */}
              {isColVisible('phone') && (
                <th
                  style={{ width: columnWidths['phone'] || 140 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('phone')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Phone</span>
                    {sortColumn === 'phone' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'phone', columnWidths['phone'] || 140)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 4. Program */}
              {isColVisible('program') && (
                <th
                  style={{ width: columnWidths['program'] || 110 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('program')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Program</span>
                    {sortColumn === 'program' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'program', columnWidths['program'] || 110)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 5. Stage */}
              {isColVisible('stage') && (
                <th
                  style={{ width: columnWidths['stage'] || 160 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('stage')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Stage</span>
                    {sortColumn === 'stage' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'stage', columnWidths['stage'] || 160)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 6. Owner */}
              {isColVisible('owner') && (
                <th
                  style={{ width: columnWidths['owner'] || 140 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('owner')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Owner</span>
                    {sortColumn === 'owner' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'owner', columnWidths['owner'] || 140)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 7. Temperature */}
              {isColVisible('temperature') && (
                <th
                  style={{ width: columnWidths['temperature'] || 120 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('temperature')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Temperature</span>
                    {sortColumn === 'temperature' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'temperature', columnWidths['temperature'] || 120)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 8. Next Action */}
              {isColVisible('nextAction') && (
                <th
                  style={{ width: columnWidths['nextAction'] || 180 }}
                  className="px-3 border-r border-[#E6E6E3] relative"
                >
                  <div className="py-2 truncate">Next action</div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'nextAction', columnWidths['nextAction'] || 180)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 9. Due */}
              {isColVisible('due') && (
                <th
                  style={{ width: columnWidths['due'] || 150 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('due')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Due</span>
                    {sortColumn === 'due' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'due', columnWidths['due'] || 150)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 10. Source / Ad */}
              {isColVisible('source') && (
                <th
                  style={{ width: columnWidths['source'] || 180 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('source')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Source / Ad</span>
                    {sortColumn === 'source' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'source', columnWidths['source'] || 180)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 11. Last Touch */}
              {isColVisible('lastTouch') && (
                <th
                  style={{ width: columnWidths['lastTouch'] || 110 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('lastTouch')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Last touch</span>
                    {sortColumn === 'lastTouch' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'lastTouch', columnWidths['lastTouch'] || 110)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* 12. Created */}
              {isColVisible('created') && (
                <th
                  style={{ width: columnWidths['created'] || 110 }}
                  className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                  onClick={() => onSortChange && onSortChange('created')}
                >
                  <div className="flex items-center justify-between gap-1 py-2">
                    <span className="truncate">Created</span>
                    {sortColumn === 'created' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                    )}
                  </div>
                  <div
                    onMouseDown={(e) => handleResizeStart(e, 'created', columnWidths['created'] || 110)}
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                  />
                </th>
              )}

              {/* Dynamic Custom Field Headers */}
              {customFields.map((cf) => {
                const colKey = `cf_${cf.key}`;
                if (!isColVisible(colKey)) return null;
                return (
                  <th
                    key={colKey}
                    style={{ width: columnWidths[colKey] || 150 }}
                    className="px-3 border-r border-[#E6E6E3] group relative cursor-pointer"
                    onClick={() => onSortChange && onSortChange(colKey)}
                  >
                    <div className="flex items-center justify-between gap-1 py-2">
                      <span className="truncate text-[#3B4BDB]">{cf.label}</span>
                      {sortColumn === colKey && (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#3B4BDB]" /> : <ArrowDown className="w-3 h-3 text-[#3B4BDB]" />
                      )}
                    </div>
                    <div
                      onMouseDown={(e) => handleResizeStart(e, colKey, columnWidths[colKey] || 150)}
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#3B4BDB]/40"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>
            {groupedData.map((group) => {
              const isCollapsed = collapsedGroups[group.key];
              const groupLeads = group.items.slice(0, visibleCount);

              return (
                <React.Fragment key={group.key}>
                  {/* GROUP HEADER ROW */}
                  {groupBy !== 'none' && (
                    <tr
                      onClick={() => toggleGroup(group.key)}
                      className="bg-[#F7F7F5] border-y border-[#E6E6E3] hover:bg-[#F3F4F6] cursor-pointer text-xs font-semibold text-[#1F1F1D]"
                    >
                      <td colSpan={visibleColumns.length} className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-[#6B6B66]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#6B6B66]" />
                          )}
                          <span>{group.title}</span>
                          <span className="text-[11px] font-normal text-[#6B6B66] tabular-nums">
                            · {group.items.length}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* ROWS UNDER THIS GROUP */}
                  {!isCollapsed &&
                    groupLeads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      const isOpen = selectedLeadId === lead.id;
                      const dueInfo = formatRelativeDue(lead.nextTask?.dueDateTime || lead.nextFollowUp);

                      return (
                        <tr
                          key={lead.id}
                          className={`group border-b border-[#E6E6E3]/70 transition-colors ${rowHeightClass} ${
                            isOpen
                              ? 'bg-[#EEF0FD]'
                              : isSelected
                              ? 'bg-[#EEF0FD]/60'
                              : 'hover:bg-[#F3F4F6] bg-white'
                          }`}
                        >
                          {/* 1. Checkbox (Sticky Col 1) */}
                          {isColVisible('select') && (
                            <td className="sticky left-0 z-20 bg-inherit px-3 border-r border-[#E6E6E3] text-center">
                              <input
                                type="checkbox"
                                aria-label={`Select ${lead.fullName}`}
                                checked={isSelected}
                                onChange={() => onToggleSelectLead(lead.id)}
                                className="w-3.5 h-3.5 rounded-[3px] border-[#E6E6E3] text-[#3B4BDB] focus:ring-0 cursor-pointer"
                              />
                            </td>
                          )}

                          {/* 2. Lead Name (Sticky Col 2) */}
                          {isColVisible('name') && (
                            <td className="sticky left-10 z-20 bg-inherit px-3 border-r border-[#E6E6E3]">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => onOpenLead(lead)}
                                  className="font-semibold text-[#1F1F1D] hover:text-[#3B4BDB] truncate text-left"
                                  title={lead.fullName}
                                >
                                  {lead.fullName}
                                </button>

                                {/* Row hover action buttons on right edge */}
                                <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                                  <a
                                    href={`tel:${lead.phone}`}
                                    aria-label={`Call ${lead.fullName}`}
                                    title="Call"
                                    className="p-1 text-[#6B6B66] hover:text-[#3B4BDB] hover:bg-white rounded"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                  <a
                                    href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`WhatsApp ${lead.fullName}`}
                                    title="WhatsApp"
                                    className="p-1 text-[#6B6B66] hover:text-[#059669] hover:bg-white rounded"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => onOpenLead(lead)}
                                    aria-label={`Open side panel for ${lead.fullName}`}
                                    title="Open side panel"
                                    className="p-1 text-[#6B6B66] hover:text-[#3B4BDB] hover:bg-white rounded"
                                  >
                                    <PanelRightClose className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          )}

                          {/* 3. Phone */}
                          {isColVisible('phone') && (
                            <td className="px-3 border-r border-[#E6E6E3]/70 tabular-nums text-[#1F1F1D]">
                              {formatPhoneNumber(lead.phone)}
                            </td>
                          )}

                          {/* 4. Program */}
                          {isColVisible('program') && (
                            <td className="px-3 border-r border-[#E6E6E3]/70 text-[#1F1F1D] truncate">
                              {formatProgramName(lead.programName)}
                            </td>
                          )}

                          {/* 5. Stage (Inline edit) */}
                          {isColVisible('stage') && (
                            <td className="px-3 border-r border-[#E6E6E3]/70">
                              <div className="relative inline-flex items-center group/chip cursor-pointer">
                                <StageChip stage={lead.crmStage} />
                                <select
                                  aria-label="Change Stage"
                                  value={lead.crmStage}
                                  onChange={(e) => {
                                    const newStage = e.target.value as Stage;
                                    if (newStage === 'Lost') {
                                      onRequestLostReason(lead);
                                    } else if (newStage === 'Converted' && !isAdmin) {
                                      alert('Enrolled is set automatically when payment is verified.');
                                    } else {
                                      onUpdateStage(lead.id, newStage);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                >
                                  <option value="New Lead">New Lead</option>
                                  <option value="Call Pending">Call Pending</option>
                                  <option value="Connected">Connected</option>
                                  <option value="Interested">Interested</option>
                                  <option value="Follow-Up 1">Follow-Up 1</option>
                                  <option value="Follow-Up 2">Follow-Up 2</option>
                                  <option value="Follow-Up 3">Follow-Up 3</option>
                                  <option value="Qualified">Qualified</option>
                                  <option value="Payment Discussion">Payment Discussion</option>
                                  <option value="Payment Pending">Payment Pending</option>
                                  <option value="Converted">Enrolled (Converted)</option>
                                  <option value="Lost">Lost</option>
                                  <option value="Not Interested">Not Interested</option>
                                  <option value="Unqualified">Unqualified</option>
                                </select>
                              </div>
                            </td>
                          )}

                          {/* 6. Owner (Inline edit - admin only) */}
                          {isColVisible('owner') && (
                            <td className="px-3 border-r border-[#E6E6E3]/70">
                              <div className="flex items-center gap-1.5">
                                <Avatar name={lead.assignedSalesperson || 'Unassigned'} size={20} />
                                {isAdmin ? (
                                  <select
                                    aria-label="Assign Owner"
                                    value={lead.assignedSalesperson || ''}
                                    onChange={(e) => onUpdateOwner(lead.id, e.target.value)}
                                    className="bg-transparent border-0 cursor-pointer outline-none hover:bg-white rounded py-0.5 text-xs"
                                  >
                                    <option value="">Unassigned</option>
                                    {salespeople.map((rep) => (
                                      <option key={rep.id} value={rep.name}>
                                        {rep.name.split(' ')[0]}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="truncate">
                                    {lead.assignedSalesperson ? lead.assignedSalesperson.split(' ')[0] : 'Unassigned'}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* 7. Temperature (Inline edit) */}
                          {isColVisible('temperature') && (
                            <td className="px-3 border-r border-[#E6E6E3]/70">
                              <div className="relative inline-flex items-center cursor-pointer">
                                <TempTag temperature={((lead as any).temperature || (lead as any).leadTemperature || 'Warm') as any} />
                                <select
                                  aria-label="Change Temperature"
                                  value={(lead as any).temperature || (lead as any).leadTemperature || 'Warm'}
                                  onChange={(e) => onUpdateTemperature(lead.id, e.target.value as any)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                >
                                  <option value="Hot">Hot</option>
                                  <option value="Warm">Warm</option>
                                  <option value="Cold">Cold</option>
                                </select>
                              </div>
                            </td>
                          )}

                          {/* 8. Next Action */}
                          {isColVisible('nextAction') && (
                            <td
                              className="px-3 border-r border-[#E6E6E3]/70 truncate max-w-[180px]"
                              title={lead.nextTask?.notes || lead.nextFollowUp || 'No action scheduled'}
                            >
                              {lead.nextTask?.notes || lead.nextFollowUp || '—'}
                            </td>
                          )}

                          {/* 9. Due (Relative, red if overdue or missing) */}
                          {isColVisible('due') && (
                            <td
                              className={`px-3 border-r border-[#E6E6E3]/70 tabular-nums ${
                                dueInfo.isOverdue || dueInfo.isMissing
                                  ? 'text-[#B42318] font-semibold'
                                  : 'text-[#6B6B66]'
                              }`}
                            >
                              {dueInfo.text}
                            </td>
                          )}

                          {/* 10. Source / Ad */}
                          {isColVisible('source') && (
                            <td
                              className="px-3 border-r border-[#E6E6E3]/70 text-[#6B6B66] truncate max-w-[180px]"
                              title={`${lead.source || 'Meta'} · ${lead.metaCampaign || ''} · ${lead.metaAd || ''}`}
                            >
                              {lead.source || 'Meta'} · {lead.metaCampaign || 'Direct'}
                            </td>
                          )}

                          {/* 11. Last Touch */}
                          {isColVisible('lastTouch') && (
                            <td className="px-3 border-r border-[#E6E6E3]/70 text-[#6B6B66] tabular-nums">
                              {formatRelativeTime(lead.lastContacted)}
                            </td>
                          )}

                          {/* 12. Created */}
                          {isColVisible('created') && (
                            <td className="px-3 border-r border-[#E6E6E3]/70 text-[#6B6B66] tabular-nums">
                              {lead.dateCaptured ? new Date(lead.dateCaptured).toLocaleDateString('en-IN') : '—'}
                            </td>
                          )}

                          {/* Dynamic Custom Field Cells */}
                          {customFields.map((cf) => {
                            const colKey = `cf_${cf.key}`;
                            if (!isColVisible(colKey)) return null;
                            const rawVal = lead.customFields?.[cf.key] ?? (lead as any)[cf.key];
                            const displayVal = rawVal !== undefined && rawVal !== null && rawVal !== '' ? String(rawVal) : '—';
                            return (
                              <td
                                key={colKey}
                                className="px-3 border-r border-[#E6E6E3]/70 text-[#1F1F1D] truncate max-w-[180px]"
                                title={displayVal}
                              >
                                {displayVal}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER ROW PINNED AT BOTTOM */}
      <div className="h-9 px-4 border-t border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between text-xs text-[#6B6B66] shrink-0">
        <div className="font-medium tabular-nums">{leads.length} leads</div>
        {leads.length > visibleCount && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 100)}
            className="text-[#3B4BDB] hover:underline font-medium"
          >
            Load more (showing {visibleCount} of {leads.length})
          </button>
        )}
      </div>
    </div>
  );
};
