// src/components/ui/KanbanView.tsx
import React, { useState } from 'react';
import type { Lead, Stage } from '../../types';
import { StageChip } from './StageChip';
import { TempTag } from './TempTag';
import { Avatar } from './Avatar';
import {
  formatPhoneNumber,
  formatRelativeDue,
  formatProgramName
} from '../../utils/tableFormatters';
import {
  Phone,
  MessageSquare,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';

export const KANBAN_STAGES: Stage[] = [
  'New Lead',
  'Call Pending',
  'Connected',
  'Interested',
  'Qualified',
  'Payment Pending',
  'Converted',
  'Lost'
];

interface KanbanViewProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, targetStage: Stage) => void;
  onRequestLostReason: (lead: Lead) => void;
  isAdmin?: boolean;
  onAddLeadInStage?: (stage: Stage) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  leads,
  onOpenLead,
  onUpdateStage,
  onRequestLostReason,
  isAdmin = false,
  onAddLeadInStage
}) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Stage | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedLeadId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDragOverCol(stage);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDragOverCol(null);
    setDraggedLeadId(null);

    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    if (targetStage === 'Lost') {
      onRequestLostReason(lead);
      return;
    }

    if (targetStage === 'Converted' && !isAdmin) {
      alert('Enrolled is set automatically when payment is verified.');
      return;
    }

    onUpdateStage(id, targetStage);
  };

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden bg-[#F7F7F5] p-3 flex gap-3 select-none">
      {KANBAN_STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => {
          if (stage === 'Converted') {
            return l.crmStage === 'Converted' || l.enrollmentStatus === 'Enrolled';
          }
          if (stage === 'Lost') {
            return l.crmStage === 'Lost' || l.crmStage === 'Not Interested' || l.crmStage === 'Unqualified';
          }
          if (stage === 'Payment Pending') {
            return l.crmStage === 'Payment Pending' || l.crmStage === 'Payment Discussion';
          }
          return l.crmStage === stage;
        });

        const totalPotential = stageLeads.reduce(
          (sum, l) => sum + (l.programId === 'ai-pm' ? 49999 : 6999),
          0
        );

        const isOver = dragOverCol === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
            className={`w-[290px] shrink-0 flex flex-col bg-[#F7F7F5] rounded-[8px] transition-colors ${
              isOver ? 'ring-2 ring-[#3B4BDB] bg-[#EEF0FD]/40' : ''
            }`}
          >
            {/* Column Header */}
            <div className="p-2.5 pb-2 flex items-center justify-between border-b border-[#E6E6E3]/80 bg-white rounded-t-[8px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <StageChip stage={stage} />
                <span className="text-[11px] font-semibold text-[#6B6B66] tabular-nums">
                  {stageLeads.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#6B6B66] tabular-nums font-medium">
                  ₹{(totalPotential / 1000).toFixed(0)}k
                </span>
                {onAddLeadInStage && (
                  <button
                    onClick={() => onAddLeadInStage(stage)}
                    className="p-0.5 text-[#6B6B66] hover:text-[#1F1F1D] rounded"
                    title={`Add lead to ${stage}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Column Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {stageLeads.length === 0 ? (
                <div className="h-20 border border-dashed border-[#E6E6E3] rounded-[6px] flex items-center justify-center text-[11px] text-[#6B6B66]">
                  Drop leads here
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const dueInfo = formatRelativeDue(lead.nextTask?.dueDateTime || lead.nextFollowUp);

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => onOpenLead(lead)}
                      className="group p-2.5 bg-white border border-[#E6E6E3] rounded-[6px] shadow-2xs hover:border-[#3B4BDB]/40 hover:shadow-xs transition-all cursor-grab active:cursor-grabbing text-xs space-y-2 relative"
                    >
                      {/* Top: Name + Program */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="font-semibold text-[#1F1F1D] group-hover:text-[#3B4BDB] truncate">
                          {lead.fullName}
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66] rounded-[3px] shrink-0 font-medium">
                          {formatProgramName(lead.programName)}
                        </span>
                      </div>

                      {/* Phone + Actions */}
                      <div className="flex items-center justify-between text-[#6B6B66] text-[11px] tabular-nums">
                        <span>{formatPhoneNumber(lead.phone)}</span>

                        {/* Hover quick action buttons */}
                        <div className="hidden group-hover:flex items-center gap-1">
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Call ${lead.fullName}`}
                            title="Call"
                            className="p-1 hover:text-[#3B4BDB] hover:bg-[#F3F4F6] rounded"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <a
                            href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`WhatsApp ${lead.fullName}`}
                            title="WhatsApp"
                            className="p-1 hover:text-[#059669] hover:bg-[#F3F4F6] rounded"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Next Action + Due date */}
                      {(lead.nextTask?.notes || lead.nextFollowUp) && (
                        <div className="pt-1 border-t border-[#E6E6E3]/60 text-[11px] space-y-0.5">
                          <div className="text-[#1F1F1D] truncate font-medium">
                            {lead.nextTask?.notes || lead.nextFollowUp}
                          </div>
                          <div
                            className={`flex items-center gap-1 text-[10px] tabular-nums ${
                              dueInfo.isOverdue || dueInfo.isMissing
                                ? 'text-[#B42318] font-bold'
                                : 'text-[#6B6B66]'
                            }`}
                          >
                            {dueInfo.isOverdue ? (
                              <AlertCircle className="w-3 h-3 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 shrink-0" />
                            )}
                            <span>{dueInfo.text}</span>
                          </div>
                        </div>
                      )}

                      {/* Bottom Footer: Temperature tag + Owner Avatar */}
                      <div className="pt-1 border-t border-[#E6E6E3]/60 flex items-center justify-between">
                        <TempTag
                          temperature={
                            ((lead as any).temperature ||
                              (lead as any).leadTemperature ||
                              'Warm') as any
                          }
                        />

                        <div className="flex items-center gap-1 text-[10px] text-[#6B6B66]">
                          <Avatar name={lead.assignedSalesperson || 'Unassigned'} size={18} />
                          <span className="truncate max-w-[80px]">
                            {lead.assignedSalesperson
                              ? lead.assignedSalesperson.split(' ')[0]
                              : 'Unassigned'}
                          </span>
                        </div>
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
  );
};
