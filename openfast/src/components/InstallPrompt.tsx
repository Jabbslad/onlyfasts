import { useState, useEffect } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const { canInstall, install } = useInstallPrompt();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Don't show if user previously dismissed
    const dismissed = localStorage.getItem("openfast-install-dismissed");
    if (dismissed) return;

    // Show after a short delay so it doesn't flash on load
    const timer = setTimeout(() => setVisible(true), 3000);

    const onInstalled = () => {
      localStorage.setItem("openfast-install-dismissed", "1");
      setVisible(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem("openfast-install-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-[rgba(240,240,250,0.03)] border border-[rgba(240,240,250,0.06)] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-[#f0f0fa] text-sm font-semibold">Install OpenFast</p>
            {isIOS ? (
              <p className="text-[#f0f0fa]/50 text-xs mt-1">
                Tap{" "}
                <svg
                  className="inline w-4 h-4 -mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>{" "}
                then &quot;Add to Home Screen&quot; for the full app experience with notifications and badges.
              </p>
            ) : (
              <>
                <p className="text-[#f0f0fa]/50 text-xs mt-1">
                  Add to your home screen for the full app experience with notifications and badges.
                </p>
                {canInstall && (
                  <button
                    onClick={install}
                    className="mt-2 px-4 py-1.5 bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] text-[#f0f0fa] text-xs font-medium rounded-[32px] transition-colors min-h-[44px] hover:bg-[rgba(240,240,250,0.15)]"
                  >
                    Install
                  </button>
                )}
              </>
            )}
          </div>
          <button
            onClick={dismiss}
            className="text-[#f0f0fa]/50 hover:text-[#f0f0fa]/70 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
