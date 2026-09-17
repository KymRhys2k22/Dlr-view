import React from 'react';
import { CheckSquare, Square, FilePlus2, X } from 'lucide-react';

interface BatchActionBarProps {
  isVisible: boolean;
  totalFilteredCount: number;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onOpenAssignModal: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  isVisible,
  totalFilteredCount,
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onClearSelection,
  onOpenAssignModal,
}) => {
  if (!isVisible || totalFilteredCount === 0) return null;

  return (
    <div className="apple-glass-floating rounded-2xl sm:rounded-full p-2.5 sm:px-5 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 text-white shadow-2xl transition-all duration-300 select-none">
      {/* Left: Select All / Deselect Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 cursor-pointer apple-pressable"
        >
          {isAllSelected ? (
            <>
              <CheckSquare className="w-3.5 h-3.5 text-rose-400" />
              <span className="sf-subheadline">Deselect All</span>
            </>
          ) : (
            <>
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span className="sf-subheadline">Select All ({totalFilteredCount})</span>
            </>
          )}
        </button>

        {/* Selected Count Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 sf-subheadline">
          <span className="font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
            {selectedCount} of {totalFilteredCount}
          </span>
          <span className="text-slate-400">selected</span>
        </div>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearSelection}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer apple-pressable"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Assign DLR Number Action Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAssignModal}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer apple-pressable ${
            selectedCount > 0
              ? 'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-md shadow-rose-600/30 border border-white/20'
              : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed shadow-none'
          }`}
        >
          <FilePlus2 className="w-4 h-4" />
          <span className="sf-subheadline">Assign DLR Number</span>
          {selectedCount > 0 && (
            <span className="px-1.5 py-0.2 bg-white/25 rounded-full text-[11px] font-bold text-white">
              {selectedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
