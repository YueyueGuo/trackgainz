// src/serviceWorkerRegistration.ts

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    /^127(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|\d{1,2})){3}$/.test(window.location.hostname)
);

export function register(config?: Config) {
  // Only register in production and if service worker is supported
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      console.log('Service worker registration skipped - different origins');
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('This web app is being served cache-first by a service worker.');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  } else {
    console.log('Service worker registration skipped - not in production or not supported');
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl, {
      scope: '/',
      updateViaCache: 'none'
    })
    .then((registration) => {
      console.log('Service worker registered successfully:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
              config?.onUpdate?.(registration);
            } else {
              console.log('Content is cached for offline use.');
              config?.onSuccess?.(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      
      // Check if it's a MIME type or script evaluation error
      if (error.message.includes('MIME type') || 
          error.message.includes('text/html') ||
          error.message.includes('script evaluation failed')) {
        console.warn('Service worker script evaluation failed. This might be due to deployment configuration.');
        console.warn('Consider checking your Vercel configuration or temporarily disabling service worker.');
      }
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, { 
    headers: { 'Service-Worker': 'script' },
    cache: 'no-cache'
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType && !contentType.includes('javascript'))
      ) {
        console.log('Service worker not found or invalid content type. Unregistering...');
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch((error) => {
      console.log('No internet connection found. App is running in offline mode.');
      console.error('Service worker fetch error:', error);
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Error unregistering service worker:', error);
      });
  }
}

export {};