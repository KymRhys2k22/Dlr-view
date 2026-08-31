import React from 'react';
import { FileText, Layers, Coins, TrendingUp, Sparkles } from 'lucide-react';
import { SummaryStats } from '../types/dlr';
import { formatCurrencyPHP, formatNumber } from '../utils/currency';

interface SummaryCardsProps {
  stats: SummaryStats;
  selectedDepartment: string;
  liveNewCount?: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  selectedDepartment,
  liveNewCount = 0,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Total Records */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Records
              </span>
              {liveNewCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5" />
                  +{liveNewCount} live
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatNumber(stats.totalRecords)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span className="truncate">Filtered by: {selectedDepartment}</span>
        </div>
      </div>

      {/* Total Quantity */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Quantity
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatNumber(stats.totalQuantity)}
              <span className="text-sm font-semibold text-slate-400 ml-1.5">units</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Sum of damaged & lost item quantities</span>
        </div>
      </div>

      {/* Total Cost */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-rose-100 p-5 shadow-xs transition-all hover:shadow-md bg-gradient-to-br from-white to-rose-50/30">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600/90">
              Total Defect Cost
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {formatCurrencyPHP(stats.totalCost)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
            <Coins className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600/80 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Calculated via SUM(Cost × Qty)</span>
        </div>
      </div>
    </div>
  );
};
