import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import { NotificationsProvider } from "./hooks/useNotifications";
import { AuthProvider } from "../hooks/use-auth";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Request notification permission and register service worker
if (typeof window !== "undefined") {
  window.addEventListener("load", async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/mobile-sw.js")
        .then(async (reg) => {
          const interval = 30 * 1000;
          // @ts-expect-error - periodicSync is experimental
          if ("periodicSync" in reg) {
            try {
              // @ts-expect-error - register is not yet typed
              await reg.periodicSync.register("fetch-notifications", {
                minInterval: interval,
              });
            } catch {
              // ignore registration errors
            }
          }

          if ("PushManager" in window && Notification.permission === "granted") {
            try {
              const res = await fetch("/api/push/public-key");
              const data = await res.json();
              let sub = await reg.pushManager.getSubscription();
              if (!sub) {
                sub = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(data.key),
                });
              }
              await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sub),
              });
            } catch {
              // ignore push registration errors
            }
          }
        })
        .catch(() => {
          // ignore registration errors
        });
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <NotificationsProvider>
      <App />
    </NotificationsProvider>
  </AuthProvider>
);
