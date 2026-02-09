// Service Worker registration with update handling
// VitePWA plugin auto-registers the SW, but we add update message handling

if ("serviceWorker" in navigator) {
  // Listen for messages from the service worker
  navigator.serviceWorker.addEventListener("message", (event) => {
    const { data } = event;

    // Handle skip waiting message to force update
    if (data?.type === "SKIP_WAITING") {
      navigator.serviceWorker.controller?.postMessage({
        type: "SKIP_WAITING",
      });
    }
  });

  // Listen for controller change (SW update installed)
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // Page will reload automatically when new SW takes control
  });

  // Setup SW message handling for app state
  window.addEventListener("beforeunload", () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SAVE_STATE",
        state: {
          url: window.location.href,
          timestamp: Date.now(),
        },
      });
    }
  });
}

