import { useCallback, useEffect, useState } from "react";

import { markPWAInstalled, useIsInstalled } from "@/hooks/useIsInstalled";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<() => void>();

function notifyInstallListeners() {
  installListeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notifyInstallListeners();
  });

  window.addEventListener("appinstalled", () => {
    markPWAInstalled();
    deferredPrompt = null;
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
    if (!deferredPrompt || isInstalled) return "unavailable" as const;

    const prompt = deferredPrompt;
    deferredPrompt = null;
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
