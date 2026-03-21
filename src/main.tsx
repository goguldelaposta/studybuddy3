import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Capacitor } from '@capacitor/core';

// Register service worker for PWA - only on web, not in native apps
// Service workers don't work on file:// or capacitor:// protocols
if ('serviceWorker' in navigator && !Capacitor.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.log('SW registration failed:', error);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
