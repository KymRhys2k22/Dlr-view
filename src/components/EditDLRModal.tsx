import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { CopySKUButton } from './CopySKUButton';
import { CopyUPCButton } from './CopyUPCButton';

interface EditDLRModalProps {
  isOpen: boolean;
  currentDlrNumber: string;
  targetRecords: DLRRecord[];
  onClose: () => void;
  onSave: (recordIds: string[], newDlrNumber: string) => Promise<void>;
  title?: string;
}

export const EditDLRModal: React.FC<EditDLRModalProps> = ({
  isOpen,
  currentDlrNumber,
  targetRecords,
  onClose,
  onSave,
  title,
}) => {
  const [newDlrNumber, setNewDlrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewDlrNumber(currentDlrNumber);
      setValidationError(null);
      setIsSubmitting(false);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentDlrNumber]);

  if (!isOpen || !targetRecords.length) return null;

  const isBatch = targetRecords.length > 1;
  const totalQty = targetRecords.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalCost = targetRecords.reduce((acc, r) => acc + (r.cost || 0) * (r.qty || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDlr = newDlrNumber.trim();
    if (!cleanDlr) {
      setValidationError('Please enter a valid DLR number');
      inputRef.current?.focus();
      return;
    }

    if (cleanDlr === currentDlrNumber.trim()) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    try {
      const recordIds = targetRecords.map((r) => r.id);
      await onSave(recordIds, cleanDlr);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update DLR number';
      setValidationError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {title || (isBatch ? 'Edit Batch DLR Number' : 'Edit Item DLR Number')}
              </h3>
              <p className="text-xs text-slate-500">
                {isBatch
                  ? `Updating ${targetRecords.length} items in batch #${currentDlrNumber}`
                  : `Updating SKU: ${targetRecords[0].sku}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Info Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Current DLR Number:</span>
              <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                #{currentDlrNumber}
              </span>
            </div>
            {isBatch ? (
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <span>Total Items / Qty:</span>
                <span className="font-semibold">
                  {targetRecords.length} items · {totalQty} pcs ({formatCurrencyPHP(totalCost)})
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CopySKUButton sku={targetRecords[0].sku} className="text-[10px] py-0.2 px-1.5" />
                  {targetRecords[0].upc && (
                    <CopyUPCButton upc={targetRecords[0].upc} className="text-[10px] py-0.2 px-1.5" showIcon={false} />
                  )}
                </div>
                <div className="font-medium text-slate-800 truncate">
                  {targetRecords[0].description || 'Item'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Qty: {targetRecords[0].qty} · Loss: {formatCurrencyPHP(targetRecords[0].cost * targetRecords[0].qty)}
                </div>
              </div>
            )}
          </div>

          {/* New DLR Number Input */}
          <div className="space-y-2">
            <label
              htmlFor="new-dlr-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              New DLR Number <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                #
              </span>
              <input
                ref={inputRef}
                id="new-dlr-input"
                type="text"
                value={newDlrNumber}
                onChange={(e) => {
                  setNewDlrNumber(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isSubmitting}
                placeholder="e.g. 2026-001 or 1042"
                className={`w-full pl-8 pr-4 py-2.5 bg-white border ${
                  validationError ? 'border-rose-400 ring-2 ring-rose-500/20' : 'border-slate-300'
                } rounded-xl font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-2xs`}
              />
            </div>
            {validationError ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Enter the updated DLR number for tracking and auditing.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newDlrNumber.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-rose-200 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update DLR Number</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
