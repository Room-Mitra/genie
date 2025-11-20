// RoomMitra minimal service worker - versioned for easy updates
const SW_VERSION = "roommitra-sw-v7"; // bump this when you update the file
console.log('🔥 Loading SW version', SW_VERSION);
self.addEventListener("install", (event) => {
  // Skip waiting only if you plan to immediately activate on install
  self.skipWaiting();
  // For now we will not call skipWaiting to avoid surprises on clients.
  console.log(`[${SW_VERSION}] install event`);
  // You can pre-cache assets here if needed later.
});

// Activate: claim all open tabs and force new SW to control them
self.addEventListener("activate", (event) => {
  console.log(`[${SW_VERSION}] activate`);
  event.waitUntil(
    self.clients.claim().then(async () => {
      const clients = await self.clients.matchAll({ type: "window" });

      // Force reload all open tabs so they run the new SW + new JS bundle
      for (const client of clients) {
        client.navigate(client.url);
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Minimal pass-through fetch handler - does not cache or modify responses.
  // Keeps the SW non-invasive until we explicitly add features.
  // This allows DevTools to show the SW is active without changing network behavior.
  // NOTE: keep this handler minimal to avoid interfering with your app.
  console.log(`[${SW_VERSION}] fetch ${event.request.url}`);
  // Let the request go to the network by default
  event.respondWith(fetch(event.request));
});


self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'PING_SW') {
    event.ports?.[0]?.postMessage({ type: 'PONG', version: SW_VERSION });
  }
});
