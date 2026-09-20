import React from 'react';
import { Tag, Barcode, AlertCircle, Coins, Layers, Trash2, Sparkles, Pencil } from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { DLRImagePreview } from './DLRImagePreview';
import { CopySKUButton } from './CopySKUButton';
import { CopyUPCButton } from './CopyUPCButton';

interface DLRCardProps {
  record: DLRRecord;
  itemNumber?: number;
  onOpenModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string; upc?: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onDeleteRecord?: (record: DLRRecord) => void;
  onEditRecord?: (record: DLRRecord) => void;
  newlyAddedIds?: Set<string>;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (recordId: string) => void;
}

export const DLRCard: React.FC<DLRCardProps> = ({
  record,
  itemNumber,
  onOpenModal,
  onToast,
  onDeleteRecord,
  onEditRecord,
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
      className={`relative apple-card p-4 sm:p-5 space-y-4 transition-all ${
        isSelected
          ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/20 shadow-md'
          : isSelectable
          ? 'cursor-pointer hover:border-rose-300/80 hover:shadow-md apple-pressable-subtle'
          : 'hover:shadow-md'
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
                className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500/30 border-slate-300 cursor-pointer mr-1 shrink-0 apple-pressable"
              />
            )}

            {itemNumber !== undefined && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-mono font-bold shadow-xs sf-caption">
                #{itemNumber}
              </span>
            )}

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100 sf-caption">
              {record.departmentName}
            </span>

            {record.subDep && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.04] sf-subheadline">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>{record.subDep}</span>
              </span>
            )}

            {isNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold animate-pulse shadow-xs sf-caption">
                <Sparkles className="w-3 h-3" />
                NEW
              </span>
            )}

            <CopySKUButton sku={record.sku} prefix="SKU: " onToast={onToast} />
          </div>

          <h3 className="font-semibold text-[#1D1D1F] text-sm sm:text-base leading-snug sf-headline">
            {record.description || 'No Description'}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap sf-subheadline">
            <span className="font-medium text-slate-700">Reason:</span>
            <span className="inline-flex items-center gap-1 text-slate-700 bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.04]">
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
          <div className="flex flex-col items-center justify-center px-3 py-1.5 bg-black/[0.03] rounded-2xl border border-black/[0.05]">
            <span className="text-[10px] uppercase font-semibold text-slate-400 sf-caption leading-none">
              Qty
            </span>
            <span className="text-base font-bold text-[#1D1D1F] sf-display leading-tight">
              {record.qty}
            </span>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1">
            {onEditRecord && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditRecord(record);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors apple-pressable cursor-pointer"
                title="Edit item details"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDeleteRecord && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRecord(record);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors apple-pressable cursor-pointer"
                title="Delete record"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meta details bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-black/[0.025] rounded-2xl border border-black/[0.04] text-xs">
        <div>
          <span className="text-[10px] font-semibold sf-caption text-slate-400 flex items-center gap-1 mb-0.5">
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
          <span className="text-[10px] font-semibold sf-caption text-slate-400 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Unit Cost
          </span>
          <span className="font-semibold text-[#1D1D1F] sf-subheadline block">
            {formatCurrencyPHP(record.cost)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold sf-caption text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Retail Price
          </span>
          <span className="font-semibold text-[#1D1D1F] sf-subheadline block">
            {formatCurrencyPHP(record.price)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold sf-caption text-rose-600 flex items-center gap-1">
            Total Loss
          </span>
          <span className="font-bold text-rose-600 sf-headline block">
            {formatCurrencyPHP(totalItemCost)}
          </span>
        </div>
      </div>

      {/* Image Thumbnails & Copy Actions */}
      <div className="pt-2 border-t border-black/[0.04]">
        <div className="text-[11px] font-semibold sf-caption text-slate-400 mb-2">
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
