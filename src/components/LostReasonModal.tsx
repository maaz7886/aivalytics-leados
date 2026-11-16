// src/components/LostReasonModal.tsx
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { X, AlertTriangle } from 'lucide-react';

interface LostReasonModalProps {
  isOpen: boolean;
  leadName?: string;
  onClose: () => void;
  onConfirm: (reason: string, notes?: string) => void;
}

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  leadName,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('Price / Fee too high');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px] p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-[420px] bg-white border border-[#E6E6E3] rounded-[8px] shadow-xl p-5 text-[#1F1F1D] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E6E3] pb-3">
          <div className="flex items-center gap-2 text-[#8E2424] font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Mark Lead as Lost</span>
          </div>
          <button onClick={onClose} className="text-[#6B6B66] hover:text-[#1F1F1D] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#6B6B66]">
          Please specify why {leadName ? <strong>{leadName}</strong> : 'this candidate'} was marked as Lost.
          This will be logged in reports and analytics.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-medium text-[#1F1F1D] block mb-1">Lost Reason *</label>
            <select
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-8 px-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs outline-none"
            >
              <option value="Price / Fee too high">Price / Fee too high</option>
              <option value="Timing / Not ready now">Timing / Not ready now</option>
              <option value="Joined competitor program">Joined competitor program</option>
              <option value="Unresponsive / Ghosted after 5+ touches">Unresponsive / Ghosted after 5+ touches</option>
              <option value="Not eligible / Unqualified">Not eligible / Unqualified</option>
              <option value="Just exploring / Casual enquiry">Just exploring / Casual enquiry</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#1F1F1D] block mb-1">Additional details (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needs EMI option next cohort in January"
              className="w-full p-2 bg-white border border-[#E6E6E3] rounded-[6px] text-xs resize-none outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E6E6E3]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirm Lost
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
