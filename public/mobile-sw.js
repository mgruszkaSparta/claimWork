const POLL_INTERVAL = 30000;
const seenIds = new Set();

async function fetchNotifications() {
  try {
    const res = await fetch('/api/mobile/notifications');
    if (!res.ok) return;
    const items = await res.json();
    for (const n of items) {
      if (!seenIds.has(n.id)) {
        self.registration.showNotification(n.title || 'Notification', {
          body: n.message || '',
        });
        seenIds.add(n.id);
      }
    }
  } catch (err) {
    // ignore network errors
  }
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
  fetchNotifications();
  setInterval(fetchNotifications, POLL_INTERVAL);
});
