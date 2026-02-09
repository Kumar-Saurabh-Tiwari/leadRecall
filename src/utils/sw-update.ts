/**
 * Service Worker Auto-Update Handler
 * Automatically updates the app when new code is deployed
 */

let updateCheckInterval: NodeJS.Timeout | null = null;
let currentRegistration: ServiceWorkerRegistration | null = null;

export const setupUpdateChecker = () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers are not supported");
    return;
  }

  // Check for updates immediately
  checkForUpdates();

  // Then check every 60 seconds
  updateCheckInterval = setInterval(() => {
    checkForUpdates();
  }, 60000);

  // Auto reload when service worker updates
  navigator.serviceWorker?.addEventListener("controllerchange", () => {
    console.log("App updated to latest version");
    // Auto reload after a short delay to apply new code
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
};

export const checkForUpdates = async () => {
  try {
    if (!navigator.serviceWorker?.controller) {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return;
    }

    currentRegistration = registration;

    // Check for updates
    await registration.update();

    // If there's a waiting worker, automatically update without notification
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  } catch (error) {
    console.error("Update check failed:", error);
  }
};

export const stopUpdateChecker = () => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
};

