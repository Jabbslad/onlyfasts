import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL = 60 * 1000; // check every 60 seconds

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Periodically check for SW updates — crucial for iOS standalone PWAs
      // which don't trigger update checks on their own
      setInterval(() => {
        registration.update();
      }, UPDATE_CHECK_INTERVAL);
    },
  });

  if (!needRefresh) return null;

  const handleRefresh = async () => {
    // iOS Safari doesn't reliably fire 'controllerchange' after skipWaiting,
    // so updateServiceWorker(true) can silently fail to reload.
    // We call it, then force a hard reload after a short timeout as a fallback.
    try {
      await updateServiceWorker(true);
    } catch {
      // ignore — fallback below handles it
    }
    // If updateServiceWorker didn't trigger a reload (common on iOS),
    // force one after giving the SW time to activate
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] text-[#f0f0fa] text-sm font-medium">
      <span>Update available</span>
      <button
        onClick={handleRefresh}
        className="px-3 py-1 rounded-lg bg-[rgba(240,240,250,0.1)] hover:bg-[rgba(240,240,250,0.2)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-[#f0f0fa]"
      >
        Refresh
      </button>
    </div>
  );
}
