import React from 'react';
import { LogOut, Store, RefreshCw } from 'lucide-react';
import { UserSession } from '../types/dlr';
import { NotificationCenter, RealtimeEventItem } from './NotificationCenter';

interface NavbarProps {
  session: UserSession;
  onLogout: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  realtimeNotifications?: RealtimeEventItem[];
  onClearNotifications?: () => void;
  onMarkNotificationsAsRead?: () => void;
  onTestNotification?: () => void;
  isRealtimeConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onLogout,
  onRefresh,
  isLoading = false,
  realtimeNotifications = [],
  onClearNotifications = () => {},
  onMarkNotificationsAsRead = () => {},
  onTestNotification,
  isRealtimeConnected = true,
}) => {
  return (
    <header className="sticky top-0 z-30 apple-glass-nav text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-gradient-to-b from-rose-500 to-rose-600 font-black text-sm tracking-tighter text-white shadow-md shadow-rose-600/30 border border-white/20 shrink-0 select-none">
              DAISO
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base sf-headline text-white truncate">
                  Damage & Lost Report
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold sf-caption rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  DLR v2.0
                </span>
                {/* Live Realtime Badge Indicator */}
                <span
                  className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold sf-caption rounded-full border transition-all ${
                    isRealtimeConnected
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                  title={
                    isRealtimeConnected
                      ? 'Connected to Supabase Realtime for instant insert notifications'
                      : 'Connecting to Supabase Realtime...'
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRealtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isRealtimeConnected ? 'LIVE SYNC' : 'SYNCING'}</span>
                </span>
              </div>
              <span className="text-[11px] sf-subheadline text-slate-400 truncate hidden sm:block">
                Inventory Defect & Discard Management
              </span>
            </div>
          </div>

          {/* Right: Notification Center, Store info, User badge, Refresh & Logout buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Real-time Notification Bell & Drawer */}
            <NotificationCenter
              notifications={realtimeNotifications}
              onClearNotifications={onClearNotifications}
              onMarkAsRead={onMarkNotificationsAsRead}
              onTestNotification={onTestNotification}
              isConnected={isRealtimeConnected}
            />

            {/* Refresh button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh DLR Records"
                className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 apple-pressable transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
              </button>
            )}

            {/* Store Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.08] hover:bg-white/[0.12] rounded-xl border border-white/10 text-xs transition-colors">
              <Store className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-semibold sf-caption text-slate-400">
                  Store #{session?.storeCode || 'N/A'}
                </span>
                <span className="font-medium text-slate-100 truncate max-w-[160px] lg:max-w-[220px]">
                  {session?.storeName || 'Daiso Store'}
                </span>
              </div>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-white/[0.08] rounded-xl border border-white/10 text-xs">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {(session?.name || 'User').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-slate-100 truncate max-w-[90px] sm:max-w-[120px]">
                  {session?.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 md:hidden font-mono">
                  #{session?.storeCode || ''}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-rose-500/20 text-slate-200 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-semibold apple-pressable transition-all cursor-pointer"
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
