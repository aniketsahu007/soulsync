import { CheckCircle2, Download } from "lucide-react";

import { usePWAInstall } from "@/hooks/usePWAInstall";

interface InstallAppCardProps {
  className?: string;
  onInstalled?: () => void;
  showUnavailable?: boolean;
}

export function InstallAppCard({
  className = "",
  onInstalled,
  showUnavailable = false,
}: InstallAppCardProps) {
  const { canInstall, install, isInstalled, isSecure } = usePWAInstall();

  if (isInstalled) {
    if (!showUnavailable) return null;

    return (
      <div
        className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-left shadow-sm dark:shadow-none ${className}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-950 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-slate-950 dark:text-slate-50">
            App installed
          </span>
          <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            Use Chrome's Open in app button
          </span>
        </span>
      </div>
    );
  }

  if (!canInstall && !showUnavailable) return null;

  const unavailableTitle = !isSecure ? "Install unavailable" : "Open in app";
  const unavailableMessage = !isSecure
    ? "Use HTTPS or localhost to install"
    : "Use Chrome's app button in the address bar";
  const isActionable = canInstall;

  return (
    <button
      type="button"
      disabled={!isActionable}
      onClick={async () => {
        if (!isActionable) return;
        const result = await install();
        if (result === "accepted") onInstalled?.();
      }}
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-left shadow-sm dark:shadow-none transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Download className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-black text-slate-950 dark:text-slate-50">
          {isActionable ? "Install app" : unavailableTitle}
        </span>
        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
          {isActionable ? "Add SoulSync to your phone" : unavailableMessage}
        </span>
      </span>
    </button>
  );
}
