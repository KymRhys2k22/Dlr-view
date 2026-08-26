import { LogOut, Store, RefreshCw } from 'lucide-react';
import { UserSession } from '../types/dlr';

interface NavbarProps {
  session: UserSession;
  onLogout: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onLogout,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600 font-black text-sm tracking-tighter text-white shadow-md shadow-rose-600/30 border border-rose-500/30 shrink-0">
              DAISO
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white truncate">
                  Damage & Lost Report
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  DLR v2.0
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate hidden sm:block">
                Inventory Defect & Discard Management
              </span>
            </div>
          </div>

          {/* Right: Store info, User badge, Refresh & Logout buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh DLR Records"
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
              </button>
            )}

            {/* Store Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs">
              <Store className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Store #{session.storeCode}
                </span>
                <span className="font-medium text-slate-200 truncate max-w-[160px] lg:max-w-[220px]">
                  {session.storeName}
                </span>
              </div>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs">
              <div className="w-6 h-6 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-300 flex items-center justify-center font-bold text-xs shrink-0">
                {session.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-slate-200 truncate max-w-[90px] sm:max-w-[120px]">
                  {session.name}
                </span>
                <span className="text-[10px] text-slate-400 md:hidden">
                  #{session.storeCode}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/60 text-xs font-semibold transition-all duration-200"
              title="Logout from session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
