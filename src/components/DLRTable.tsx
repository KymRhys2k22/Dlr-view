import React from 'react';
import { DLRRecord } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';
import { DLRImagePreview } from './DLRImagePreview';
import { AlertCircle, Layers, Trash2, Sparkles } from 'lucide-react';

interface DLRTableProps {
  records: DLRRecord[];
  onOpenModal: (
    url: string,
    type: string,
    item?: { sku: string; description: string; reason: string }
  ) => void;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onDeleteRecord?: (record: DLRRecord) => void;
  newlyAddedIds?: Set<string>;
}

export const DLRTable: React.FC<DLRTableProps> = ({
  records,
  onOpenModal,
  onToast,
  onDeleteRecord,
  newlyAddedIds,
}) => {
  const deptColors: Record<string, string> = {
    Houseware: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Fashion: 'bg-pink-50 text-pink-700 border-pink-200',
    'Food & DIY': 'bg-amber-50 text-amber-800 border-amber-200',
    Cleaning: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Outdoor & GMS': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Unknown: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
          <tbody className="divide-y divide-slate-100 text-xs">
            {records.map((record) => {
              const totalLoss = record.cost * record.qty;
              const deptBadge = deptColors[record.departmentName] || deptColors.Unknown;
              const isNew = newlyAddedIds?.has(record.id);

              return (
                <tr
                  key={record.id}
                  className={`transition-colors duration-500 group ${
                    isNew
                      ? 'bg-emerald-50/80 ring-2 ring-emerald-500/50'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Item Details: SKU, Desc, UPC */}
                  <td className="py-4 px-4 align-top max-w-xs">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {record.sku || 'N/A'}
                        </span>
                        {isNew && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold animate-pulse shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            NEW
                          </span>
                        )}
                        {record.upc && (
                          <span className="font-mono text-[11px] text-slate-400">
                            UPC: {record.upc}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-800 leading-snug line-clamp-2">
                        {record.description || 'No Description'}
                      </div>
                    </div>
                  </td>

                  {/* Department & SubDep */}
                  <td className="py-4 px-3 align-top whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold ${deptBadge}`}>
                        {record.departmentName}
                      </span>
                      {record.subDep && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{record.reason}</span>
                      </span>
                      {record.secondReason && (
                        <div className="text-[11px] text-slate-500 italic truncate">
                          2nd: {record.secondReason}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Qty */}
                  <td className="py-4 px-3 align-top text-center">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
                      {record.qty}
                    </span>
                  </td>

                  {/* Cost & Price */}
                  <td className="py-4 px-3 align-top text-right whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-800">
                        {formatCurrencyPHP(record.cost)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        SRP: {formatCurrencyPHP(record.price)}
                      </div>
                    </div>
                  </td>

                  {/* Total Loss */}
                  <td className="py-4 px-3 align-top text-right whitespace-nowrap">
                    <div className="font-extrabold text-rose-600 text-sm">
                      {formatCurrencyPHP(totalLoss)}
                    </div>
                    <div className="text-[10px] text-slate-400">
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
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
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
