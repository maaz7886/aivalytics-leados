// src/components/ui/CommandPalette.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, X, ArrowRight, LayoutGrid, CheckSquare } from 'lucide-react';
import { StageChip } from './StageChip';
import { Avatar } from './Avatar';
import type { Lead } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLead?: (lead: Lead) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectLead
}) => {
  const [query, setQuery] = useState('');
  const { allLeads, leads } = useApp();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const leadsPool = allLeads || leads || [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global key listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or parent
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLeads = query.trim()
    ? leadsPool
        .filter((l) => {
          const q = query.toLowerCase();
          return (
            l.fullName?.toLowerCase().includes(q) ||
            l.phone?.includes(q) ||
            l.email?.toLowerCase().includes(q) ||
            l.programName?.toLowerCase().includes(q)
          );
        })
        .slice(0, 8)
    : leadsPool.slice(0, 5);

  const handleLeadClick = (lead: Lead) => {
    onClose();
    if (onSelectLead) {
      onSelectLead(lead);
    } else {
      navigate('/leads');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px] flex items-start justify-center pt-20 px-4">
      <div
        className="w-full max-w-xl bg-white border border-[#E6E6E3] rounded-[8px] shadow-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-3.5 h-12 border-b border-[#E6E6E3] gap-2.5 bg-white">
          <Search className="w-4 h-4 text-[#6B6B66] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search leads by name, phone or email... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm text-[#1F1F1D] placeholder-[#9CA3AF] bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#6B6B66] hover:text-[#1F1F1D] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-[#6B6B66] bg-[#F7F7F5] border border-[#E6E6E3] rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-[#F7F7F5]">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#6B6B66] uppercase tracking-wider">
            {query.trim() ? `Matching Leads (${filteredLeads.length})` : 'Recent Leads'}
          </div>

          {filteredLeads.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B6B66]">
              No leads found matching "{query}".
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => handleLeadClick(lead)}
                className="flex items-center justify-between px-3 py-2 rounded-[6px] hover:bg-[#F3F4F6] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={lead.assignedSalesperson || 'Unassigned'} size={24} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#1F1F1D] truncate flex items-center gap-2">
                      <span>{lead.fullName}</span>
                      <span className="text-[11px] text-[#6B6B66] font-normal">
                        {lead.phone}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6B6B66] truncate">
                      {lead.programName || 'AI Program'} • {lead.email || 'No email'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <StageChip stage={lead.crmStage} />
                  <ArrowRight className="w-3.5 h-3.5 text-[#6B6B66]" />
                </div>
              </div>
            ))
          )}

          {/* Quick Page Links */}
          <div className="pt-2 mt-2">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-[#6B6B66] uppercase tracking-wider">
              Quick Views
            </div>
            <div className="grid grid-cols-2 gap-1 p-1">
              <button
                onClick={() => {
                  onClose();
                  navigate('/today');
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#1F1F1D] hover:bg-[#F3F4F6] rounded-[6px] text-left cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#3B4BDB]" /> My Day
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('/leads');
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#1F1F1D] hover:bg-[#F3F4F6] rounded-[6px] text-left cursor-pointer"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#3B4BDB]" /> All Leads Grid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
