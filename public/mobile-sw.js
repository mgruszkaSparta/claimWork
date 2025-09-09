const POLL_INTERVAL = 30000;
const seenIds = new Set();

// Determine the API base URL. When developing locally the API runs on
// a different port, while in production it is served from the same
// origin under the `/api` path.
const API_BASE_URL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.NEXT_PUBLIC_API_URL) ||
  (self.location.origin.includes("localhost")
    ? "http://localhost:5200/api"
    : "/api");

async function broadcast(notification) {
  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  for (const client of clients) {
    client.postMessage({ type: "PUSH_NOTIFICATION", notification });
  }
}

async function fetchNotifications() {
  try {
    const res = await fetch(`${API_BASE_URL}/mobile/notifications`);
    if (!res.ok) return;
    const items = await res.json();
    for (const n of items) {
      if (!seenIds.has(n.id)) {
        self.registration.showNotification(n.title || "Notification", {
          body: n.message || "",
        });
        seenIds.add(n.id);
        broadcast(n);
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

self.addEventListener('periodicsync', event => {
  if (event.tag === 'fetch-notifications') {
    event.waitUntil(fetchNotifications());
  }
});

self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || 'Notification';
  const options = { body: data.message || '' };
  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    broadcast(data);
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) {
        return list[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
