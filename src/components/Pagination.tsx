import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="apple-card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      {/* Items Range Info */}
      <div className="text-xs text-slate-500 sf-subheadline">
        Showing <span className="font-semibold text-slate-800 font-mono">{startItem}</span>
        {' – '}
        <span className="font-semibold text-slate-800 font-mono">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-800 font-mono">{totalItems}</span> items
        <span className="text-slate-400 ml-1.5 hidden md:inline">
          ({itemsPerPage} items per page)
        </span>
      </div>

      {/* Pagination Controls & Numbered Bullet Points */}
      <nav aria-label="Pagination Navigation" className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-black/[0.08] hover:bg-black/[0.03] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white transition-all cursor-pointer apple-pressable sf-subheadline shadow-2xs"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Bullet Points (1, 2, 3...) */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-slate-400 font-bold select-none"
                >
                  •••
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => handlePageClick(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Go to page ${pageNum}`}
                className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs font-bold font-mono transition-all cursor-pointer apple-pressable ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30 scale-105 ring-2 ring-rose-400/20'
                    : 'bg-white text-slate-700 hover:text-slate-900 border border-black/[0.08] hover:border-black/[0.15] hover:bg-black/[0.02]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-black/[0.08] hover:bg-black/[0.03] disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white transition-all cursor-pointer apple-pressable sf-subheadline shadow-2xs"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </nav>
    </div>
  );
};
