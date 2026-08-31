/**
 * Browser Desktop Web Notification and App Badge utility
 */

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

export function sendBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: unknown;
    onClick?: () => void;
  }
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notif = new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/pwa-192x192.svg',
      badge: '/favicon.svg',
      tag: options?.tag,
    });

    if (options?.onClick) {
      notif.onclick = () => {
        window.focus();
        options.onClick?.();
        notif.close();
      };
    }

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      notif.close();
    }, 6000);

    return true;
  } catch (err) {
    console.debug('Failed to show browser notification:', err);
    return false;
  }
}

/**
 * Update PWA / OS Native App Icon Badge Indicator (Badging API)
 */
export function updateAppBadge(count: number): void {
  if (typeof navigator === 'undefined') return;

  const nav = navigator as unknown as {
    setAppBadge?: (count?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };

  try {
    if (count > 0 && typeof nav.setAppBadge === 'function') {
      nav.setAppBadge(count).catch(() => {});
    } else if (count <= 0 && typeof nav.clearAppBadge === 'function') {
      nav.clearAppBadge().catch(() => {});
    }
  } catch (err) {
    console.debug('App Badge API not supported or failed:', err);
  }
}
