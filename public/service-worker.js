
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const { title, body, data } = event.data.json();

    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data,
      vibrate: [100, 50, 100],
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' && event.notification.data?.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
