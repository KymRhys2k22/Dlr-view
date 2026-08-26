import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                <div className="h-7 w-32 bg-slate-200 rounded-lg"></div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100"></div>
            </div>
            <div className="h-2.5 w-24 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 bg-slate-200 rounded-xl"></div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 rounded"></div>
          <div className="h-4 w-20 bg-slate-200 rounded"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 w-full sm:w-1/3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-24 bg-slate-100 rounded"></div>
                </div>
                <div className="h-4 w-48 bg-slate-200 rounded"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-20 bg-slate-200 rounded-xl"></div>
                <div className="w-20 h-20 bg-slate-200 rounded-xl"></div>
                <div className="w-20 h-20 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="space-y-1.5 w-28 text-right">
                <div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div>
                <div className="h-4 w-20 bg-slate-200 rounded ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
