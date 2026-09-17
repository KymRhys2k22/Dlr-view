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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F] leading-tight sf-headline">
                {title || (isBatch ? 'Edit Batch DLR Number' : 'Edit Item DLR Number')}
              </h3>
              <p className="text-xs text-slate-500 sf-subheadline">
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
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#1D1D1F] rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition-colors cursor-pointer apple-pressable"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Info Summary */}
          <div className="p-3.5 bg-black/[0.025] rounded-2xl border border-black/[0.05] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 sf-subheadline">Current DLR Number:</span>
              <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                #{currentDlrNumber}
              </span>
            </div>
            {isBatch ? (
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-black/[0.05] sf-subheadline">
                <span>Total Items / Qty:</span>
                <span className="font-semibold text-[#1D1D1F]">
                  {targetRecords.length} items · {totalQty} pcs ({formatCurrencyPHP(totalCost)})
                </span>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-black/[0.05]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CopySKUButton sku={targetRecords[0].sku} className="text-[10px] py-0 px-2" />
                  {targetRecords[0].upc && (
                    <CopyUPCButton upc={targetRecords[0].upc} className="text-[10px] py-0 px-2" showIcon={false} />
                  )}
                </div>
                <div className="font-semibold text-[#1D1D1F] truncate sf-subheadline">
                  {targetRecords[0].description || 'Item'}
                </div>
                <div className="text-[11px] text-slate-400 sf-subheadline">
                  Qty: {targetRecords[0].qty} · Loss: {formatCurrencyPHP(targetRecords[0].cost * targetRecords[0].qty)}
                </div>
              </div>
            )}
          </div>

          {/* New DLR Number Input */}
          <div className="space-y-2">
            <label
              htmlFor="new-dlr-input"
              className="block text-[11px] font-semibold sf-caption uppercase text-slate-500"
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
                className={`w-full pl-8 pr-4 py-2.5 bg-black/[0.03] focus:bg-white border ${
                  validationError ? 'border-rose-400 ring-4 ring-rose-500/15' : 'border-black/[0.08]'
                } rounded-xl font-mono text-sm font-bold text-[#1D1D1F] focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500/80 transition-all sf-subheadline`}
              />
            </div>
            {validationError ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1 sf-subheadline">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 sf-subheadline">
                Enter the updated DLR number for tracking and auditing.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1D1D1F] bg-black/[0.04] hover:bg-black/[0.08] transition-colors cursor-pointer apple-pressable sf-subheadline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newDlrNumber.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-600/30 border border-white/20 transition-all cursor-pointer apple-pressable sf-subheadline"
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
