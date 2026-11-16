// src/components/LeadSidePanel.tsx
import React, { useState, useEffect } from 'react';
import type { Lead, Stage, ActivityRecord } from '../types';
import { useApp } from '../context/AppContext';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import {
  X,
  Phone,
  MessageSquare,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { calculate48HourWorkingSla } from '../utils/cadenceUtils';

interface LeadSidePanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const LeadSidePanel: React.FC<LeadSidePanelProps> = ({
  lead,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}) => {
  const {
    updateLead,
    updateLeadStage,
    assignLead,
    salespeople,
    logCall,
    callActivities,
    updatePaymentState,
    addCallNote
  } = useApp();

  const [activeTab, setActiveTab] = useState<'timeline' | 'calls' | 'notes' | 'payments'>('timeline');
  const [newNote, setNewNote] = useState('');
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [callOutcome, setCallOutcome] = useState('Connected');
  const [callNotes, setCallNotes] = useState('');
  const [nextTaskDesc, setNextTaskDesc] = useState('');
  const [nextTaskDate, setNextTaskDate] = useState('');

  // Keyboard navigation inside panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (hasNext && onNext) onNext();
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (hasPrev && onPrev) onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!isOpen || !lead) return null;

  const leadTimeline: ActivityRecord[] = lead.activities || [];
  const leadCalls = (callActivities || []).filter((c) => c.leadId === lead.id);

  const sla = calculate48HourWorkingSla(lead.dateCaptured);
  const isOverdue = !sla.isWithin48Hours;

  const handleQuickLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callNotes.trim()) return;

    logCall(
      lead.id,
      callOutcome,
      callNotes,
      nextTaskDesc.trim() && nextTaskDate
        ? {
            action: 'Call',
            dueDateTime: nextTaskDate,
            notes: nextTaskDesc
          }
        : undefined
    );

    setCallNotes('');
    setNextTaskDesc('');
    setIsLoggingCall(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCallNote(lead.id, newNote);
    const existing = lead.comments || '';
    const updated = `[${new Date().toLocaleDateString('en-IN')}] ${newNote}\n${existing}`;
    updateLead(lead.id, { comments: updated });
    setNewNote('');
  };

  const handleSendPayment = () => {
    const fee = lead.programId === 'ai-pm' ? 24999 : 4999;
    updatePaymentState(lead.id, 'Payment link sent', fee);
    const waUrl = `https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
      lead.fullName.split(' ')[0]
    )},%20here%20is%20your%20enrollment%20checkout%20link:%20https://aivalytics-leados.vercel.app/checkout/${lead.id}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] h-full bg-white border-l border-[#E6E6E3] shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 select-none text-[#1F1F1D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Toolbar */}
        <div className="h-13 px-4 border-b border-[#E6E6E3] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous lead"
              className="p-1 rounded-[4px] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed text-[#6B6B66]"
              title="Previous lead (K)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next lead"
              className="p-1 rounded-[4px] hover:bg-[#F3F4F6] disabled:opacity-30 disabled:cursor-not-allowed text-[#6B6B66]"
              title="Next lead (J)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#6B6B66] ml-2">Lead Record</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="Close panel"
              className="p-1 rounded-[4px] hover:bg-[#F3F4F6] text-[#6B6B66] hover:text-[#1F1F1D] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* 2. Candidate Title & Badges */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-[#1F1F1D] tracking-tight leading-snug">
                {lead.fullName}
              </h2>
              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <Avatar name={lead.assignedSalesperson || 'Unassigned'} size={24} />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                aria-label="Lead Stage"
                value={lead.crmStage}
                onChange={(e) => updateLeadStage(lead.id, e.target.value as Stage)}
                className="text-xs bg-[#F7F7F5] border border-[#E6E6E3] rounded-full px-2.5 py-0.5 font-medium cursor-pointer outline-none hover:bg-[#EEF0FD]"
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
                ].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <select
                aria-label="Lead Temperature"
                value={(lead as any).temperature || 'Warm'}
                onChange={(e) => updateLead(lead.id, { temperature: e.target.value } as any)}
                className="text-xs bg-white border border-[#E6E6E3] rounded-full px-2 py-0.5 font-medium cursor-pointer outline-none hover:bg-[#F7F7F5]"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>

              <select
                aria-label="Lead Owner"
                value={lead.assignedSalesperson || 'Unassigned'}
                onChange={(e) => assignLead(lead.id, e.target.value)}
                className="text-xs bg-white border border-[#E6E6E3] rounded-full px-2 py-0.5 font-medium text-[#6B6B66] cursor-pointer outline-none hover:bg-[#F7F7F5]"
              >
                <option value="Unassigned">Unassigned</option>
                {salespeople.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Primary Action Bar (Call, WhatsApp, Log call, Send payment link) */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-1.5 h-9 bg-white border border-[#E6E6E3] hover:bg-[#F3F4F6] text-[#1F1F1D] text-xs font-medium rounded-[6px] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#3B4BDB]" />
              <span>Call ({lead.phone})</span>
            </a>

            <a
              href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
                lead.fullName.split(' ')[0]
              )},%20this%20is%20from%20AIValytics.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 h-9 bg-white border border-[#E6E6E3] hover:bg-[#F3F4F6] text-[#1F1F1D] text-xs font-medium rounded-[6px] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#059669]" />
              <span>WhatsApp</span>
            </a>

            <Button
              variant="secondary"
              size="md"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => setIsLoggingCall((prev) => !prev)}
              className="w-full text-xs"
            >
              Log call outcome
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<CreditCard className="w-3.5 h-3.5" />}
              onClick={handleSendPayment}
              className="w-full text-xs"
            >
              Send payment link
            </Button>
          </div>

          {/* Quick Call Logging Accordion Form */}
          {isLoggingCall && (
            <form
              onSubmit={handleQuickLogCall}
              className="p-3.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[6px] space-y-2.5 text-xs animate-in fade-in"
            >
              <div className="font-semibold text-[#1F1F1D]">Record Call Touchpoint</div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[#6B6B66] block mb-1">Outcome</label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    className="w-full h-7 bg-white border border-[#E6E6E3] rounded-[4px] px-2 text-xs"
                  >
                    <option value="Connected">Connected & Discussed</option>
                    <option value="Interested">High Intent / Interested</option>
                    <option value="No answer">No answer / Did not pick</option>
                    <option value="Busy">Busy</option>
                    <option value="Call back later">Call back later</option>
                    <option value="Wrong number">Wrong number</option>
                    <option value="Not interested">Not interested</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#6B6B66] block mb-1">Next Call Due</label>
                  <input
                    type="datetime-local"
                    value={nextTaskDate}
                    onChange={(e) => setNextTaskDate(e.target.value)}
                    className="w-full h-7 bg-white border border-[#E6E6E3] rounded-[4px] px-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#6B6B66] block mb-1">Discussion Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary of conversation and next steps..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E6E6E3] rounded-[4px] text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoggingCall(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save call log
                </Button>
              </div>
            </form>
          )}

          {/* 4. Next Action Box */}
          <div
            className={`p-3 rounded-[6px] border ${
              isOverdue
                ? 'bg-[#FEF3F2] border-[#FECDCA]'
                : 'bg-[#EEF0FD] border-[#C7D2FE]'
            } flex items-start justify-between gap-3`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5 text-[#B42318] shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-[#3B4BDB] shrink-0" />
                )}
                <span className={isOverdue ? 'text-[#B42318]' : 'text-[#3B4BDB]'}>
                  {lead.nextTask?.taskType || 'Follow-up Action'}
                </span>
              </div>
              <p className="text-xs text-[#1F1F1D] mt-1">
                {lead.nextTask?.notes || lead.nextFollowUp || 'Initial contact outreach scheduled'}
              </p>
              <div
                className={`text-[11px] mt-1 tabular-nums ${
                  isOverdue ? 'text-[#B42318] font-bold' : 'text-[#6B6B66]'
                }`}
              >
                Due: {lead.nextTask?.dueDateTime || 'Today 5:00 PM'} {isOverdue ? '(Overdue)' : ''}
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  updateLead(lead.id, {
                    nextTask: undefined,
                    nextFollowUp: undefined
                  });
                }}
              >
                Done
              </Button>
            </div>
          </div>

          {/* 5. Key-Value Fields List (2 columns) */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B66]">
              Lead Details
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-3 bg-white border border-[#E6E6E3] rounded-[6px] text-xs">
              <div>
                <span className="text-[#6B6B66] block text-[11px]">Phone</span>
                <span className="font-medium">{lead.phone || '—'}</span>
              </div>
              <div>
                <span className="text-[#6B6B66] block text-[11px]">Email</span>
                <span className="font-medium truncate block" title={lead.email}>
                  {lead.email || '—'}
                </span>
              </div>
              <div>
                <span className="text-[#6B6B66] block text-[11px]">Program</span>
                <span className="font-medium">{lead.programName || 'AI Program'}</span>
              </div>
              <div>
                <span className="text-[#6B6B66] block text-[11px]">Source</span>
                <span className="font-medium">{lead.source || 'Meta Ads'}</span>
              </div>
              <div>
                <span className="text-[#6B6B66] block text-[11px]">Campaign</span>
                <span className="font-medium truncate block" title={lead.metaCampaign || lead.campaignName}>
                  {lead.metaCampaign || lead.campaignName || 'Direct'}
                </span>
              </div>
              <div>
                <span className="text-[#6B6B66] block text-[11px]">Ad Set / Ad</span>
                <span className="font-medium truncate block">
                  {lead.metaAd || lead.metaAdSet || 'Creative #1'}
                </span>
              </div>
              <div>
                <span className="text-[#6B6B66] block text-[11px]">City</span>
                <span className="font-medium">{lead.city || 'India'}</span>
              </div>
              <div>
                <span className="text-[#6B6B66] block text-[11px]">Created</span>
                <span className="font-medium tabular-nums">
                  {lead.dateCaptured ? new Date(lead.dateCaptured).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Form Answers from Meta */}
          {lead.formAnswers && Object.keys(lead.formAnswers).length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B66]">
                Meta Lead Ads Responses
              </div>
              <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[6px] space-y-2 text-xs">
                {Object.entries(lead.formAnswers).map(([question, answer]) => (
                  <div key={question} className="border-b border-[#E6E6E3]/60 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-[11px] text-[#6B6B66] block">{question}</span>
                    <span className="font-medium text-[#1F1F1D]">{String(answer)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Bottom Tabs: Timeline | Calls | Notes | Payments */}
          <div className="space-y-3 pt-2">
            <div className="flex border-b border-[#E6E6E3] text-xs font-medium">
              {[
                { id: 'timeline', label: `Timeline (${leadTimeline.length})` },
                { id: 'calls', label: `Calls (${leadCalls.length})` },
                { id: 'notes', label: 'Notes' },
                { id: 'payments', label: 'Payments' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-2 px-3 border-b-2 font-medium cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#3B4BDB] text-[#3B4BDB] font-semibold'
                      : 'border-transparent text-[#6B6B66] hover:text-[#1F1F1D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-3 py-1">
                {leadTimeline.length === 0 ? (
                  <div className="text-xs text-[#6B6B66] py-3 text-center">
                    No timeline events yet. Ingested from {lead.source || 'Meta Ads'}.
                  </div>
                ) : (
                  leadTimeline.map((item: ActivityRecord) => (
                    <div key={item.id} className="flex items-start gap-2.5 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#3B4BDB] mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#1F1F1D]">
                          {item.activityType} · {item.outcome}
                        </div>
                        {item.notes && (
                          <p className="text-[#6B6B66] text-[11px] mt-0.5">{item.notes}</p>
                        )}
                        <span className="text-[10px] text-[#6B6B66] tabular-nums mt-0.5 block">
                          {item.performedBy && `${item.performedBy} · `}
                          {new Date(item.timestamp).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: CALLS */}
            {activeTab === 'calls' && (
              <div className="space-y-2 py-1">
                {leadCalls.length === 0 ? (
                  <div className="text-xs text-[#6B6B66] py-3 text-center">
                    No calls logged yet. Click "Log call outcome" above to record one.
                  </div>
                ) : (
                  leadCalls.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[6px] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{c.outcome}</span>
                        <span className="text-[10px] text-[#6B6B66] tabular-nums">
                          {new Date(c.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {c.notes && <p className="text-[#6B6B66] text-[11px]">{c.notes}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-2.5 py-1">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a rep note..."
                    className="w-full p-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs resize-none"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary" size="sm">
                      Save note
                    </Button>
                  </div>
                </form>

                <div className="p-3 bg-[#F7F7F5] border border-[#E6E6E3] rounded-[6px] text-xs whitespace-pre-wrap text-[#1F1F1D]">
                  {lead.comments || 'No notes added yet for this candidate.'}
                </div>
              </div>
            )}

            {/* TAB CONTENT: PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="space-y-2.5 py-1">
                <div className="p-3 bg-white border border-[#E6E6E3] rounded-[6px] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B66]">Payment Status:</span>
                    <span className="font-semibold text-[#17673A]">
                      {lead.paymentStatus || 'No Request'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B66]">Program Tuition:</span>
                    <span className="font-semibold tabular-nums">
                      {lead.programId === 'ai-pm' ? '₹24,999' : '₹4,999'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
