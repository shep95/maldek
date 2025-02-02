self.addEventListener('sync', (event) => {
  if (event.tag === 'video-upload') {
    event.waitUntil(
      (async () => {
        try {
          const clients = await self.clients.matchAll();
          if (clients.length > 0) {
            clients[0].postMessage({ type: 'PROCESS_PENDING_UPLOADS' });
          }
        } catch (error) {
          console.error('Error in sync event:', error);
        }
      })()
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    ])
  );
});