import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Daiso DLR Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleResetApp = async (): Promise<void> => {
    try {
      // Clear web caches
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // Unregister all service workers
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear app cache:', e);
    } finally {
      // Force reload from server
      window.location.href = '/';
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'An unexpected error occurred.';
      const errorStack = this.state.error?.stack || '';

      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Icon */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                Application Recovery
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                The application encountered an unexpected runtime error. You can try refreshing or resetting the application cache below.
              </p>
            </div>

            {/* Error Message Details */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-left overflow-auto max-h-36">
              <div className="text-[11px] font-bold font-mono text-rose-600 break-words">
                {errorMsg}
              </div>
              {errorStack && (
                <pre className="text-[10px] font-mono text-slate-400 mt-2 whitespace-pre-wrap break-all leading-tight">
                  {errorStack.slice(0, 500)}
                </pre>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all shadow-md shadow-rose-600/25 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetApp}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all border border-slate-200 cursor-pointer"
                title="Clears local cache and re-loads fresh app"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
