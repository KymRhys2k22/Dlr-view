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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Danger Accent */}
        <div className="flex items-start justify-between p-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F] leading-tight sf-headline">
                Delete DLR Report
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 sf-subheadline">
                Confirm permanent removal of this report
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#1D1D1F] rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition-colors disabled:opacity-50 apple-pressable cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="px-6 py-3 space-y-3">
          <div className="p-3.5 bg-black/[0.025] rounded-2xl border border-black/[0.05] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-[#1D1D1F] bg-white px-2.5 py-0.5 rounded-full border border-black/[0.06]">
                SKU: {record.sku}
              </span>
              <span className="font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 sf-caption">
                {record.qty} {record.qty === 1 ? 'unit' : 'units'}
              </span>
            </div>

            <div className="font-semibold text-[#1D1D1F] line-clamp-2 sf-subheadline">
              {record.description || 'No Description'}
            </div>

            <div className="pt-2 border-t border-black/[0.05] flex items-center justify-between text-slate-500 sf-subheadline">
              <span>Defect: <span className="font-medium text-slate-800">{record.reason}</span></span>
              <span>Loss: <span className="font-bold text-rose-600 sf-headline">{formatCurrencyPHP(totalLoss)}</span></span>
            </div>
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs sf-subheadline">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              This action cannot be undone. The record will be permanently deleted from the database.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-3 bg-black/[0.02] border-t border-black/[0.05] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#1D1D1F] bg-black/[0.05] hover:bg-black/[0.08] rounded-full transition-colors disabled:opacity-50 apple-pressable cursor-pointer sf-subheadline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-full shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 apple-pressable cursor-pointer sf-subheadline"
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
