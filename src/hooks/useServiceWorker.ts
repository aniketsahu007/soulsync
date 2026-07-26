import { useEffect, useState } from "react";
import { toast } from "sonner";

type ServiceWorkerState = {
  offlineReady: boolean;
  updateReady: boolean;
  registrationReady: boolean;
};

type RegisterSW = typeof import("virtual:pwa-register").registerSW;

const listeners = new Set<(state: ServiceWorkerState) => void>();
let registrationStarted = false;
let updateServiceWorker: ReturnType<RegisterSW> | null = null;
let serviceWorkerState: ServiceWorkerState = {
  offlineReady: false,
  updateReady: false,
  registrationReady: false,
};

function setServiceWorkerState(next: Partial<ServiceWorkerState>) {
  serviceWorkerState = { ...serviceWorkerState, ...next };
  listeners.forEach((listener) => listener(serviceWorkerState));
}

function subscribe(listener: (state: ServiceWorkerState) => void) {
  listeners.add(listener);
  listener(serviceWorkerState);

  return () => {
    listeners.delete(listener);
  };
}

async function startRegistration() {
  if (
    registrationStarted ||
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  registrationStarted = true;

  const { registerSW } = await import("virtual:pwa-register");
  updateServiceWorker = registerSW({
    immediate: true,
    onOfflineReady() {
      setServiceWorkerState({
        offlineReady: true,
        registrationReady: true,
      });
    },
    onNeedRefresh() {
      setServiceWorkerState({
        updateReady: true,
        registrationReady: true,
      });

      toast("A SoulSync update is ready.", {
        description: "Reload when you are ready to use the newest version.",
        action: {
          label: "Reload",
          onClick: () => {
            updateServiceWorker?.(true);
          },
        },
      });
    },
    onRegisteredSW() {
      setServiceWorkerState({ registrationReady: true });
    },
    onRegisterError(error) {
      console.error("[PWA] Service worker registration failed:", error);
    },
  });
}

export function useServiceWorker() {
  const [state, setState] = useState(serviceWorkerState);

  useEffect(() => subscribe(setState), []);

  useEffect(() => {
    startRegistration();
  }, []);

  return state;
}
