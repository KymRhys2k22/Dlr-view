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
        className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer apple-pressable ${
          isOpen
            ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25'
            : unreadCount > 0
            ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
            : 'bg-white/80 border-black/[0.08] text-slate-600 hover:text-[#1D1D1F] hover:bg-white shadow-xs'
        }`}
        title="Live Real-time Notifications & Activity"
        aria-label="Open notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 animate-bounce-short text-current" />
        ) : (
          <Bell className="w-4 h-4 text-current" />
        )}

        {/* Unread badge count */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Live status dot */}
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-400'
          }`}
          title={isConnected ? 'Live Supabase Realtime Connected' : 'Connecting to Realtime...'}
        />
      </button>

      {/* Dropdown Panel - Apple Notification Center Sheet */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-84 sm:w-96 rounded-3xl apple-glass-card text-[#1D1D1F] shadow-2xl border border-black/[0.08] z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-black/[0.06] bg-white/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1D1D1F] leading-tight sf-headline">Live Activity</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 sf-caption">
                  <Radio className={`w-3 h-3 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                  <span>{isConnected ? 'Supabase Real-time Active' : 'Connecting...'}</span>
                </div>
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearNotifications}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-black/[0.05] transition-colors cursor-pointer apple-pressable sf-subheadline"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Quick Settings Bar */}
          <div className="grid grid-cols-2 gap-2 p-2.5 bg-black/[0.02] border-b border-black/[0.05] text-xs">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer apple-pressable sf-subheadline ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-200/80 text-emerald-700 shadow-xs'
                  : 'bg-white/80 border-black/[0.06] text-slate-500 hover:text-slate-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Audio Chime On' : 'Muted'}</span>
            </button>

            {/* Desktop Notification Toggle */}
            <button
              type="button"
              onClick={permissionState === 'granted' ? undefined : handleRequestPermission}
              disabled={permissionState === 'granted' || permissionState === 'unsupported'}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer apple-pressable sf-subheadline ${
                permissionState === 'granted'
                  ? 'bg-blue-50 border-blue-200/80 text-blue-700 shadow-xs cursor-default'
                  : 'bg-white/80 border-black/[0.06] text-slate-700 hover:bg-white hover:text-[#1D1D1F]'
              }`}
            >
              {permissionState === 'granted' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Desktop On</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>Enable Push</span>
                </>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto max-h-80 p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4 space-y-2.5">
                <div className="w-11 h-11 mx-auto rounded-2xl bg-black/[0.04] border border-black/[0.04] flex items-center justify-center text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 sf-headline">No new activity</p>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto sf-subheadline">
                  When any user or scanner submits a new DLR record to Supabase, instant notifications will appear here.
                </p>
                {onTestNotification && (
                  <button
                    type="button"
                    onClick={onTestNotification}
                    className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-full text-xs font-semibold transition-all cursor-pointer apple-pressable sf-subheadline"
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
                    className="p-3 rounded-2xl bg-white/90 border border-black/[0.06] shadow-xs hover:shadow-sm transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          SKU: {rec.sku || 'N/A'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 sf-caption">
                          {rec.departmentName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium sf-caption">{timeString}</span>
                    </div>

                    <div className="text-xs font-semibold text-[#1D1D1F] leading-snug line-clamp-2 sf-headline">
                      {rec.description || 'New DLR Item Documented'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-black/[0.04] text-slate-500">
                      <span className="text-amber-700 font-medium truncate max-w-[150px] sf-caption">
                        {rec.reason}
                      </span>
                      <span className="font-bold text-rose-600 sf-headline">
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
            <div className="px-4 py-2.5 bg-black/[0.02] border-t border-black/[0.05] flex items-center justify-between text-[11px] text-slate-500 sf-caption">
              <span>Auto-synced with Supabase</span>
              <button
                type="button"
                onClick={onTestNotification}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer apple-pressable"
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
