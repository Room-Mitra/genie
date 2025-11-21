// This file only handles background notifications from Firebase Messaging.

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// TODO: replace with your firebase config (only apiKey & projectId & messagingSenderId/public info)
firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

console.log('firebase initialized : ', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  // payload.notification contains title/body if set in the message.
  const title = payload.notification?.title || 'RoomMitra';
  const options = {
    body: payload.notification?.body || JSON.stringify(payload.data || {}),
    icon: '/images/room-mitra-square-logo.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
