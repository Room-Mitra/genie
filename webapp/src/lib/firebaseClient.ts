// src/lib/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: any;
export function getFirebaseApp() {
  if (!firebaseApp) firebaseApp = initializeApp(firebaseConfig);
  return firebaseApp;
}

/**
 * Request notification permission and return the FCM registration token.
 * Returns null if permission denied or token unavailable.
 */
export async function requestFcmToken(): Promise<string | null> {
  try {
    // Ensure firebase app + messaging exist
    getFirebaseApp();
    const messaging = getMessaging();
    // This will prompt the user for notification permission (browser)
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return token || null;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

// Optional: foreground message handler
export function onForegroundMessage(callback: (payload: any) => void) {
  const messaging = getMessaging();
  onMessage(messaging, (payload) => {
    callback(payload);
  });
}
