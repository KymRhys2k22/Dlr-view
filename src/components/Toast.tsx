import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles, Package } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'realtime';
  message: string;
  title?: string;
  meta?: {
    sku?: string;
    description?: string;
    reason?: string;
    qty?: number;
    department?: string;
    time?: string;
  };
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const isRealtime = toast.type === 'realtime';
  const duration = isRealtime ? 6500 : 3600;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss, duration]);

  if (isRealtime) {
    return (
      <div
        className="pointer-events-auto flex flex-col gap-2.5 p-4 rounded-3xl apple-glass-floating text-[#1D1D1F] border border-black/[0.08] shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-3"
        role="alert"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/25 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-tight text-emerald-700 sf-caption">
                  {toast.title || 'Live Activity'}
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs font-semibold text-[#1D1D1F] sf-headline">
                {toast.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#1D1D1F] rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition-colors shrink-0 cursor-pointer apple-pressable"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {toast.meta && (
          <div className="bg-black/[0.03] rounded-2xl p-3 border border-black/[0.04] text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[11px]">
                SKU: {toast.meta.sku || 'N/A'}
              </span>
              {toast.meta.qty !== undefined && (
                <span className="font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full text-[11px] sf-headline">
                  Qty: {toast.meta.qty}
                </span>
              )}
            </div>
            {toast.meta.description && (
              <p className="font-medium text-slate-700 line-clamp-1 sf-subheadline">
                {toast.meta.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-black/[0.04] text-[11px] text-slate-500 sf-caption">
              {toast.meta.department && (
                <span className="flex items-center gap-1 font-medium">
                  <Package className="w-3 h-3 text-slate-400" />
                  {toast.meta.department}
                </span>
              )}
              {toast.meta.reason && (
                <span className="text-amber-700 font-medium truncate max-w-[160px]">
                  • {toast.meta.reason}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const standardType = (toast.type === 'error' || toast.type === 'info') ? toast.type : 'success';

  const icons: Record<'success' | 'error' | 'info', React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
  };

  const borderAccents: Record<'success' | 'error' | 'info', string> = {
    success: 'border-emerald-500/20 bg-emerald-50/10',
    error: 'border-rose-500/20 bg-rose-50/10',
    info: 'border-blue-500/20 bg-blue-50/10',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl apple-glass-floating border shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2 ${borderAccents[standardType]}`}
      role="alert"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-7 h-7 rounded-xl bg-black/[0.03] flex items-center justify-center shrink-0">
          {icons[standardType]}
        </span>
        <p className="text-xs sm:text-sm font-semibold text-[#1D1D1F] leading-tight truncate sf-subheadline">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#1D1D1F] rounded-full bg-black/[0.04] hover:bg-black/[0.08] transition-colors shrink-0 cursor-pointer apple-pressable"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
