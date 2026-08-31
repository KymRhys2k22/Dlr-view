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
        className="pointer-events-auto flex flex-col gap-2 p-4 rounded-2xl bg-slate-900 text-white border-2 border-emerald-500/80 shadow-2xl shadow-emerald-500/20 transition-all duration-300"
        role="alert"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {toast.title || 'New DLR Inserted'}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {toast.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toast.meta && (
          <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-slate-100 bg-slate-700/80 px-2 py-0.5 rounded border border-slate-600">
                SKU: {toast.meta.sku || 'N/A'}
              </span>
              {toast.meta.qty !== undefined && (
                <span className="font-bold text-rose-300 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded">
                  Qty: {toast.meta.qty}
                </span>
              )}
            </div>
            {toast.meta.description && (
              <p className="font-medium text-slate-200 line-clamp-1">
                {toast.meta.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-700/50 text-[11px] text-slate-400">
              {toast.meta.department && (
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-slate-500" />
                  {toast.meta.department}
                </span>
              )}
              {toast.meta.reason && (
                <span className="text-amber-300 font-medium truncate max-w-[150px]">
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
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles: Record<'success' | 'error' | 'info', string> = {
    success: 'bg-white border-emerald-200 text-slate-800 shadow-lg shadow-emerald-500/10',
    error: 'bg-white border-rose-200 text-slate-800 shadow-lg shadow-rose-500/10',
    info: 'bg-white border-blue-200 text-slate-800 shadow-lg shadow-blue-500/10',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-300 transform translate-y-0 opacity-100 ${bgStyles[standardType]}`}
      role="alert"
    >
      <div className="flex items-center gap-3 min-w-0">
        {icons[standardType]}
        <p className="text-sm font-medium leading-tight truncate">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
