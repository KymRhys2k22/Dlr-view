import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center apple-card rounded-3xl border border-rose-200/60 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 mb-4 shadow-2xs">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] mb-1 sf-headline">
        Unable to load Damage & Lost Reports
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 sf-subheadline leading-relaxed">
        {message || 'A network error occurred while connecting to the database. Please check your connection and try again.'}
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-rose-600/25 border border-white/20 disabled:opacity-50 cursor-pointer apple-pressable sf-subheadline"
      >
        <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>{isRetrying ? 'Retrying...' : 'Retry Connection'}</span>
      </button>
    </div>
  );
};
