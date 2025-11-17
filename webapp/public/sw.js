// public/sw.js
// Minimal service worker for RoomMitra PWA
// Purpose: lifecycle logs + simple push/notification handler for testing.

const SW_VERSION = 'roommitra-sw-v2';

self.addEventListener('install', event => {
  // Skip waiting is optional. For now we won't force activation across tabs.
  console.log(`[Service Worker] ${SW_VERSION} installing...`);
  // If you later need to pre-cache assets, do it here.
  event.waitUntil(self.skipWaiting()); // make newly installed worker move to activate (optional)
});

self.addEventListener('activate', event => {
  console.log(`[Service Worker] ${SW_VERSION} activated`);
  // Claim clients so that the SW starts controlling pages ASAP after activation.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  console.log('[Service Worker] Received message from client:', event.data);
  // You can use this to send commands to the SW (e.g., to update version or clear caches).
});

self.addEventListener('push', event => {
  // Basic push handler — show a notification if payload available.
  console.log('[Service Worker] Push event received', event);

  let title = 'RoomMitra';
  let options = {
    body: 'New task assigned',
    tag: 'roommitra-task',
    renotify: true,
    data: {}
  };

  try {
    if (event.data) {
      const text = event.data.text();
      options.body = text;
      // If payload is JSON, you can parse it:
      try {
        const json = JSON.parse(text);
        title = json.title || title;
        options.body = json.body || options.body;
        options.data = json.data || {};
      } catch (e) {
        // not JSON; use text directly
      }
    }
  } catch (err) {
    console.warn('[Service Worker] error reading push payload', err);
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
      .catch(err => console.error("showNotification ERROR:", err))
  );
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] notificationclick', event);
  event.notification.close();

  // Focus or open the app and navigate to the staff tasks page.
  // Adjust the URL to your staff tasks route.
  const urlToOpen = new URL('/requests/active', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Try to find an open window to focus
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// click on inspect in chrome://inspect/#service-workers to see sw logs
