import { IS_DEMO, vapidKey } from '@/lib/config';
import { fb } from '@/lib/firebase';
import type { HouseholdStore } from '@/data/store';

export type PermState = NotificationPermission | 'unsupported';

export function permission(): PermState {
  return 'Notification' in window ? Notification.permission : 'unsupported';
}

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;

async function swReg(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;
  return navigator.serviceWorker.ready;
}

/**
 * Ask for notification permission and (in Firebase mode) register this
 * device's FCM token on the member doc so the Cloud Function can push to it.
 */
export async function enablePush(store: HouseholdStore, uid: string): Promise<PermState> {
  if (!('Notification' in window)) return 'unsupported';
  const p = await Notification.requestPermission();
  if (p !== 'granted') return p;
  await registerToken(store, uid);
  return p;
}

/** Silently refresh the token on startup if permission was already granted. */
export async function registerToken(store: HouseholdStore, uid: string) {
  if (IS_DEMO || !vapidKey || permission() !== 'granted') return;
  try {
    const { isSupported, getMessaging, getToken } = await import('firebase/messaging');
    if (!(await isSupported())) return;
    const reg = await swReg();
    if (!reg) return;
    const token = await getToken(getMessaging(fb().app), { vapidKey, serviceWorkerRegistration: reg });
    if (token) {
      const saved = localStorage.getItem('oh.fcm');
      if (saved !== token) {
        await store.arrayAdd('members', uid, 'fcmTokens', token);
        localStorage.setItem('oh.fcm', token);
      }
    }
  } catch (e) {
    console.warn('[push] token failed', e);
  }
}

/**
 * Show a system notification from the page (used when the partner's
 * activity arrives through the live Firestore listener while the app is
 * in the background). Same `tag` as the FCM push → no duplicates.
 */
export async function localNotify(title: string, body: string, tag: string, urgent = false) {
  if (permission() !== 'granted') return;
  const reg = await swReg();
  const opts: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
    body, tag, icon: '/pwa-192x192.png', badge: '/pwa-64x64.png', lang: 'ar', dir: 'rtl',
    requireInteraction: urgent, vibrate: urgent ? [300, 100, 300, 100, 600] : [120],
    data: { url: '/' },
  };
  if (reg) await reg.showNotification(title, opts);
  else new Notification(title, opts);
}

export function vibrate(pattern: number | number[] = 12) {
  try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
}
