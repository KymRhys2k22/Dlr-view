import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  record: DLRRecord | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  record,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen || !record) return null;

  const totalLoss = record.cost * record.qty;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Danger Accent */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Delete DLR Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm permanent removal of this report
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="px-5 py-3 space-y-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                SKU: {record.sku}
              </span>
              <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {record.qty} {record.qty === 1 ? 'unit' : 'units'}
              </span>
            </div>

            <div className="font-bold text-slate-800 line-clamp-2">
              {record.description || 'No Description'}
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500">
              <span>Defect: <span className="font-semibold text-slate-700">{record.reason}</span></span>
              <span>Loss: <span className="font-bold text-slate-900">{formatCurrencyPHP(totalLoss)}</span></span>
            </div>
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This action cannot be undone. The record will be permanently deleted from the database.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
