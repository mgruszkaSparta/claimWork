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
      navigator.serviceWorker.register("/mobile-sw.js").catch(() => {
        // ignore registration errors
      });
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
