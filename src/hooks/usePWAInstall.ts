import { useCallback, useEffect, useState } from "react";

import { markPWAInstalled, useIsInstalled } from "@/hooks/useIsInstalled";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();

declare global {
  interface Window {
    __soulSyncInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

function notifyInstallListeners() {
  installListeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  if (window.__soulSyncInstallPrompt) {
    deferredPrompt = window.__soulSyncInstallPrompt;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    window.__soulSyncInstallPrompt = deferredPrompt;
    notifyInstallListeners();
  });

  window.addEventListener("soulsync-install-ready", () => {
    deferredPrompt = window.__soulSyncInstallPrompt ?? null;
    notifyInstallListeners();
  });

  window.addEventListener("appinstalled", () => {
    markPWAInstalled();
    deferredPrompt = null;
    window.__soulSyncInstallPrompt = null;
    notifyInstallListeners();
  });

  window.addEventListener("soulsync-install-installed", () => {
    markPWAInstalled();
    deferredPrompt = null;
    window.__soulSyncInstallPrompt = null;
    notifyInstallListeners();
  });
}

export function usePWAInstall() {
  const isInstalled = useIsInstalled();
  const isSupported =
    typeof window !== "undefined" &&
    "BeforeInstallPromptEvent" in window === false
      ? "onbeforeinstallprompt" in window
      : typeof window !== "undefined";
  const isSecure =
    typeof window !== "undefined" ? window.isSecureContext : false;
  const [canInstall, setCanInstall] = useState(
    () => Boolean(deferredPrompt) && !isInstalled
  );
  const [choice, setChoice] = useState<"accepted" | "dismissed" | null>(null);

  useEffect(() => {
    const update = () => setCanInstall(Boolean(deferredPrompt) && !isInstalled);
    installListeners.add(update);
    update();

    return () => {
      installListeners.delete(update);
    };
  }, [isInstalled]);

  const install = useCallback(async () => {
    if (!deferredPrompt && typeof window !== "undefined") {
      deferredPrompt = window.__soulSyncInstallPrompt ?? null;
    }

    if (!deferredPrompt || isInstalled) return "unavailable" as const;

    const prompt = deferredPrompt;
    deferredPrompt = null;
    if (typeof window !== "undefined") {
      window.__soulSyncInstallPrompt = null;
    }
    notifyInstallListeners();

    await prompt.prompt();
    const result = await prompt.userChoice;
    setChoice(result.outcome);
    if (result.outcome === "accepted") markPWAInstalled();
    notifyInstallListeners();

    return result.outcome;
  }, [isInstalled]);

  return {
    canInstall,
    install,
    installChoice: choice,
    isSecure,
    isInstalled,
    isSupported,
  };
}
