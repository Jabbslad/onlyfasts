export function isSupported(): boolean {
  return typeof Notification !== "undefined";
}

export function isPushSupported(): boolean {
  return "PushManager" in window && "serviceWorker" in navigator;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied";
  const result = await Notification.requestPermission();
  return result;
}

export async function sendNotification(title: string, body: string): Promise<void> {
  if (!isSupported() || Notification.permission !== "granted") return;

  // Prefer service worker notification (works on iOS PWA and when backgrounded)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      });
      return;
    } catch {
      // Fall back to Notification constructor
    }
  }

  new Notification(title, { body, icon: "/icons/icon-192.png" });
}
