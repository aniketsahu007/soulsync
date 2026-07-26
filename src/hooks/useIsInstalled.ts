import { useEffect, useState } from "react";

const PWA_INSTALLED_STORAGE_KEY = "soulsync_pwa_installed";

function detectStandalone() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function detectInstalled() {
  if (detectStandalone()) return true;
  if (typeof window === "undefined") return false;

  return localStorage.getItem(PWA_INSTALLED_STORAGE_KEY) === "true";
}

export function markPWAInstalled() {
  if (typeof window === "undefined") return;
  localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, "true");
}

export function useIsInstalled() {
  const [isInstalled, setIsInstalled] = useState(detectInstalled);

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const fullscreenQuery = window.matchMedia("(display-mode: fullscreen)");
    const update = () => setIsInstalled(detectInstalled());
    const handleInstalled = () => {
      markPWAInstalled();
      update();
    };

    update();
    standaloneQuery.addEventListener("change", update);
    fullscreenQuery.addEventListener("change", update);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      standaloneQuery.removeEventListener("change", update);
      fullscreenQuery.removeEventListener("change", update);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  return isInstalled;
}
