import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";

// Request notification permission and register service worker
if (typeof window !== "undefined") {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
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
        })
        .catch(() => {
          // ignore registration errors
        });
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
