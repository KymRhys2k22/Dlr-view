import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { CopySKUButton } from './CopySKUButton';
import { CopyUPCButton } from './CopyUPCButton';

interface AssignDLRModalProps {
  isOpen: boolean;
  selectedRecords: DLRRecord[];
  onClose: () => void;
  onAssign: (dlrNumber: string) => Promise<void>;
}

export const AssignDLRModal: React.FC<AssignDLRModalProps> = ({
  isOpen,
  selectedRecords,
  onClose,
  onAssign,
}) => {
  const [dlrNumber, setDlrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDlrNumber('');
      setValidationError(null);
      setIsSubmitting(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalQty = selectedRecords.reduce((acc, r) => acc + (r.qty || 0), 0);
  const totalCost = selectedRecords.reduce((acc, r) => acc + (r.cost || 0) * (r.qty || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDlr = dlrNumber.trim();
    if (!cleanDlr) {
      setValidationError('Please enter a valid DLR number');
      inputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    try {
      await onAssign(cleanDlr);
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
      onClick={() => !isSubmitting && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Assign DLR Number
              </h3>
              <p className="text-xs text-slate-500">
                File and assign selected items under an official report number
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <div>
              <div className="text-[11px] font-medium text-slate-500">Selected Items</div>
              <div className="text-sm font-bold text-slate-900">{selectedRecords.length} items</div>
            </div>
            <div className="border-x border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">Total Units</div>
              <div className="text-sm font-bold text-slate-900">{totalQty} pcs</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Total Loss</div>
              <div className="text-sm font-bold text-rose-600 font-mono">
                {formatCurrencyPHP(totalCost)}
              </div>
            </div>
          </div>

          {/* DLR Number Input */}
          <div className="space-y-1.5">
            <label htmlFor="dlr-number-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Official DLR Number <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                id="dlr-number-input"
                ref={inputRef}
                type="text"
                value={dlrNumber}
                onChange={(e) => {
                  setDlrNumber(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                disabled={isSubmitting}
                placeholder="e.g. DLR-2026-001 or 202-DLR-088"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all uppercase"
              />
            </div>
            {validationError ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Assigned records will move from Active Audit to the Filed DLRs archive.
              </p>
            )}
          </div>

          {/* Selected Records Preview List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Items in this Batch ({selectedRecords.length})</span>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50 p-1">
              {selectedRecords.map((item) => (
                <div key={item.id} className="p-2 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <CopySKUButton sku={item.sku} className="text-[10px] py-0.2 px-1.5" />
                      {item.upc && (
                        <CopyUPCButton upc={item.upc} className="text-[10px] py-0.2 px-1.5" showIcon={false} />
                      )}
                      <span className="truncate font-medium text-slate-700">
                        {item.description || 'No description'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{item.departmentName}</span>
                      <span>·</span>
                      <span>Qty: {item.qty}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono font-semibold text-slate-800">
                    {formatCurrencyPHP(item.cost * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !dlrNumber.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Filing Items...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Assign & File Items</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
