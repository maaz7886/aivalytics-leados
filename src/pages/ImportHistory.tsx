// src/pages/ImportHistory.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  RotateCcw,
  CheckCircle2,
  Upload,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { ImportBatch } from '../types';

export default function ImportHistory() {
  const { importBatches, undoImportBatch } = useApp();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [undoingBatchId, setUndoingBatchId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUndo = (batch: ImportBatch) => {
    if (!window.confirm(`Are you sure you want to undo the import of "${batch.filename}"?\n\nThis will remove all ${batch.counts.new} contacts created by this batch and restore previous field values.`)) {
      return;
    }

    setUndoingBatchId(batch.id);
    setTimeout(() => {
      const ok = undoImportBatch(batch.id);
      setUndoingBatchId(null);
      if (ok) {
        showToast(`Successfully reverted import batch: "${batch.filename}"`);
      } else {
        showToast('Unable to revert batch (it may be past the 24-hour undo window).');
      }
    }, 400);
  };

  const isUndoable = (batch: ImportBatch): boolean => {
    if (batch.status === 'reverted') return false;
    const expiry = new Date(batch.undoAvailableUntil).getTime();
    return Date.now() < expiry;
  };

  const formatRelativeExpiry = (expiryIso: string): string => {
    const diffMs = new Date(expiryIso).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m left`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#1F1F1D] text-white rounded-lg shadow-lg flex items-center gap-2 text-[13px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E6E3] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#1F1F1D] tracking-tight">
              Import History & Audit Log
            </h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66] tabular-nums font-mono">
              {importBatches.length} Batches Recorded
            </span>
          </div>
          <p className="text-[13px] text-[#6B6B66] mt-0.5">
            Review all bulk CSV, Google Sheet, and Meta webhook ingestions with 24-hour instant rollback capability.
          </p>
        </div>

        <Link to="/import">
          <Button variant="primary" size="md" className="flex items-center gap-2 text-[13px]">
            <Upload className="w-4 h-4" />
            <span>+ New Import</span>
          </Button>
        </Link>
      </div>

      {/* Batches Table */}
      <div className="bg-white border border-[#E6E6E3] rounded-lg p-5 space-y-4">
        <div className="overflow-x-auto rounded-md border border-[#E6E6E3]">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#F7F7F5] text-[#6B6B66] font-medium text-[12px] border-b border-[#E6E6E3]">
                <th className="py-2.5 px-3">Import Date</th>
                <th className="py-2.5 px-3">Source & File</th>
                <th className="py-2.5 px-3">Imported By</th>
                <th className="py-2.5 px-3 text-center">Total Rows</th>
                <th className="py-2.5 px-3 text-center text-[#166534]">New Created</th>
                <th className="py-2.5 px-3 text-center text-[#3B4BDB]">Merged</th>
                <th className="py-2.5 px-3 text-center text-[#B54708]">Duplicates</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Undo Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E3]">
              {importBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#6B6B66] text-[12px]">
                    No import batches found. Click "+ New Import" to ingest leads.
                  </td>
                </tr>
              ) : (
                importBatches.map((batch) => {
                  const canUndo = isUndoable(batch);
                  const isReverted = batch.status === 'reverted';

                  return (
                    <tr
                      key={batch.id}
                      className={`hover:bg-[#F3F4F6] transition-colors ${
                        isReverted ? 'bg-[#F7F7F5] opacity-60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap text-[12px] text-[#1F1F1D]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#6B6B66]" />
                          <span>{new Date(batch.importedAt).toLocaleDateString()}</span>
                          <span className="text-[#6B6B66]">
                            {new Date(batch.importedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#1F1F1D]">{batch.filename}</div>
                        <div className="text-[11px] text-[#6B6B66] font-mono">{batch.source}</div>
                      </td>

                      <td className="py-2.5 px-3 text-[12px]">
                        <div className="flex items-center gap-1.5 text-[#1F1F1D]">
                          <User className="w-3.5 h-3.5 text-[#6B6B66]" />
                          <span>{batch.importedBy}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-[12px] font-medium text-[#1F1F1D]">
                        {batch.counts.total}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-[12px] font-semibold text-[#166534]">
                        +{batch.counts.new}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-[12px] font-semibold text-[#3B4BDB]">
                        {batch.counts.updated}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono tabular-nums text-[12px] text-[#B54708]">
                        {batch.counts.duplicate}
                      </td>

                      <td className="py-2.5 px-3">
                        {isReverted ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] border border-[#E6E6E3] text-[#6B6B66]">
                            Reverted
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#DDF4E4] border border-[#C3ECD0] text-[#17673A]">
                            Completed
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {isReverted ? (
                          <span className="text-[11px] text-[#6B6B66] italic">Undone</span>
                        ) : canUndo ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUndo(batch)}
                              disabled={undoingBatchId === batch.id}
                              className="h-6 text-[11px] px-2 text-[#B42318] hover:bg-[#FEF3F2] border-[#FECDCA]"
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              <span>{undoingBatchId === batch.id ? 'Reverting...' : 'Undo'}</span>
                            </Button>
                            <span className="text-[10px] text-[#B54708] font-mono flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeExpiry(batch.undoAvailableUntil)}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8C8C85]">Undo Expired (&gt;24h)</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
