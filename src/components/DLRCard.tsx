import React from 'react';
import { Tag, Barcode, AlertCircle, Coins, Layers, Trash2, Sparkles } from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { DLRImagePreview } from './DLRImagePreview';
import { CopySKUButton } from './CopySKUButton';
import { CopyUPCButton } from './CopyUPCButton';

interface DLRCardProps {
  record: DLRRecord;
  onOpenModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string; upc?: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onDeleteRecord?: (record: DLRRecord) => void;
  newlyAddedIds?: Set<string>;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (recordId: string) => void;
}

export const DLRCard: React.FC<DLRCardProps> = ({
  record,
  onOpenModal,
  onToast,
  onDeleteRecord,
  newlyAddedIds,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const isNew = newlyAddedIds?.has(record.id);
  const totalItemCost = record.cost * record.qty;

  return (
    <div
      onClick={() => {
        if (isSelectable && onToggleSelect) {
          onToggleSelect(record.id);
        }
      }}
      className={`relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 space-y-4 ${
        isSelected
          ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/10 shadow-md'
          : isSelectable
          ? 'cursor-pointer hover:border-rose-300 hover:shadow-md'
          : 'hover:shadow-md border-slate-200/80'
      }`}
    >
      {/* Top row: Checkbox, Department, SubDep, SKU, and Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isSelectable && onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(record.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer mr-1 shrink-0"
              />
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
              {record.departmentName}
            </span>

            {record.subDep && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>{record.subDep}</span>
              </span>
            )}

            {isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold animate-pulse shadow-xs">
                <Sparkles className="w-3 h-3" />
                NEW
              </span>
            )}

            <CopySKUButton sku={record.sku} prefix="SKU: " onToast={onToast} />
          </div>

          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
            {record.description || 'No Description'}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700">Reason:</span>
            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              {record.reason}
            </span>
            {record.secondReason && (
              <span className="text-slate-400 text-[11px] truncate max-w-[200px]">
                ({record.secondReason})
              </span>
            )}
          </div>
        </div>

        {/* Top-right: Quantity & Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex flex-col items-center justify-center px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 leading-none">
              Qty
            </span>
            <span className="text-base font-black text-slate-800 leading-tight">
              {record.qty}
            </span>
          </div>

          {/* Delete Action button */}
          {onDeleteRecord && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRecord(record);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Meta details bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1 mb-0.5">
            <Barcode className="w-3 h-3" /> UPC
          </span>
          <CopyUPCButton
            upc={record.upc}
            prefix=""
            showIcon={false}
            onToast={onToast}
            className="w-full justify-between"
          />
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Unit Cost
          </span>
          <span className="font-semibold text-slate-800 block">
            {formatCurrencyPHP(record.cost)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Retail Price
          </span>
          <span className="font-semibold text-slate-800 block">
            {formatCurrencyPHP(record.price)}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-semibold text-rose-600 flex items-center gap-1">
            Total Loss
          </span>
          <span className="font-bold text-rose-600 block">
            {formatCurrencyPHP(totalItemCost)}
          </span>
        </div>
      </div>

      {/* Reasons Pill */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium">Defect:</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          {record.reason}
        </span>
        {record.secondReason && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
            2nd: {record.secondReason}
          </span>
        )}
      </div>

      {/* Image Thumbnails & Copy Actions */}
      <div className="pt-2 border-t border-slate-100">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Documented Photos (Quantity / Damage / Barcode)
        </div>
        <DLRImagePreview
          images={record.images}
          sku={record.sku}
          description={record.description}
          reason={record.reason}
          onOpenModal={onOpenModal}
          onToast={onToast}
          layout="row"
        />
      </div>
    </div>
  );
};
