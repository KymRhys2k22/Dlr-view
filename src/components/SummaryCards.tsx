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
      <div className="apple-card p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold sf-caption text-slate-400">
                Total Records
              </span>
              {liveNewCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold sf-caption bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5" />
                  +{liveNewCount} live
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] sf-display">
              {formatNumber(stats.totalRecords)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium sf-subheadline">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span className="truncate">Filtered by: {selectedDepartment}</span>
        </div>
      </div>

      {/* Total Quantity */}
      <div className="apple-card p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold sf-caption text-slate-400">
              Total Quantity
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] sf-display">
              {formatNumber(stats.totalQuantity)}
              <span className="text-sm font-normal text-slate-400 ml-1.5">units</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium sf-subheadline">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Sum of damaged & lost item quantities</span>
        </div>
      </div>

      {/* Total Cost */}
      <div className="apple-card p-5 bg-gradient-to-br from-white via-white to-rose-50/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold sf-caption text-rose-600/90">
              Total Defect Cost
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-rose-600 sf-display">
              {formatCurrencyPHP(stats.totalCost)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/25 border border-white/20">
            <Coins className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600/80 font-medium sf-subheadline">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Calculated via SUM(Cost × Qty)</span>
        </div>
      </div>
    </div>
  );
};
