import React, { useState, useEffect } from 'react';
import { X, FileSpreadsheet, Layers, RotateCcw, Loader2, Pencil, Check, FileText } from 'lucide-react';
import { FiledDLRGroup } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { DLRImagePreview } from './DLRImagePreview';
import { CopySKUButton } from './CopySKUButton';
import { CopyUPCButton } from './CopyUPCButton';
import { exportDLRToExcel } from '../utils/exportExcel';
import { exportFiledDLRToPdf } from '../utils/exportPdf';

interface FiledDLRDetailModalProps {
  isOpen: boolean;
  group: FiledDLRGroup | null;
  storeCode: string;
  onClose: () => void;
  onOpenImageModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string; upc?: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onUnfileRecord?: (recordId: string) => Promise<void>;
  onUpdateDLRNumber?: (recordIds: string[], newDlrNumber: string) => Promise<void>;
}

export const FiledDLRDetailModal: React.FC<FiledDLRDetailModalProps> = ({
  isOpen,
  group,
  storeCode,
  onClose,
  onOpenImageModal,
  onToast,
  onUnfileRecord,
  onUpdateDLRNumber,
}) => {
  const [unfilingId, setUnfilingId] = useState<string | null>(null);

  // Batch DLR edit state
  const [isEditingBatchDlr, setIsEditingBatchDlr] = useState(false);
  const [batchDlrInput, setBatchDlrInput] = useState('');
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Per-item DLR edit state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordDlrInput, setRecordDlrInput] = useState('');
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (group) {
      setBatchDlrInput(group.dlrNumber);
      setIsEditingBatchDlr(false);
      setEditingRecordId(null);
    }
  }, [group?.dlrNumber, isOpen]);

  if (!isOpen || !group) return null;

  const handleSaveBatchDlr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDlr = batchDlrInput.trim();
    if (!cleanDlr) {
      onToast('DLR Number cannot be empty', 'error');
      return;
    }
    if (cleanDlr === group.dlrNumber) {
      setIsEditingBatchDlr(false);
      return;
    }
    if (!onUpdateDLRNumber) return;

    setIsSavingBatch(true);
    try {
      const recordIds = group.records.map((r) => r.id);
      await onUpdateDLRNumber(recordIds, cleanDlr);
      setIsEditingBatchDlr(false);
      onToast(`Updated batch to DLR #${cleanDlr}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update DLR number';
      onToast(msg, 'error');
    } finally {
      setIsSavingBatch(false);
    }
  };

  const handleSaveRecordDlr = async (e: React.FormEvent, recordId: string) => {
    e.preventDefault();
    const cleanDlr = recordDlrInput.trim();
    if (!cleanDlr) {
      onToast('DLR Number cannot be empty', 'error');
      return;
    }
    const currentRecord = group.records.find((r) => r.id === recordId);
    if (cleanDlr === (currentRecord?.dlrNumber || group.dlrNumber)) {
      setEditingRecordId(null);
      return;
    }
    if (!onUpdateDLRNumber) return;

    setIsSavingRecord(true);
    try {
      await onUpdateDLRNumber([recordId], cleanDlr);
      setEditingRecordId(null);
      onToast(`Updated SKU ${currentRecord?.sku || ''} to DLR #${cleanDlr}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update DLR number';
      onToast(msg, 'error');
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const isApproved = group.status === 'approved';
      const today = new Date().toISOString().split('T')[0];
      const prefix = isApproved ? 'Approved' : 'Filed';
      exportDLRToExcel(group.records, `${prefix}_${group.dlrNumber}`, storeCode, {
        isApproved,
        isFiled: !isApproved,
        includeImages: false,
        dlrNumber: group.dlrNumber,
        filenameOverride: `DLR_${prefix}_${group.dlrNumber}_${today}.xlsx`,
      });
      onToast(`Exported DLR #${group.dlrNumber} to Excel!`, 'success');
    } catch (err) {
      console.error(err);
      onToast('Failed to export Excel file', 'error');
    }
  };

  const handleExportPdf = async () => {
    if (!group || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const isApproved = group.status === 'approved';
      onToast(`Building PDF report with item photos for DLR #${group.dlrNumber}...`, 'info');
      await exportFiledDLRToPdf(group.records, group.dlrNumber, storeCode, {
        status: group.status,
        isApproved,
      });
      onToast(`Downloaded PDF report for DLR #${group.dlrNumber}!`, 'success');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      onToast('Failed to export PDF file', 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleUnfile = async (recordId: string, sku: string) => {
    if (!onUnfileRecord) return;
    setUnfilingId(recordId);
    try {
      await onUnfileRecord(recordId);
      onToast(`Moved SKU ${sku} back to Active Audit.`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to unfile record';
      onToast(msg, 'error');
    } finally {
      setUnfilingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05] bg-black/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            {isEditingBatchDlr ? (
              <form
                onSubmit={handleSaveBatchDlr}
                className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border-2 border-rose-500 shadow-xs"
              >
                <span className="text-slate-400 font-mono font-bold text-sm pl-2">#</span>
                <input
                  type="text"
                  value={batchDlrInput}
                  onChange={(e) => setBatchDlrInput(e.target.value)}
                  disabled={isSavingBatch}
                  placeholder="DLR #"
                  className="w-28 sm:w-36 text-xs sm:text-sm font-mono font-bold text-[#1D1D1F] focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isSavingBatch || !batchDlrInput.trim()}
                  className="p-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors cursor-pointer apple-pressable"
                  title="Save DLR Number"
                >
                  {isSavingBatch ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingBatchDlr(false);
                    setBatchDlrInput(group.dlrNumber);
                  }}
                  disabled={isSavingBatch}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-black/[0.04] transition-colors cursor-pointer apple-pressable"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center justify-center px-3 py-1 rounded-full bg-rose-600 text-white font-mono font-bold text-sm sm:text-base shadow-sm">
                  #{group.dlrNumber}
                </div>
                {onUpdateDLRNumber && (
                  <button
                    type="button"
                    onClick={() => {
                      setBatchDlrInput(group.dlrNumber);
                      setIsEditingBatchDlr(true);
                    }}
                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer apple-pressable"
                    title="Edit batch DLR number"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] leading-tight sf-headline">
                {group.status === 'approved' ? 'Approved DLR Report' : 'Filed DLR Report'}
              </h3>
              <p className="text-xs text-slate-500 sf-subheadline">
                {group.totalRecords} record(s) · {group.totalQuantity} total pcs · {formatCurrencyPHP(group.totalCost)} total loss
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs transition-colors cursor-pointer apple-pressable sf-subheadline disabled:opacity-60"
              title="Download official PDF report with item photos"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isGeneratingPdf ? 'Building PDF...' : 'Export PDF'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer apple-pressable sf-subheadline"
              title="Export this DLR batch to Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#1D1D1F] rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition-colors cursor-pointer apple-pressable"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            {group.records.map((record) => {
              const itemTotal = record.cost * record.qty;
              const isUnfiling = unfilingId === record.id;
              const isEditingThisRecord = editingRecordId === record.id;

              return (
                <div key={record.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CopySKUButton sku={record.sku} onToast={onToast} />
                      {record.upc && (
                        <CopyUPCButton upc={record.upc} onToast={onToast} />
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {record.departmentName}
                      </span>
                      {record.subDep && (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>{record.subDep}</span>
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-slate-800">
                      {record.description || 'No Description'}
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-700">Reason:</span> {record.reason}
                      {record.secondReason && ` · ${record.secondReason}`}
                    </div>
                  </div>

                  {/* Quantity & Cost */}
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Qty</div>
                      <div className="text-sm font-bold text-slate-800">{record.qty}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Loss</div>
                      <div className="text-sm font-bold text-rose-600 font-mono">
                        {formatCurrencyPHP(itemTotal)}
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="shrink-0">
                    <DLRImagePreview
                      images={record.images}
                      sku={record.sku}
                      upc={record.upc}
                      description={record.description}
                      reason={record.reason}
                      onOpenModal={onOpenImageModal}
                      onToast={onToast}
                    />
                  </div>

                  {/* Actions: Edit DLR & Unfile */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditingThisRecord ? (
                      <form
                        onSubmit={(e) => handleSaveRecordDlr(e, record.id)}
                        className="flex items-center gap-1 bg-white p-1 rounded-xl border border-rose-300 shadow-xs"
                      >
                        <span className="text-[11px] font-bold text-slate-400 font-mono pl-1.5">#</span>
                        <input
                          type="text"
                          value={recordDlrInput}
                          onChange={(e) => setRecordDlrInput(e.target.value)}
                          disabled={isSavingRecord}
                          className="w-20 sm:w-24 px-1.5 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none"
                          placeholder="DLR #"
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={isSavingRecord || !recordDlrInput.trim()}
                          className="p-1 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                          title="Save DLR #"
                        >
                          {isSavingRecord ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingRecordId(null)}
                          disabled={isSavingRecord}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      onUpdateDLRNumber && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRecordId(record.id);
                            setRecordDlrInput(record.dlrNumber || group.dlrNumber);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                          title="Edit DLR number for this item"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit DLR #</span>
                        </button>
                      )
                    )}

                    {onUnfileRecord && (
                      <button
                        type="button"
                        onClick={() => handleUnfile(record.id, record.sku)}
                        disabled={isUnfiling || isSavingRecord}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 transition-colors cursor-pointer disabled:opacity-50"
                        title="Move back to Active Audit"
                      >
                        {isUnfiling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>Unfile</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <span>Official Daiso Audit Record</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
