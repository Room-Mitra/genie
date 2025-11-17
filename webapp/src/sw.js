// src/sw.js (this is the file serwist will bundle to public/sw.js)
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// initialize the firebase app in the service worker
firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // optional but safe
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload?.notification?.title || 'RoomMitra';
  const notificationOptions = {
    body: payload?.notification?.body || '',
    icon: '/icons/icon-192x192.png',
    // you may pass data to handle clicks
    data: payload?.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Also keep any basic listeners you had:
self.addEventListener("install", () => {
  console.log("Service Worker installed");
});
