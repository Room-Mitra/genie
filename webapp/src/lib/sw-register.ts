// lib/sw-register.ts
// Lightweight, well-logged service worker registration helper.
// Exports: registerServiceWorker(options) and unregister()

type Callbacks = {
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  onRegisterError?: (error: Error) => void;
  onUpdateFound?: (registration: ServiceWorkerRegistration) => void;
  onWaiting?: (registration: ServiceWorkerRegistration) => void;
  onActivated?: (registration: ServiceWorkerRegistration) => void;
};

const defaultOptions = {
  swPath: '/sw.js',
  // Only register automatically on secure origin (https) OR localhost.
  shouldRegister: () =>
    typeof window !== 'undefined' &&
    ('serviceWorker' in navigator) &&
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
};

export function registerServiceWorker(opts?: {
  swPath?: string;
  callbacks?: Callbacks;
}) {
  const { swPath = defaultOptions.swPath, callbacks = {} } = opts || {};

  if (!defaultOptions.shouldRegister()) {
    console.log('[SW] Skipping registration: not secure or no navigator.serviceWorker');
    return Promise.resolve(null);
  }

  // Wait for window load to avoid blocking initial navigation
  return new Promise<ServiceWorkerRegistration | null>((resolve) => {
    const onLoad = () => {
      navigator.serviceWorker.register(swPath).then(registration => {
        console.log('[SW] Registered service worker at', swPath, registration);

        callbacks.onRegistered?.(registration);

        // listen for updates to the worker
        if (registration.installing) {
          console.log('[SW] registration.installing found');
          callbacks.onUpdateFound?.(registration);
          trackInstalling(registration.installing, callbacks);
        }

        registration.addEventListener('updatefound', () => {
          console.log('[SW] updatefound');
          callbacks.onUpdateFound?.(registration);
          const newWorker = registration.installing;
          if (newWorker) trackInstalling(newWorker, callbacks);
        });

        // detect when the active controller changes (e.g., new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] controllerchange: a new service worker took control');
          callbacks.onActivated?.(registration);
        });

        resolve(registration);
      }).catch(error => {
        console.error('[SW] Registration failed', error);
        callbacks.onRegisterError?.(error);
        resolve(null);
      });
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }
  });
}

function trackInstalling(worker: ServiceWorker, callbacks: Callbacks) {
  console.log('[SW] trackInstalling - state:', worker.state);
  worker.addEventListener('statechange', () => {
    console.log('[SW] installing worker statechange ->', worker.state);
    if (worker.state === 'installed') {
      // If there's a controller, then this is an update (new SW waiting)
      if (navigator.serviceWorker.controller) {
        console.log('[SW] new worker installed and waiting');
        callbacks.onWaiting?.(navigator.serviceWorker.getRegistration ? (async () => {
          const reg = await navigator.serviceWorker.getRegistration();
          return reg!;
        })() : undefined as any);
      } else {
        console.log('[SW] installed for the first time (no prior controller)');
      }
    } else if (worker.state === 'activated') {
      console.log('[SW] worker activated');
      callbacks.onActivated?.(undefined as any);
    }
  });
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const reg of registrations) {
    console.log('[SW] Unregistering', reg);
    await reg.unregister();
  }
}
