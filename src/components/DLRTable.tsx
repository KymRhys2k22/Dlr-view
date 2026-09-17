import React from 'react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { DLRImagePreview } from './DLRImagePreview';
import { CopySKUButton } from './CopySKUButton';
import { CopyUPCButton } from './CopyUPCButton';
import { AlertCircle, Layers, Trash2, Sparkles } from 'lucide-react';

interface DLRTableProps {
  records: DLRRecord[];
  onOpenModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string; upc?: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onDeleteRecord?: (record: DLRRecord) => void;
  newlyAddedIds?: Set<string>;
  isSelectable?: boolean;
  selectedRecordIds?: Set<string>;
  onToggleSelectRecord?: (recordId: string) => void;
  onToggleSelectAll?: () => void;
}

export const DLRTable: React.FC<DLRTableProps> = ({
  records,
  onOpenModal,
  onToast,
  onDeleteRecord,
  newlyAddedIds,
  isSelectable = false,
  selectedRecordIds = new Set(),
  onToggleSelectRecord,
  onToggleSelectAll,
}) => {
  const deptColors: Record<string, string> = {
    Houseware: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
    Fashion: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
    'Food & DIY': 'bg-amber-500/10 text-amber-800 border-amber-500/20',
    Cleaning: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    'Outdoor & GMS': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    Unknown: 'bg-black/[0.05] text-slate-700 border-black/[0.08]',
  };

  const isAllSelected =
    records.length > 0 && records.every((r) => selectedRecordIds.has(r.id));

  return (
    <div className="apple-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.06] bg-black/[0.02] text-[11px] font-semibold sf-caption text-slate-400">
              {isSelectable && (
                <th className="py-3.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500/30 border-slate-300 cursor-pointer apple-pressable"
                  />
                </th>
              )}
              <th className="py-3.5 px-4">Item Details</th>
              <th className="py-3.5 px-3">Department / SubDep</th>
              <th className="py-3.5 px-3">Defect Reason</th>
              <th className="py-3.5 px-3 text-center">Qty</th>
              <th className="py-3.5 px-3 text-right">Cost / Price</th>
              <th className="py-3.5 px-3 text-right">Total Loss</th>
              <th className="py-3.5 px-4">Evidence Photos (Qty / Dmg / Barcode)</th>
              {onDeleteRecord && <th className="py-3.5 px-3 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-xs">
            {records.map((record) => {
              const totalLoss = record.cost * record.qty;
              const deptBadge = deptColors[record.departmentName] || deptColors.Unknown;
              const isNew = newlyAddedIds?.has(record.id);
              const isSelected = selectedRecordIds.has(record.id);

              return (
                <tr
                  key={record.id}
                  className={`transition-colors duration-150 group ${
                    isSelected
                      ? 'bg-rose-50/50 ring-1 ring-inset ring-rose-300'
                      : isNew
                      ? 'bg-emerald-50/60 ring-1 ring-inset ring-emerald-400/50'
                      : 'hover:bg-black/[0.015]'
                  }`}
                >
                  {/* Select Checkbox */}
                  {isSelectable && (
                    <td className="py-4 px-3 text-center align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRecord?.(record.id)}
                        aria-label={`Select ${record.sku}`}
                        className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500/30 border-slate-300 cursor-pointer mt-1 apple-pressable"
                      />
                    </td>
                  )}
                  {/* Item Details: SKU, Desc, UPC */}
                  <td className="py-4 px-4 align-top max-w-xs">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CopySKUButton sku={record.sku} onToast={onToast} />
                        {isNew && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold animate-pulse shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            NEW
                          </span>
                        )}
                        {record.upc && (
                          <CopyUPCButton upc={record.upc} onToast={onToast} />
                        )}
                      </div>
                      <div className="font-semibold text-[#1D1D1F] leading-snug line-clamp-2 sf-subheadline">
                        {record.description || 'No Description'}
                      </div>
                    </div>
                  </td>

                  {/* Department & SubDep */}
                  <td className="py-4 px-3 align-top whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold sf-caption ${deptBadge}`}>
                        {record.departmentName}
                      </span>
                      {record.subDep && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium sf-subheadline">
                          <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{record.subDep}</span>
                        </div>
                      )}
                      {record.departmentCode !== null && record.departmentCode !== undefined && !String(record.departmentCode).includes('·') && (
                        <div className="font-mono text-[10px] text-slate-400">
                          Code: {record.departmentCode}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Reason & SecondReason */}
                  <td className="py-4 px-3 align-top max-w-[200px]">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 font-semibold text-xs sf-subheadline">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{record.reason}</span>
                      </span>
                      {record.secondReason && (
                        <div className="text-[11px] text-slate-400 italic truncate sf-subheadline">
                          2nd: {record.secondReason}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Qty */}
                  <td className="py-4 px-3 align-top text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs sf-subheadline">
                      {record.qty}
                    </span>
                  </td>

                  {/* Cost & Price */}
                  <td className="py-4 px-3 align-top text-right whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#1D1D1F] sf-subheadline">
                        {formatCurrencyPHP(record.cost)}
                      </div>
                      <div className="text-[11px] text-slate-400 sf-caption">
                        SRP: {formatCurrencyPHP(record.price)}
                      </div>
                    </div>
                  </td>

                  {/* Total Loss */}
                  <td className="py-4 px-3 align-top text-right whitespace-nowrap">
                    <div className="font-bold text-rose-600 text-sm sf-headline">
                      {formatCurrencyPHP(totalLoss)}
                    </div>
                    <div className="text-[10px] text-slate-400 sf-caption">
                      {record.qty} × {formatCurrencyPHP(record.cost)}
                    </div>
                  </td>

                  {/* Photos */}
                  <td className="py-4 px-4 align-top">
                    <DLRImagePreview
                      images={record.images}
                      sku={record.sku}
                      description={record.description}
                      reason={record.reason}
                      onOpenModal={onOpenModal}
                      onToast={onToast}
                      layout="row"
                    />
                  </td>

                  {/* Delete Action Button */}
                  {onDeleteRecord && (
                    <td className="py-4 px-3 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(record)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200/80 apple-pressable cursor-pointer"
                        title={`Delete report for SKU ${record.sku}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
