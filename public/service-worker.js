/* Service Worker for Chatter Push Notifications */

// Handle push events
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push notification received but no data');
    return;
  }

  try {
    const data = event.data.json();
    const {
      title = 'Chatter',
      body = 'New message',
      icon = '/favicon.png',
      badge = '/favicon.png',
      tag = 'message-notification',
      data: notificationData = {},
    } = data;

    const options = {
      body,
      icon,
      badge,
      tag,
      data: notificationData,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event;

  notification.close();

  if (action === 'close') {
    return;
  }

  const urlToOpen = notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Keep service worker alive
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'KEEP_ALIVE') {
    console.log('Service Worker ping received');
  }
});

// Update service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});
