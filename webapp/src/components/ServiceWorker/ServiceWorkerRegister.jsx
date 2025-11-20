'use client';

import { useEffect } from 'react';

function isLocalhost() {
  return Boolean(
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]')
  );
}

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service workers not supported.');
      return;
    }

    // Only allow SW on HTTPS or localhost
    const secure = window.isSecureContext || isLocalhost();
    if (!secure) {
      console.log('[SW] Not secure context — skipping SW registration.');
      return;
    }

    // --- REGISTER SERVICE WORKER --- //
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (reg) => {
        console.log('[SW] Registered:', reg);

        // --- DEV ONLY: FORCE UPDATE CHECK --- //
        if (isLocalhost()) {
          try {
            await reg.update();
            console.log('[SW] reg.update() called (localhost/dev)');
          } catch (e) {
            console.warn('[SW] reg.update() error:', e);
          }
        }

        // If a worker is already installing, track its state
        if (reg.installing) {
          console.log('[SW] installing…');
          hookWorker(reg.installing);
        }

        // Listen for new updates
        reg.addEventListener('updatefound', () => {
          console.log('[SW] update found');
          hookWorker(reg.installing);
        });

        // When the controller changes, the new SW has taken over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] controllerchange — new SW now controls page');
        });
      })
      .catch((err) => {
        console.error('[SW] Registration failed:', err);
      });

    // Helper — track installation state
    function hookWorker(worker) {
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        console.log('[SW] worker state:', worker.state);
      });
    }
  }, []);

  return null;
}
