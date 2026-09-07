import React from 'react';
import { FileText, ChevronRight, Package, Calendar, Pencil } from 'lucide-react';
import { FiledDLRGroup } from '../types/dlr';
import { formatCurrencyPHP } from '../utils/currency';

interface FiledDLRCardProps {
  group: FiledDLRGroup;
  onClick: (group: FiledDLRGroup) => void;
  onEditDlr?: (group: FiledDLRGroup) => void;
}

export const FiledDLRCard: React.FC<FiledDLRCardProps> = ({ group, onClick, onEditDlr }) => {
  return (
    <div
      onClick={() => onClick(group)}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 p-5 space-y-4 cursor-pointer group relative overflow-hidden"
    >
      {/* Top Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600 group-hover:h-1.5 transition-all" />

      {/* Header: DLR Number & Arrow */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm sm:text-base font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 shadow-2xs">
              #{group.dlrNumber}
            </span>
            {onEditDlr && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDlr(group);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Edit DLR Number"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Filed
            </span>
          </div>
          {group.lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{new Date(group.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-rose-50 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0">
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Items</div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-center gap-1">
            <FileText className="w-3 h-3 text-slate-400 hidden sm:inline" />
            <span>{group.totalRecords}</span>
          </div>
        </div>
        <div className="border-x border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-400">Quantity</div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-center gap-1">
            <Package className="w-3 h-3 text-slate-400 hidden sm:inline" />
            <span>{group.totalQuantity} pcs</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Loss</div>
          <div className="text-xs sm:text-sm font-bold text-rose-600 font-mono">
            {formatCurrencyPHP(group.totalCost)}
          </div>
        </div>
      </div>

      {/* Department Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {group.departments.map((dept) => (
          <span
            key={dept}
            className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
          >
            {dept}
          </span>
        ))}
      </div>

      {/* Footer hint */}
      <div className="pt-1 flex items-center justify-between text-xs font-semibold text-rose-600 group-hover:text-rose-700">
        <span>Click to view detailed items</span>
        <span className="text-[11px] text-slate-400 font-normal">
          {group.records.length} records attached
        </span>
      </div>
    </div>
  );
};
