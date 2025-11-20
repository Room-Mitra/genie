// app/components/ServiceWorkerRegister.jsx
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
      console.log('[SW] Service workers not supported in this browser.');
      return;
    }

    // Only register on https or localhost
    const isSecureContext = window.isSecureContext || isLocalhost();
    if (!isSecureContext) {
      console.log('[SW] Skipping registration: insecure context.');
      return;
    }

    // Avoid double registration in case of HMR/dev oddities
    let didRegister = false;

    async function registerSW() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('[SW] registered:', reg);

        // Optionally update immediately in development (useful while debugging)
        if (isLocalhost()) {
          try {
            await reg.update();
            console.log('[SW] reg.update() called (localhost/dev).');
          } catch (err) {
            console.warn('[SW] reg.update() error:', err);
          }
        }

        // Lifecycle events
        if (reg.installing) {
          console.log('[SW] state: installing');
          trackInstalling(reg.installing);
        } else if (reg.waiting) {
          console.log('[SW] state: waiting');
          onWaitingSW(reg);
        } else if (reg.active) {
          console.log('[SW] state: active (already)');
        }

        // Listen for updates found after initial registration
        reg.addEventListener('updatefound', () => {
          console.log('[SW] updatefound event');
          trackInstalling(reg.installing);
        });

        // Optionally, detect controlling SW changes (clients.claim + skipWaiting flows)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] controller changed (new SW took control).');
        });
      } catch (err) {
        console.error('[SW] registration failed:', err);
      }
    }

    function trackInstalling(worker) {
      if (!worker) return;
      console.log('[SW] trackInstalling — state:', worker.state);
      worker.addEventListener('statechange', () => {
        console.log('[SW] installing state change:', worker.state);
        if (worker.state === 'installed') {
          // When installed but waiting, it means new SW is waiting to activate
          if (navigator.serviceWorker.controller) {
            // There's an active controller — new SW in waiting
            console.log('[SW] new SW installed and waiting.');
            onWaitingSW(worker);
          } else {
            // No controller — first install, SW activated for the first time
            console.log('[SW] SW installed for the first time.');
          }
        }
      });
    }

    // Called when there's a waiting worker (an updated SW)
    function onWaitingSW(workerOrReg) {
      // workerOrReg may be ServiceWorker or ServiceWorkerRegistration
      const waitingWorker = workerOrReg.waiting || workerOrReg;
      console.log('[SW] onWaitingSW — found waiting worker:', waitingWorker);

      // Do not auto-skip waiting. Instead, expose a simple console-based flow:
      // To immediately activate the waiting SW, run:
      //
      // navigator.serviceWorker.getRegistration().then(reg => reg.waiting.postMessage({type: 'SKIP_WAITING'}))
      //
      // or call skipWaiting via the registration:
      // waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      //
      // We will log instructions for manual activation.
      console.info(
        '%c[SW] New service worker waiting to activate. To activate immediately, in console run:\n' +
        'navigator.serviceWorker.getRegistration().then(r => { r.waiting && r.waiting.postMessage({type: "SKIP_WAITING"}); })',
        'color: teal;'
      );
    }

    // Register now
    if (!didRegister) {
      registerSW();
      didRegister = true;
    }

    // Clean up (no listeners to remove here except controllerchange is global)
    return () => {
      // nothing to cleanup
    };
  }, []);

  return null; // no UI
}
