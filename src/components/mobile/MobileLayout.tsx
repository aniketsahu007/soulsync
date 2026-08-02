import { Link, useLocation } from "@tanstack/react-router";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { IdentityRecoveryButton } from "@/components/IdentityRecoveryButton";
import { InstallAppCard } from "@/components/pwa/InstallAppCard";
import { mobilePrimaryNavItems, navigationItems } from "@/config/navigation";
import { supabase } from "@/integrations/supabase/client";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  className?: string;
}

export function MobileLayout({
  children,
  title = "SoulSync",
  subtitle = "Your safe space",
  showHeader = true,
  className = "",
}: MobileLayoutProps) {
  const location = useLocation();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const exploreItems = navigationItems.filter((item) =>
    ["/check-in", "/mood-tracker", "/resources", "/partners", "/privacy-policy"].includes(item.to)
  );
  const supportItems = navigationItems.filter((item) =>
    ["/chat", "/peer-match", "/community-qna"].includes(item.to)
  );

  useEffect(() => {
    const updateAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email ?? null;
      setUserEmail(email);

      if (!email) {
        setIsVolunteer(false);
        return;
      }

      const { data: volunteerData } = await supabase
        .from("volunteers")
        .select("verification_status")
        .eq("email", email)
        .maybeSingle();

      setIsVolunteer(volunteerData?.verification_status === "verified");
    };

    updateAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      updateAuthState();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className={`min-h-[100dvh] max-w-full overflow-x-hidden bg-[#f7fbf8] dark:bg-[#09090b] text-slate-950 dark:text-slate-50 ${className}`}>
      {showHeader && (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] shadow-sm dark:shadow-none">
          <div className="flex min-h-12 items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                <img src="/logo.png" alt="SoulSync" className="h-full w-full object-contain drop-shadow-sm blur-[0.2px] opacity-95" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-xl font-black leading-none text-slate-950 dark:text-slate-50">
                  {title}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  {subtitle}
                </span>
              </span>
            </Link>

            <button
              type="button"
              aria-label="Open explore menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none transition active:scale-95"
              onClick={() => setExploreOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      {exploreOpen && (
        <div className="fixed inset-0 z-[70] bg-black/50">
          <button
            type="button"
            aria-label="Close explore menu"
            className="absolute inset-0 cursor-default"
            onClick={() => setExploreOpen(false)}
          />
          <section className="scrollbar-none absolute inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] max-h-[calc(100dvh-env(safe-area-inset-top)-1.5rem)] overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/80 bg-white dark:bg-slate-950 p-4 shadow-2xl dark:shadow-none">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                  Explore
                </p>
                <h2 className="mt-1 font-display text-2xl font-black text-slate-950 dark:text-slate-50">
                  SoulSync features
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close explore menu"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                onClick={() => setExploreOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Tools and account
                </p>
                <div className="mb-3 grid gap-2">
                  <InstallAppCard
                    onInstalled={() => setExploreOpen(false)}
                  />
                  <IdentityRecoveryButton className="h-12 w-full justify-center rounded-2xl" />
                  {isVolunteer ? (
                    <Link
                      to="/volunteer/dashboard"
                      search={{ tab: "overview" }}
                      onClick={() => setExploreOpen(false)}
                      className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-sm dark:shadow-none transition active:scale-[0.99]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black text-slate-950 dark:text-slate-50">Volunteer dashboard</span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                          Continue as {userEmail ?? "verified volunteer"}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to="/volunteer/dashboard"
                      search={{ tab: "overview" }}
                      onClick={() => setExploreOpen(false)}
                      className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-sm dark:shadow-none transition active:scale-[0.99]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-black text-slate-950 dark:text-slate-50">Volunteer login</span>
                        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                          Sign in to the volunteer dashboard
                        </span>
                      </span>
                    </Link>
                  )}
                </div>
                <div className="grid gap-2">
                  {exploreItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to as any}
                        onClick={() => setExploreOpen(false)}
                        className="flex min-h-[64px] items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-sm dark:shadow-none transition active:scale-[0.99]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-slate-950 dark:text-slate-50">{item.label}</span>
                          <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">{item.desc}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Support
                </p>
                <div className="grid gap-2">
                  {supportItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to as any}
                        onClick={() => setExploreOpen(false)}
                        className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-3 transition active:scale-[0.99]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-950 text-emerald-700 shadow-sm dark:shadow-none">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-slate-950 dark:text-slate-50">{item.label}</span>
                          <span className="mt-0.5 block text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{item.desc}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      <main className="scrollbar-none max-w-full overflow-x-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+6.75rem)] pt-[calc(env(safe-area-inset-top)+5.75rem)]">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 shadow-sm dark:shadow-none">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobilePrimaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to as any}
                aria-label={item.label}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-black transition duration-200 active:scale-95 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900 hover:text-slate-800 dark:text-slate-200"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate">{item.shortLabel}</span>
                {isActive && (
                  <span className="absolute top-1.5 h-1 w-5 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
