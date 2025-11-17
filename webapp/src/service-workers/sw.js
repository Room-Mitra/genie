// Required to make Firebase messaging work
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || "New Message", {
      body: data.body || "",
      icon: "/images/favicon.ico",
    })
  );
});

// Required for PWA install prompt
self.addEventListener("install", () => {
  console.log("Service Worker installed");
});
