import React from 'react';
import { DepartmentName, DEPARTMENT_TABS } from '../utils/getDepartmentName';

interface DepartmentTabsProps {
  activeTab: DepartmentName;
  onTabChange: (tab: DepartmentName) => void;
  counts: Record<DepartmentName, number>;
}

export const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 -mb-2 no-scrollbar">
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-max min-w-full sm:min-w-0">
        {DEPARTMENT_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = counts[tab] ?? 0;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0 select-none ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : count > 0
                    ? 'bg-slate-200/80 text-slate-700'
                    : 'bg-slate-200/40 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
