// RoomMitra minimal service worker - versioned for easy updates
const SW_VERSION = "roommitra-sw-v5"; // bump this when you update the file
console.log(`[${SW_VERSION}] service worker version`);
self.addEventListener("install", (event) => {
  // Skip waiting only if you plan to immediately activate on install
  // For now we will not call skipWaiting to avoid surprises on clients.
  console.log(`[${SW_VERSION}] install event`);
  // You can pre-cache assets here if needed later.
});

self.addEventListener("activate", (event) => {
  console.log(`[${SW_VERSION}] activate event`);
  // Claim clients so that the SW starts controlling pages ASAP after activation
  // (optional, uncomment if you want immediate control)
  // event.waitUntil(self.clients.claim());
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

self.addEventListener("message", (event) => {
  // Allow the page to send a "ping" to check the SW is alive
  if (event.data && event.data.type === "PING_SW") {
    event.ports?.[0]?.postMessage({ type: "PONG", version: SW_VERSION });
  }
});
