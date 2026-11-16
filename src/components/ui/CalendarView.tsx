// src/components/ui/CalendarView.tsx
import React, { useState, useMemo } from 'react';
import type { Lead } from '../../types';
import {
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatPhoneNumber, formatRelativeDue } from '../../utils/tableFormatters';

interface CalendarViewProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ leads, onOpenLead }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Month navigation
  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Compute month days grid
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Preceding month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toISOString().substring(0, 10)
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateStr: d.toISOString().substring(0, 10)
      });
    }

    // Following month leading days (fill up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toISOString().substring(0, 10)
      });
    }

    return days;
  }, [currentDate]);

  // Group leads by date of next action or follow-up
  const leadsByDate = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    leads.forEach((l) => {
      const due = l.nextTask?.dueDateTime || l.nextFollowUp || '';
      if (!due) return;
      const dateKey = due.substring(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(l);
    });
    return map;
  }, [leads]);

  const monthTitle = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().substring(0, 10);

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none text-[#1F1F1D]">
      {/* Calendar Header Controls */}
      <div className="h-12 px-4 border-b border-[#E6E6E3] bg-[#F7F7F5] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#1F1F1D]">{monthTitle}</h2>
          <div className="flex items-center gap-0.5 ml-2">
            <button
              onClick={prevPeriod}
              aria-label="Previous month"
              className="p-1 text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-white rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              aria-label="Next month"
              className="p-1 text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-white rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={goToday}
              className="px-2 py-0.5 text-xs font-medium text-[#6B6B66] hover:text-[#1F1F1D] hover:bg-white rounded border border-[#E6E6E3] ml-1"
            >
              Today
            </button>
          </div>
        </div>

        {/* Month / Week switcher */}
        <div className="flex items-center p-0.5 bg-white border border-[#E6E6E3] rounded-[6px] text-xs">
          <button
            onClick={() => setViewMode('month')}
            className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
              viewMode === 'month' ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold' : 'text-[#6B6B66] hover:text-[#1F1F1D]'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
              viewMode === 'week' ? 'bg-[#EEF0FD] text-[#3B4BDB] font-semibold' : 'text-[#6B6B66] hover:text-[#1F1F1D]'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Weekdays Bar */}
      <div className="grid grid-cols-7 border-b border-[#E6E6E3] bg-[#F7F7F5] text-[11px] font-semibold text-[#6B6B66] text-center py-1.5 shrink-0">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto divide-x divide-y divide-[#E6E6E3]">
        {monthDays.map((cell) => {
          const isToday = cell.dateStr === todayStr;
          const dayLeads = leadsByDate[cell.dateStr] || [];

          return (
            <div
              key={cell.dateStr}
              className={`p-1.5 min-h-[90px] flex flex-col transition-colors ${
                cell.isCurrentMonth ? 'bg-white' : 'bg-[#F7F7F5]/50 text-[#6B6B66]/60'
              } hover:bg-[#F3F4F6]/50`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between text-xs mb-1">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full tabular-nums font-medium ${
                    isToday
                      ? 'bg-[#3B4BDB] text-white font-bold'
                      : cell.isCurrentMonth
                      ? 'text-[#1F1F1D]'
                      : 'text-[#6B6B66]/60'
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {dayLeads.length > 0 && (
                  <span className="text-[10px] text-[#6B6B66] font-medium tabular-nums">
                    {dayLeads.length}
                  </span>
                )}
              </div>

              {/* Event Cards inside Day */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayLeads.map((lead) => {
                  const dueInfo = formatRelativeDue(lead.nextTask?.dueDateTime || lead.nextFollowUp);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onOpenLead(lead)}
                      title={`${lead.fullName} (${formatPhoneNumber(lead.phone)}): ${lead.nextTask?.notes || lead.nextFollowUp}`}
                      className="p-1 bg-[#EEF0FD] hover:bg-[#EEF0FD]/80 border border-[#3B4BDB]/20 rounded-[4px] cursor-pointer text-[11px] leading-tight space-y-0.5 truncate transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-[#1F1F1D] truncate">
                          {lead.fullName}
                        </span>
                        {dueInfo.isOverdue && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B42318] shrink-0" />
                        )}
                      </div>
                      <div
                        className={`truncate text-[10px] tabular-nums ${
                          dueInfo.isOverdue ? 'text-[#B42318] font-bold' : 'text-[#6B6B66]'
                        }`}
                      >
                        {dueInfo.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
