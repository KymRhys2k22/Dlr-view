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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-md border border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Left: Select All / Deselect Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white border border-white/15 cursor-pointer select-none"
        >
          {isAllSelected ? (
            <>
              <CheckSquare className="w-4 h-4 text-rose-400" />
              <span>Deselect All</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4 text-slate-400" />
              <span>Select All ({totalFilteredCount})</span>
            </>
          )}
        </button>

        {/* Selected Count Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="font-semibold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
            {selectedCount} of {totalFilteredCount}
          </span>
          <span>selected</span>
        </div>

        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onClearSelection}
            className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Right: Assign DLR Number Action Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenAssignModal}
          disabled={selectedCount === 0}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-md select-none ${
            selectedCount > 0
              ? 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-rose-600/30'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
          }`}
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Assign DLR Number</span>
          {selectedCount > 0 && (
            <span className="px-1.5 py-0.2 bg-white/25 rounded-md text-[11px] font-black text-white">
              {selectedCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
