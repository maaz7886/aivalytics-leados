// src/components/LeadCalendarView.tsx
import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Lead, Stage } from '../types';
import CsvImportModal from './CsvImportModal';
import MetaLeadSimulatorModal from './MetaLeadSimulatorModal';

export default function LeadCalendarView() {
  const { leads, setSelectedLeadId, updateLeadStage, deleteLead, deleteBulkLeads, bulkUpdateStage } = useApp();

  // Current calendar view date state (Default to September 2026, Today = 14 Sep 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 0-indexed: 8 = September
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-14');

  // Modals for uploading/adding leads for a specific date
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [targetDateForAdd, setTargetDateForAdd] = useState<string>('2026-09-14');
  const [activePopoverDate, setActivePopoverDate] = useState<string | null>(null);

  // Lead search & filter for the selected date view
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');

  // Checkbox multi-select state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkStageChoice, setBulkStageChoice] = useState<Stage | ''>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Navigate calendar month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleTodayClick = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
    setSelectedDateStr('2026-09-14');
  };

  // Helper to get formatted YYYY-MM-DD
  const formatYYYYMMDD = (year: number, monthZeroIdx: number, day: number): string => {
    const m = String(monthZeroIdx + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Compute Days for Calendar Grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dateStr: formatYYYYMMDD(prevY, prevM, dayNum),
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = formatYYYYMMDD(currentYear, currentMonth, d);
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === '2026-09-14',
      });
    }

    // Trailing days from next month to complete 42 grid cells (6 rows)
    const remainingCells = 42 - days.length;
    for (let n = 1; n <= remainingCells; n++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        dateStr: formatYYYYMMDD(nextY, nextM, n),
        dayNumber: n,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Group leads by date (YYYY-MM-DD)
  const leadsByDate = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    leads.forEach((lead) => {
      let dateKey = '';
      if (lead.dateCaptured) {
        if (lead.dateCaptured.includes('-')) {
          dateKey = lead.dateCaptured.substring(0, 10);
        } else {
          try {
            const parsed = new Date(lead.dateCaptured);
            if (!isNaN(parsed.getTime())) {
              dateKey = parsed.toISOString().substring(0, 10);
            }
          } catch {
            dateKey = '2026-09-14';
          }
        }
      } else {
        dateKey = '2026-09-14';
      }

      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(lead);
    });
    return map;
  }, [leads]);

  // Leads captured on the selected date
  const selectedDateLeads = useMemo(() => {
    const rawList = leadsByDate[selectedDateStr] || [];
    return rawList.filter((lead) => {
      const matchesSearch =
        lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.currentCompany.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram =
        programFilter === 'all' || lead.programId === programFilter;
      return matchesSearch && matchesProgram;
    });
  }, [leadsByDate, selectedDateStr, searchQuery, programFilter]);

  // Checkbox Selection Logic
  const allFilteredDateIds = selectedDateLeads.map((l) => l.id);
  const isAllSelected = allFilteredDateIds.length > 0 && allFilteredDateIds.every((id) => selectedLeadIds.includes(id));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedLeadIds((prev) => prev.filter((id) => !allFilteredDateIds.includes(id)));
    } else {
      setSelectedLeadIds(Array.from(new Set([...selectedLeadIds, ...allFilteredDateIds])));
    }
  };

  const handleCheckboxToggle = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedLeadIds((prev) => [...prev, id]);
    }
  };

  const handleSingleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete lead "${name}"?`)) {
      deleteLead(id);
      setSelectedLeadIds((prev) => prev.filter((item) => item !== id));
    }
  };

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

  // Open add modals for a specific date
  const openUploadForDate = (dateStr: string) => {
    setTargetDateForAdd(dateStr);
    setActivePopoverDate(null);
    setIsCsvModalOpen(true);
  };

  const openSimulatorForDate = (dateStr: string) => {
    setTargetDateForAdd(dateStr);
    setActivePopoverDate(null);
    setIsSimModalOpen(true);
  };

  // Helper date display name
  const formattedSelectedDate = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDateStr]);

  // Total month stats
  const currentMonthLeadsCount = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return leads.filter((l) => l.dateCaptured && l.dateCaptured.startsWith(prefix)).length;
  }, [leads, currentYear, currentMonth]);

  const todayLeadsCount = (leadsByDate['2026-09-14'] || []).length;

  return (
    <div className="space-y-6">
      {/* Calendar Header & Month Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl border border-gray-200 dark:border-gray-600">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-bold transition-all cursor-pointer"
              title="Previous Month"
            >
              ◀
            </button>
            <span className="px-4 font-black text-lg text-gray-900 dark:text-gray-100">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-bold transition-all cursor-pointer"
              title="Next Month"
            >
              ▶
            </button>
          </div>

          <button
            onClick={handleTodayClick}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🎯</span> Today (14 Sep 2026)
          </button>
        </div>

        {/* Quick Month Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-primary-50 dark:bg-primary-950/40 px-3.5 py-2 rounded-xl border border-primary-200 dark:border-primary-800">
            <span className="text-gray-500 dark:text-gray-400 block text-[10px] font-bold uppercase">
              Leads Today (14 Sep)
            </span>
            <span className="text-lg font-black text-primary-700 dark:text-primary-300">
              {todayLeadsCount} Leads
            </span>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/40 px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800">
            <span className="text-gray-500 dark:text-gray-400 block text-[10px] font-bold uppercase">
              {monthNames[currentMonth]} Total
            </span>
            <span className="text-lg font-black text-purple-700 dark:text-purple-300">
              {currentMonthLeadsCount} Leads
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-center py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-gray-750 bg-gray-100 dark:bg-gray-900">
          {calendarDays.map((dayItem) => {
            const dayLeads = leadsByDate[dayItem.dateStr] || [];
            const isSelected = dayItem.dateStr === selectedDateStr;
            const hotCount = dayLeads.filter((l) => l.leadTemperature === 'Hot').length;
            const isPopoverActive = activePopoverDate === dayItem.dateStr;

            return (
              <div
                key={dayItem.dateStr}
                onClick={() => setSelectedDateStr(dayItem.dateStr)}
                className={`min-h-[110px] p-2 transition-all relative flex flex-col justify-between cursor-pointer group ${
                  dayItem.isCurrentMonth
                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                    : 'bg-gray-50/60 dark:bg-gray-900/60 text-gray-400 dark:text-gray-600'
                } ${
                  isSelected
                    ? 'ring-2 ring-primary-500 z-10 shadow-md bg-primary-50/20 dark:bg-primary-950/20'
                    : ''
                }`}
              >
                {/* Cell Top Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md ${
                        dayItem.isToday
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isSelected
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {dayItem.dayNumber}
                    </span>
                    {dayItem.isToday && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 font-extrabold px-1 rounded uppercase">
                        Today
                      </span>
                    )}
                  </div>

                  {/* + Add Button for this date */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopoverDate(isPopoverActive ? null : dayItem.dateStr);
                      }}
                      className="px-2 py-0.5 bg-primary-50 dark:bg-primary-950 hover:bg-primary-600 hover:text-white text-primary-700 dark:text-primary-300 text-[11px] font-bold rounded-lg border border-primary-200 dark:border-primary-800 transition-all flex items-center gap-1 cursor-pointer"
                      title={`Upload or Simulate leads for ${dayItem.dateStr}`}
                    >
                      <span>+</span> Add
                    </button>

                    {/* Popover Menu for date action */}
                    {isPopoverActive && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-7 z-30 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 animate-in fade-in zoom-in duration-150"
                      >
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 border-b border-gray-100 dark:border-gray-700 mb-1">
                          Add Leads ({dayItem.dateStr})
                        </div>
                        <button
                          onClick={() => openUploadForDate(dayItem.dateStr)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 cursor-pointer"
                        >
                          <span>📊</span> Upload Excel / CSV
                        </button>
                        <button
                          onClick={() => openSimulatorForDate(dayItem.dateStr)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg text-xs font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2 cursor-pointer"
                        >
                          <span>⚡</span> Simulate Meta Lead
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cell Center Content - Lead Badges */}
                <div className="my-1.5 space-y-1">
                  {dayLeads.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] bg-primary-100 dark:bg-primary-900/60 text-primary-900 dark:text-primary-200 font-extrabold px-1.5 py-0.5 rounded-md">
                        <span>📋 {dayLeads.length} Lead{dayLeads.length > 1 ? 's' : ''}</span>
                        {hotCount > 0 && (
                          <span className="text-[9px] bg-red-500 text-white font-black px-1 rounded-full">
                            🔥 {hotCount} Hot
                          </span>
                        )}
                      </div>

                      {/* Lead Preview Names */}
                      <div className="space-y-0.5">
                        {dayLeads.slice(0, 2).map((ld) => (
                          <div
                            key={ld.id}
                            className="text-[10px] truncate text-gray-700 dark:text-gray-300 font-medium px-1 py-0.5 bg-gray-50 dark:bg-gray-750 rounded border border-gray-100 dark:border-gray-700"
                          >
                            • {ld.fullName}
                          </div>
                        ))}
                        {dayLeads.length > 2 && (
                          <div className="text-[9px] font-bold text-gray-400 text-right px-1">
                            +{dayLeads.length - 2} more...
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-8 flex items-center justify-center text-[10px] text-gray-300 dark:text-gray-600 font-medium italic">
                      No leads
                    </div>
                  )}
                </div>

                {/* Cell Footer */}
                <div className="flex justify-between items-center text-[9px] text-gray-400">
                  <span>{dayItem.dateStr}</span>
                  {isSelected && (
                    <span className="text-primary-600 dark:text-primary-400 font-black">
                      Selected ➔
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Leads Stream Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                Leads Captured on {formattedSelectedDate}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Showing all Meta Ads and Excel ingested candidates tagged for this specific calendar date ({selectedDateStr}).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => openUploadForDate(selectedDateStr)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📊</span> Upload Excel for {selectedDateStr.substring(8)} Sep
            </button>
            <button
              onClick={() => openSimulatorForDate(selectedDateStr)}
              className="px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚡</span> + Simulate Meta Lead
            </button>
          </div>
        </div>

        {/* BULK ACTIONS BAR FOR CALENDAR DATE TABLE */}
        {selectedLeadIds.length > 0 && (
          <div className="p-3 bg-gray-900 text-white rounded-xl border border-gray-700 shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
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
              {/* Bulk Stage Mover */}
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
                  <option value="New Lead">New Lead</option>
                  <option value="AI Prepared">AI Prepared</option>
                  <option value="Contact Pending">Contact Pending</option>
                  <option value="Connected">Connected</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Details sent">Details sent</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Payment Link Sent">Payment Link Sent</option>
                  <option value="Seat Reserved">Seat Reserved</option>
                  <option value="Enrolled">Enrolled</option>
                </select>
              </div>

              {/* Bulk Delete Button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>🗑️</span> Delete Selected ({selectedLeadIds.length})
              </button>
            </div>
          </div>
        )}

        {/* Filter & Search Bar for Selected Date */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, email, phone, or company..."
              className="w-full pl-9 pr-4 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 outline-none"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>

          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-3 py-2 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs font-semibold outline-none"
          >
            <option value="all">All Programs</option>
            <option value="ai-pm">AI-Native Project Management</option>
            <option value="ai-gtm">AI-Native GTM</option>
            <option value="ai-fellowship">AI Fellowship</option>
          </select>
        </div>

        {/* Selected Date Lead Table / List */}
        {selectedDateLeads.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAllToggle}
                      title="Select All Leads for Date"
                      className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Role & Company</th>
                  <th className="p-3">Target Program</th>
                  <th className="p-3">Captured Time</th>
                  <th className="p-3">Fit & Temp</th>
                  <th className="p-3">CRM Stage</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {selectedDateLeads.map((lead) => {
                  const isChecked = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      className={`transition-colors ${
                        isChecked
                          ? 'bg-primary-50/60 dark:bg-primary-950/40'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(lead.id)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 dark:border-gray-600 focus:ring-primary-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
                          {lead.fullName}
                        </div>
                        <div className="text-gray-500 text-[11px] font-mono">
                          {lead.phone} • {lead.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">
                          {lead.currentRole}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {lead.currentCompany} ({lead.yearsOfExperience} yrs exp)
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold px-2.5 py-1 rounded-lg text-[11px] bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                          {lead.programName}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-gray-600 dark:text-gray-400">
                        ⏱️ {lead.dateCaptured || selectedDateStr}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                              lead.leadTemperature === 'Hot'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                : lead.leadTemperature === 'Warm'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {lead.leadTemperature === 'Hot' ? '🔥 Hot' : '⚡ Warm'}
                          </span>
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {lead.fitScore}% Fit
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.crmStage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as Stage)}
                          className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs font-semibold cursor-pointer"
                        >
                          <option value="New Lead">New Lead</option>
                          <option value="AI Prepared">AI Prepared</option>
                          <option value="Contact Pending">Contact Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Call Scheduled">Call Scheduled</option>
                          <option value="Follow Up Needed">Follow Up Needed</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Payment Link Sent">Payment Link Sent</option>
                          <option value="Enrolled">Enrolled</option>
                          <option value="Unqualified">Unqualified</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-xs text-xs transition-all cursor-pointer"
                          >
                            View AI Profile ➔
                          </button>
                          <button
                            onClick={() => handleSingleDelete(lead.id, lead.fullName)}
                            title="Delete Lead"
                            className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center space-y-4 bg-gray-50/50 dark:bg-gray-900/40">
            <div className="text-4xl">📥</div>
            <div>
              <h3 className="text-base font-extrabold text-gray-800 dark:text-gray-200">
                No Leads Captured on {formattedSelectedDate}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                There are currently 0 leads ingested for {selectedDateStr}. Click the button below to upload an Excel file or simulate incoming Meta Ad leads for this specific date.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => openUploadForDate(selectedDateStr)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📊</span> Upload Excel Leads for {selectedDateStr}
              </button>
              <button
                onClick={() => openSimulatorForDate(selectedDateStr)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚡</span> + Simulate Meta Lead for {selectedDateStr}
              </button>
            </div>
          </div>
        )}
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
                Are you sure you want to permanently delete <strong className="text-red-600">{selectedLeadIds.length} lead(s)</strong>? This will remove them from your active workspace and database.
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

      {/* Upload Modals passing targetDate */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        targetDate={targetDateForAdd}
      />

      <MetaLeadSimulatorModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        targetDate={targetDateForAdd}
      />
    </div>
  );
}
