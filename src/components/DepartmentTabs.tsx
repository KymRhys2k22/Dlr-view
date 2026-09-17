import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DepartmentName, DEPARTMENT_TABS } from '../utils/getDepartmentName';

interface DepartmentTabsProps {
  activeTab: DepartmentName;
  onTabChange: (tab: DepartmentName) => void;
  counts: Record<DepartmentName, number>;
  liveNewDepts?: Set<DepartmentName>;
}

export const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
  liveNewDepts,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && scrollContainerRef.current) {
      resizeObserver = new ResizeObserver(() => checkScrollability());
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [checkScrollability, counts]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative flex items-center gap-2 w-full">
      {/* Left Navigation Button */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        disabled={!canScrollLeft}
        aria-label="Scroll departments left"
        title="Scroll left"
        className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-black/[0.06] shadow-xs text-slate-600 apple-pressable shrink-0 ${
          canScrollLeft
            ? 'hover:bg-slate-50 hover:text-[#1D1D1F] cursor-pointer'
            : 'opacity-30 cursor-not-allowed text-slate-300 border-transparent shadow-none'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Chips Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex-1 overflow-x-auto pb-1 -mb-1 no-scrollbar scroll-smooth"
      >
        <div className="flex items-center gap-1.5 p-1 bg-black/[0.04] rounded-2xl border border-black/[0.04] w-max min-w-full sm:min-w-0">
          {DEPARTMENT_TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count = counts[tab] ?? 0;
            const hasNewItems = liveNewDepts?.has(tab);

            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 select-none cursor-pointer apple-pressable ${
                  isActive
                    ? 'bg-white text-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-black/[0.04]'
                    : 'text-slate-600 hover:text-[#1D1D1F] hover:bg-white/60'
                }`}
              >
                <span className="sf-subheadline">{tab}</span>
                {hasNewItems && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
                <span
                  className={`px-2 py-0.5 text-[11px] font-semibold sf-caption rounded-full transition-colors ${
                    isActive
                      ? 'bg-rose-50 text-rose-600 font-bold border border-rose-100'
                      : count > 0
                      ? 'bg-black/[0.06] text-slate-600'
                      : 'bg-black/[0.03] text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Navigation Button */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        disabled={!canScrollRight}
        aria-label="Scroll departments right"
        title="Scroll right"
        className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-black/[0.06] shadow-xs text-slate-600 apple-pressable shrink-0 ${
          canScrollRight
            ? 'hover:bg-slate-50 hover:text-[#1D1D1F] cursor-pointer'
            : 'opacity-30 cursor-not-allowed text-slate-300 border-transparent shadow-none'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};


