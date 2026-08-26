import { Tag, Barcode, AlertCircle, Coins, Layers, Trash2 } from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { DLRImagePreview } from './DLRImagePreview';

interface DLRCardProps {
  record: DLRRecord;
  onOpenModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onDeleteRecord?: (record: DLRRecord) => void;
}

export const DLRCard: React.FC<DLRCardProps> = ({
  record,
  onOpenModal,
  onToast,
  onDeleteRecord,
}) => {
  const totalItemCost = record.cost * record.qty;

  // Department badge styles
  const deptColors: Record<string, string> = {
    Houseware: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Fashion: 'bg-pink-50 text-pink-700 border-pink-200',
    'Food & DIY': 'bg-amber-50 text-amber-800 border-amber-200',
    Cleaning: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Outdoor & GMS': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Unknown: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const deptBadgeStyle = deptColors[record.departmentName] || deptColors.Unknown;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4 relative group">
      {/* Top Header: SKU, Department, Qty Badge, Delete button */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              SKU: {record.sku || 'N/A'}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${deptBadgeStyle}`}
            >
              {record.departmentName}
            </span>
            {record.subDep && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>{record.subDep}</span>
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
            {record.description || 'No Description Provided'}
          </h4>
        </div>

        {/* Qty Badge and Delete action */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Damaged Qty
            </span>
            <span className="font-bold text-sm sm:text-base text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg">
              {record.qty} {record.qty === 1 ? 'pc' : 'pcs'}
            </span>
          </div>

          {onDeleteRecord && (
            <button
              type="button"
              onClick={() => onDeleteRecord(record)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1 border border-transparent hover:border-rose-200"
              title={`Delete record for SKU ${record.sku}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Meta details bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
            <Barcode className="w-3 h-3" /> UPC
          </span>
          <span className="font-mono font-medium text-slate-700 block truncate">
            {record.upc || 'N/A'}
          </span>
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
