/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

// ── Offline app shell ──────────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
try {
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist: [/^\/__/] }));
} catch { /* dev mode: index.html not precached */ }

self.skipWaiting();
clientsClaim();

// ── Web Push (Firebase Cloud Messaging, data messages) ─────────
// FCM delivers the payload as JSON: { data: {...}, notification?: {...}, ... }
interface PushData { title?: string; body?: string; tag?: string; urgent?: string; url?: string }

self.addEventListener('push', (event) => {
  let payload: { data?: PushData; notification?: PushData } = {};
  try { payload = event.data?.json() ?? {}; } catch { payload = { data: { body: event.data?.text() } }; }
  const d = { ...payload.notification, ...payload.data };
  const urgent = d.urgent === '1' || d.urgent === 'true';

  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const focused = wins.some((c) => (c as WindowClient).focused && c.visibilityState === 'visible');
    const iOS = /iphone|ipad|ipod/i.test(self.navigator.userAgent);
    // App open & focused → the live listener already shows an in-app toast.
    // (iOS requires a visible notification for every push, so always show there.)
    if (focused && !urgent && !iOS) return;
    await self.registration.showNotification(d.title || 'بيتنا', {
      body: d.body || '',
      tag: d.tag || undefined,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      lang: 'ar',
      dir: 'rtl',
      requireInteraction: urgent,
      data: { url: d.url || '/' },
      vibrate: urgent ? [300, 100, 300, 100, 600] : [120], // Android
    } as NotificationOptions);
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string) || '/';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = wins[0] as WindowClient | undefined;
    if (existing) { await existing.focus(); return; }
    await self.clients.openWindow(url);
  })());
});
