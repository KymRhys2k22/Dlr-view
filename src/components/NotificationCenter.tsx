import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Sparkles,
  Trash2,
  CheckCircle2,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { DLRRecord } from '../types/dlr';
import {
  isSoundNotificationEnabled,
  setSoundNotificationEnabled,
  playNotificationSound,
} from '../utils/audio';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  NotificationPermissionState,
} from '../utils/webNotification';

export interface RealtimeEventItem {
  id: string;
  timestamp: Date;
  record: DLRRecord;
  read: boolean;
}

interface NotificationCenterProps {
  notifications: RealtimeEventItem[];
  onClearNotifications: () => void;
  onMarkAsRead: () => void;
  onTestNotification?: () => void;
  isConnected?: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onClearNotifications,
  onMarkAsRead,
  onTestNotification,
  isConnected = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isSoundNotificationEnabled);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(
    getBrowserNotificationPermission
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setSoundNotificationEnabled(next);
    if (next) {
      playNotificationSound();
    }
  };

  // Request browser permission
  const handleRequestPermission = async () => {
    const result = await requestBrowserNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      sendBrowserNotification('✅ Desktop Notifications Enabled', {
        body: 'You will receive desktop alerts when new DLR records are inserted.',
      });
    }
  };

  // Handle open/close
  const toggleOpen = () => {
    if (!isOpen) {
      onMarkAsRead();
    }
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`relative p-2 rounded-xl border transition-all duration-200 ${
          isOpen
            ? 'bg-rose-900/60 border-rose-500/50 text-rose-300 shadow-md'
            : unreadCount > 0
            ? 'bg-rose-600/20 border-rose-500/40 text-rose-300 hover:bg-rose-600/30'
            : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title="Live Real-time Notifications & Activity"
        aria-label="Open notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 animate-bounce-short text-rose-400" />
        ) : (
          <Bell className="w-4 h-4" />
        )}

        {/* Unread badge count */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-md shadow-rose-600/50 ring-2 ring-slate-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Live status dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ring-1 ring-slate-900 ${
            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
          title={isConnected ? 'Live Supabase Realtime Connected' : 'Connecting to Realtime...'}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl shadow-black/60 z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Live Activity</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                  <span>{isConnected ? 'Supabase Real-time Active' : 'Connecting to Real-time...'}</span>
                </div>
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearNotifications}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 p-1 rounded hover:bg-slate-800 transition-colors"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Quick Settings Bar */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                soundEnabled
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>

            {/* Desktop Notification Toggle */}
            <button
              type="button"
              onClick={permissionState === 'granted' ? undefined : handleRequestPermission}
              disabled={permissionState === 'granted' || permissionState === 'unsupported'}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-semibold transition-all ${
                permissionState === 'granted'
                  ? 'bg-blue-950/40 border-blue-700/60 text-blue-300 cursor-default'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {permissionState === 'granted' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Desktop On</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enable Push</span>
                </>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 max-h-80 p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4 space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-300">No new inserts yet</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  When any user or scanner submits a new DLR record to Supabase, instant web notifications will appear here.
                </p>
                {onTestNotification && (
                  <button
                    type="button"
                    onClick={onTestNotification}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Send Test Notification</span>
                  </button>
                )}
              </div>
            ) : (
              notifications.map((item) => {
                const rec = item.record;
                const timeString = item.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          SKU: {rec.sku || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {rec.departmentName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{timeString}</span>
                    </div>

                    <div className="text-xs font-medium text-slate-200 leading-snug line-clamp-2">
                      {rec.description || 'New DLR Item Documented'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/40 text-slate-400">
                      <span className="text-amber-300 font-medium truncate max-w-[140px]">
                        Defect: {rec.reason}
                      </span>
                      <span className="font-bold text-rose-300">
                        Qty: {rec.qty}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {notifications.length > 0 && onTestNotification && (
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Auto-synced with Supabase</span>
              <button
                type="button"
                onClick={onTestNotification}
                className="text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
              >
                <span>Test Alert</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
