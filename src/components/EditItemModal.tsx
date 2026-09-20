import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  CheckCircle2,
  Lock,
  Layers,
  Building2,
  Boxes,
  Loader2,
  AlertTriangle,
  Minus,
  Plus,
} from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { CopySKUButton } from './CopySKUButton';
import { CopyUPCButton } from './CopyUPCButton';
import {
  DAISO_DEPARTMENTS,
  matchDepartmentOption,
  getSubDepartmentsForDepartment,
} from '../data/departmentData';

interface EditItemModalProps {
  isOpen: boolean;
  record: DLRRecord | null;
  onClose: () => void;
  onSave: (
    recordId: string,
    updates: { department: string; subDep: string | null; qty: number }
  ) => Promise<void>;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  record,
  onClose,
  onSave,
  onToast,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSubDep, setSelectedSubDep] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when record changes or modal opens
  useEffect(() => {
    if (record && isOpen) {
      // Find matching canonical department
      const matchedDept = matchDepartmentOption(
        record.departmentCode || record.departmentName
      );
      setSelectedDepartment(matchedDept.label);

      // Find matching subdepartment or default
      const availableSubs = matchedDept.subDepartments;
      const currentSub = record.subDep ? String(record.subDep).trim() : '';
      const matchedSub = availableSubs.find(
        (s) =>
          s.label === currentSub ||
          currentSub.includes(s.label) ||
          s.label.toLowerCase().includes(currentSub.toLowerCase())
      );

      setSelectedSubDep(matchedSub ? matchedSub.label : availableSubs[0]?.label || '');
      setQty(Math.max(1, record.qty || 1));
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  // Available sub-departments based on currently selected department
  const currentSubDepartments = getSubDepartmentsForDepartment(selectedDepartment);

  // When user changes department dropdown
  const handleDepartmentChange = (newDeptLabel: string) => {
    setSelectedDepartment(newDeptLabel);
    const newSubs = getSubDepartmentsForDepartment(newDeptLabel);
    // If the currently selected subdep isn't in newSubs, switch to the first one
    const stillValid = newSubs.some((s) => s.label === selectedSubDep);
    if (!stillValid) {
      setSelectedSubDep(newSubs[0]?.label || '');
    }
  };

  const handleQtyChange = (val: number) => {
    const validQty = Math.max(1, Math.floor(val));
    setQty(validQty);
    if (errorMsg) setErrorMsg(null);
  };

  const currentTotalLoss = record.cost * (record.qty || 1);
  const newTotalLoss = record.cost * qty;
  const hasChanges =
    selectedDepartment !== (record.departmentCode || record.departmentName) ||
    selectedSubDep !== (record.subDep || '') ||
    qty !== record.qty;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qty < 1) {
      setErrorMsg('Quantity must be at least 1');
      return;
    }

    if (!selectedDepartment) {
      setErrorMsg('Please select a valid Department');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSave(record.id, {
        department: selectedDepartment,
        subDep: selectedSubDep || null,
        qty,
      });
      onToast(`Updated SKU ${record.sku} details successfully!`, 'success');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update item details';
      setErrorMsg(msg);
      onToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
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
                Edit Item Details
              </h3>
              <p className="text-xs text-slate-500 sf-subheadline">
                Only Department, Sub Department, and Quantity can be modified
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

        {/* Form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Read-only Item Overview (Locked) */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider sf-caption">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Read-Only Item Information
              </span>
              <span className="text-[10px] text-slate-400 bg-black/[0.04] px-2 py-0.5 rounded-full font-medium">
                Not Editable
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <CopySKUButton sku={record.sku} className="text-[11px] py-0.5 px-2.5" onToast={onToast} />
                {record.upc && (
                  <CopyUPCButton
                    upc={record.upc}
                    className="text-[11px] py-0.5 px-2.5"
                    showIcon={false}
                    onToast={onToast}
                  />
                )}
              </div>
              <h4 className="font-semibold text-sm text-[#1D1D1F] leading-snug sf-headline">
                {record.description || 'No Description'}
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold sf-caption">
                  Defect Reason
                </span>
                <span className="font-medium text-slate-700 truncate block sf-subheadline" title={record.reason}>
                  {record.reason}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold sf-caption">
                  Unit Cost
                </span>
                <span className="font-semibold text-slate-800 font-mono sf-subheadline">
                  {formatCurrencyPHP(record.cost)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold sf-caption">
                  Retail SRP
                </span>
                <span className="font-semibold text-slate-800 font-mono sf-subheadline">
                  {formatCurrencyPHP(record.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Editable Section (Department, SubDep, Quantity) */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider sf-caption flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-rose-600" />
                Editable Fields (3)
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Saves directly to Supabase
              </span>
            </div>

            {/* 1. Department Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-department-select"
                className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5 sf-subheadline"
              >
                <Building2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Department</span>
                <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <select
                  id="edit-department-select"
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-[#1D1D1F] focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 transition-all cursor-pointer sf-subheadline"
                >
                  {DAISO_DEPARTMENTS.map((dept) => (
                    <option key={dept.code} value={dept.label}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 sf-subheadline">
                Select from official Daiso department categories.
              </p>
            </div>

            {/* 2. Sub Department Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-subdepartment-select"
                className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5 sf-subheadline"
              >
                <Layers className="w-3.5 h-3.5 text-rose-600" />
                <span>Sub Department</span>
              </label>
              <div className="relative">
                <select
                  id="edit-subdepartment-select"
                  value={selectedSubDep}
                  onChange={(e) => setSelectedSubDep(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-[#1D1D1F] focus:outline-none focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 transition-all cursor-pointer sf-subheadline"
                >
                  {currentSubDepartments.map((sub) => (
                    <option key={sub.code} value={sub.label}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 sf-subheadline">
                Sub-department automatically updates based on selected department.
              </p>
            </div>

            {/* 3. Quantity Input with Stepper */}
            <div className="space-y-1.5">
              <label
                htmlFor="edit-quantity-input"
                className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5 sf-subheadline"
              >
                <Boxes className="w-3.5 h-3.5 text-rose-600" />
                <span>Quantity</span>
                <span className="text-rose-600">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty - 1)}
                    disabled={qty <= 1 || isSubmitting}
                    className="p-2.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer apple-pressable"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    id="edit-quantity-input"
                    type="number"
                    min="1"
                    step="1"
                    value={qty}
                    onChange={(e) => handleQtyChange(parseInt(e.target.value, 10) || 1)}
                    disabled={isSubmitting}
                    className="w-16 sm:w-20 py-2 text-center text-sm font-bold text-[#1D1D1F] focus:outline-none border-x border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleQtyChange(qty + 1)}
                    disabled={isSubmitting}
                    className="p-2.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer apple-pressable"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Live Total Loss Preview */}
                <div className="flex-1 px-3.5 py-2 bg-rose-50/60 rounded-xl border border-rose-100/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 sf-caption">New Total Loss:</span>
                  <span className="font-bold text-rose-600 font-mono sf-headline text-sm">
                    {formatCurrencyPHP(newTotalLoss)}
                  </span>
                </div>
              </div>
              {qty !== record.qty && (
                <p className="text-[11px] text-amber-600 sf-subheadline">
                  Quantity changed from {record.qty} to {qty} (Difference:{' '}
                  {formatCurrencyPHP(newTotalLoss - currentTotalLoss)})
                </p>
              )}
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 sf-subheadline">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#1D1D1F] bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer apple-pressable sf-subheadline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || qty < 1 || !hasChanges}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-600/25 transition-all cursor-pointer apple-pressable sf-subheadline"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
