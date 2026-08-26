import React from 'react';
import { PackageOpen, RotateCcw, SearchX } from 'lucide-react';

interface EmptyStateProps {
  isSearchActive: boolean;
  selectedDepartment: string;
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearchActive,
  selectedDepartment,
  onReset,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
        {isSearchActive ? (
          <SearchX className="w-8 h-8 text-slate-400" />
        ) : (
          <PackageOpen className="w-8 h-8 text-slate-400" />
        )}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
        {isSearchActive ? 'No matching records found' : 'No Damage & Lost Reports found'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
        {isSearchActive
          ? 'No DLR items match your search keywords under the current department.'
          : `There are currently no damage or lost reports filed under "${selectedDepartment}".`}
      </p>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors border border-slate-200"
      >
        <RotateCcw className="w-4 h-4 text-slate-500" />
        <span>Reset Filters & Search</span>
      </button>
    </div>
  );
};
