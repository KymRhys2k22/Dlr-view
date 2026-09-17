import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="apple-card rounded-3xl border border-black/[0.06] p-5.5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-black/[0.06] rounded-full"></div>
                <div className="h-7 w-32 bg-black/[0.08] rounded-xl"></div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-black/[0.05]"></div>
            </div>
            <div className="h-2.5 w-24 bg-black/[0.04] rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 bg-black/[0.05] rounded-2xl"></div>
        <div className="h-11 w-36 bg-black/[0.05] rounded-full"></div>
      </div>

      {/* Table Skeleton */}
      <div className="apple-card rounded-3xl border border-black/[0.06] overflow-hidden">
        <div className="p-4 border-b border-black/[0.05] flex items-center justify-between">
          <div className="h-4 w-40 bg-black/[0.06] rounded-full"></div>
          <div className="h-4 w-20 bg-black/[0.04] rounded-full"></div>
        </div>
        <div className="divide-y divide-black/[0.04]">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2 w-full sm:w-1/3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 bg-black/[0.06] rounded-full"></div>
                  <div className="h-4 w-24 bg-black/[0.04] rounded-full"></div>
                </div>
                <div className="h-4 w-48 bg-black/[0.06] rounded-lg"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-18 h-18 bg-black/[0.05] rounded-2xl"></div>
                <div className="w-18 h-18 bg-black/[0.05] rounded-2xl"></div>
                <div className="w-18 h-18 bg-black/[0.05] rounded-2xl"></div>
              </div>
              <div className="space-y-1.5 w-28 text-right">
                <div className="h-4 w-16 bg-black/[0.06] rounded-full ml-auto"></div>
                <div className="h-4 w-20 bg-black/[0.05] rounded-full ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
