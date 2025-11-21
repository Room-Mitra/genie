'use client';
import { useEffect, useState } from 'react';
import { getFirebaseMessaging } from '@/lib/firebaseClient';
import { getToken } from 'firebase/messaging';

export default function PushNotifications({ user }) {
  const { userId } = user;

  async function enable() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        return;
      }
      const messaging = getFirebaseMessaging();

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

      const token = await getToken(messaging, { vapidKey });
      if (!token) throw new Error('No token received');
      // POST token to backend for storage (replace URL & shape)
      await fetch('/api/fcm/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token, userAgent: navigator.userAgent })
      });
      console.log('[FCM] token', token);
    } catch (err) {
      console.error('[FCM] enable error', err);
    }
  }

  useEffect(() => {
    enable();
  }, []);

  return null;
}
