const CACHE_NAME = 'cuadro-pwa-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, then cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            if (event.request.method === 'GET') {
              cache.put(event.request, responseClone);
            }
          });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle push notifications (for future backend integration)
self.addEventListener('push', (event) => {
  const options = {
    body: '¿En qué gastaste hoy? Registra tus gastos para no perder el control 💰',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    tag: 'cuadro-reminder',
    renotify: true,
    actions: [
      { action: 'open', title: 'Abrir Cuadro' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Cuadro - Recordatorio', options)
  );
});

// Periodic background sync (for browsers that support it)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(showDailyReminder());
  }
});

async function showDailyReminder() {
  const now = new Date();
  const hour = now.getHours();

  // Only show between 9pm and 10pm
  if (hour === 21) {
    const options = {
      body: '¿En qué gastaste hoy? Registra tus gastos para no perder el control 💰',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      tag: 'cuadro-daily-reminder',
      renotify: false
    };

    await self.registration.showNotification('Cuadro - Recordatorio diario', options);
  }
}
