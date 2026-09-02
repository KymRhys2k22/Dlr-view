import React, { useState } from 'react';
import { X, FileSpreadsheet, Layers, RotateCcw, Loader2 } from 'lucide-react';
import { FiledDLRGroup } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { DLRImagePreview } from './DLRImagePreview';
import { CopySKUButton } from './CopySKUButton';
import { exportDLRToExcel } from '../utils/exportExcel';

interface FiledDLRDetailModalProps {
  isOpen: boolean;
  group: FiledDLRGroup | null;
  storeCode: string;
  onClose: () => void;
  onOpenImageModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onUnfileRecord?: (recordId: string) => Promise<void>;
}

export const FiledDLRDetailModal: React.FC<FiledDLRDetailModalProps> = ({
  isOpen,
  group,
  storeCode,
  onClose,
  onOpenImageModal,
  onToast,
  onUnfileRecord,
}) => {
  const [unfilingId, setUnfilingId] = useState<string | null>(null);

  if (!isOpen || !group) return null;

  const handleExportExcel = () => {
    try {
      exportDLRToExcel(group.records, `Filed_${group.dlrNumber}`, storeCode);
      onToast(`Exported DLR #${group.dlrNumber} to Excel!`, 'success');
    } catch (err) {
      console.error(err);
      onToast('Failed to export Excel file', 'error');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center px-3 py-1.5 rounded-xl bg-rose-600 text-white font-mono font-black text-sm sm:text-base shadow-sm">
              #{group.dlrNumber}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Filed DLR Report
              </h3>
              <p className="text-xs text-slate-500">
                {group.totalRecords} record(s) · {group.totalQuantity} total pcs · {formatCurrencyPHP(group.totalCost)} total loss
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
              title="Export this DLR batch to Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
            {group.records.map((record) => {
              const itemTotal = record.cost * record.qty;
              const isUnfiling = unfilingId === record.id;

              return (
                <div key={record.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CopySKUButton sku={record.sku} onToast={onToast} />
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
                      description={record.description}
                      reason={record.reason}
                      onOpenModal={onOpenImageModal}
                      onToast={onToast}
                    />
                  </div>

                  {/* Actions: Unfile */}
                  {onUnfileRecord && (
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUnfile(record.id, record.sku)}
                        disabled={isUnfiling}
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
                    </div>
                  )}
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
