import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
  HeartHandshake,
  Menu,
  UserCheck,
  X,
  ShieldCheck
} from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import { ALLOWED_ADMIN_EMAILS, normalizeEmail } from "@/lib/admin-governance";
import { supportNavItems, toolsNavItems } from "@/config/navigation";

import { Button } from "@/components/ui/button";
import { IdentityRecoveryButton } from "@/components/IdentityRecoveryButton";
import { InstallAppCard } from "@/components/pwa/InstallAppCard";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const Navbar = memo(() => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/volunteer");
  const isHomePage = location.pathname === "/";
  const isGlassMode = isHomePage && !scrolled;

  // Track scroll to intensify the navbar backdrop on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateAuthStatus = async (session: Session | null) => {
      const email = session?.user?.email || null;
      setUserEmail(email);
      
      if (email) {
        setIsAdmin(ALLOWED_ADMIN_EMAILS.includes(normalizeEmail(email)));
        
        // Check if user is a verified volunteer
        const { data: volunteerData } = await supabase
          .from("volunteers")
          .select("id, verification_status")
          .eq("email", email)
          .single();
          
        setIsVolunteer(volunteerData?.verification_status === "verified");
      } else {
        setIsAdmin(false);
        setIsVolunteer(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthStatus(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateAuthStatus(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        !isGlassMode 
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none text-slate-900 dark:text-slate-50" 
          : "bg-white/5 dark:bg-slate-950/5 backdrop-blur-sm border-b border-white/10 text-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3 group">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden transition-transform group-hover:scale-105">
              <img 
                src="/logo.png" 
                alt="SoulSync Logo" 
                className="h-full w-full rounded-full object-cover drop-shadow-sm blur-[0.2px] opacity-95"
                onError={(e) => {
                  e.currentTarget.src = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/heart-handshake.svg';
                  e.currentTarget.className = 'h-6 w-6 opacity-50';
                }}
              />
            </div>
            <div className="min-w-0">
              <span className={`block truncate font-display text-[1.35rem] font-semibold leading-none sm:text-[1.5rem] transition-colors ${!isGlassMode ? 'text-slate-900 dark:text-slate-50' : 'text-white'}`}>
                SoulSync
              </span>
              <p className={`mt-0.5 hidden text-[0.58rem] font-bold uppercase tracking-[0.2em] sm:block transition-colors ${!isGlassMode ? 'text-slate-500 dark:text-slate-400' : 'text-white/70'}`}>
                Harmony · Healing · Growth
              </p>
            </div>
          </Link>

          <div className="hidden xl:flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === "/"
                    ? !isGlassMode ? "bg-primary/10 text-primary font-semibold" : "bg-white/20 dark:bg-slate-950/20 text-white font-semibold shadow-inner"
                    : !isGlassMode ? "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50" : "text-white/80 hover:bg-white/10 dark:bg-slate-950/10 hover:text-white"
                }`}
              >
                Home
              </Link>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((value) => !value)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    dropdownOpen || location.pathname.includes("/support") || location.pathname.includes("/tools")
                      ? !isGlassMode ? "bg-primary/10 text-primary font-semibold" : "bg-white/20 dark:bg-slate-950/20 text-white font-semibold shadow-inner"
                      : !isGlassMode ? "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50" : "text-white/80 hover:bg-white/10 dark:bg-slate-950/10 hover:text-white"
                  }`}
                >
                  Explore
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute left-1/2 top-full mt-4 w-[36rem] -translate-x-1/2 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-4 shadow-2xl dark:shadow-none animate-in fade-in slide-in-from-top-4"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-slate-900 dark:text-slate-50">
                      {/* Support Section */}
                      <div>
                        <div className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Support
                        </div>
                        <div className="space-y-1">
                          {supportNavItems.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to as any}
                              onClick={() => setDropdownOpen(false)}
                              className={`flex items-start gap-3 rounded-[1.1rem] px-3 py-3 transition-all duration-150 ${
                                location.pathname === link.to
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-slate-50 dark:bg-slate-900"
                              }`}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${location.pathname === link.to ? "bg-primary/20" : "bg-primary/10"}`}
                              >
                                <link.icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{link.label}</div>
                                <div className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{link.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Tools Section */}
                      <div>
                        <div className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Tools
                        </div>
                        <div className="space-y-1">
                          <InstallAppCard
                            className="rounded-[1.1rem] px-3 py-3 shadow-none hover:bg-slate-50 dark:bg-slate-900 border-transparent bg-transparent"
                            onInstalled={() => setDropdownOpen(false)}
                            showUnavailable
                          />
                          {toolsNavItems.map((link) => (
                            <Link
                              key={link.to}
                              to={link.to as any}
                              onClick={() => setDropdownOpen(false)}
                              className={`flex items-start gap-3 rounded-[1.1rem] px-3 py-3 transition-all duration-150 ${
                                location.pathname === link.to
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-slate-50 dark:bg-slate-900"
                              }`}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${location.pathname === link.to ? "bg-primary/20" : "bg-primary/10"}`}
                              >
                                <link.icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{link.label}</div>
                                <div className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{link.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/volunteer"
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === "/volunteer"
                    ? !isGlassMode ? "bg-primary/10 text-primary font-semibold" : "bg-white/20 dark:bg-slate-950/20 text-white font-semibold shadow-inner"
                    : !isGlassMode ? "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:bg-slate-900/50 hover:text-slate-900 dark:text-slate-50" : "text-white/80 hover:bg-white/10 dark:bg-slate-950/10 hover:text-white"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Volunteer
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 md:flex items-center gap-2 lg:gap-3">
            {userEmail ? (
              <div className="flex items-center gap-3">
                <div className="hidden flex-col items-end xl:flex">
                  <span className={`text-[0.6rem] font-bold uppercase tracking-wider transition-colors ${!isGlassMode ? 'text-slate-400' : 'text-white/70'}`}>Signed in</span>
                  <span className={`text-sm font-semibold truncate max-w-[12rem] transition-colors ${!isGlassMode ? 'text-slate-900 dark:text-slate-50' : 'text-white'}`}>{userEmail}</span>
                </div>
                {isAdmin && (
                  <Link to="/admin/command-center">
                    <Button variant="outline" size="sm" className="rounded-full border-primary/30 text-primary font-bold px-4 flex items-center gap-2 hover:bg-primary/5">
                      <ShieldCheck className="h-4 w-4" />
                      Admin Hub
                    </Button>
                  </Link>
                )}
                {isVolunteer && !isAdmin && (
                  <Link to="/volunteer/dashboard" search={{ tab: "overview" }}>
                    <Button variant="outline" size="sm" className="rounded-full border-rose-500/30 text-rose-600 font-bold px-4 flex items-center gap-2 hover:bg-rose-50">
                      <HeartHandshake className="h-4 w-4" />
                      Volunteer Hub
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="rounded-full px-4"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                {!isAuthRoute && <IdentityRecoveryButton className="hidden md:inline-flex" />}
                <Link to="/chat">
                  <Button variant="default" size="default" className="rounded-full px-5 font-bold transition-all duration-200 hover:scale-[1.03]">
                    <span className="lg:hidden">Get Support</span>
                    <span className="hidden lg:inline xl:hidden">Start Chat</span>
                    <span className="hidden xl:inline">Start a Conversation</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors md:hidden ${
              !isGlassMode 
                ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 hover:bg-slate-50 dark:bg-slate-900 shadow-sm dark:shadow-none" 
                : "border-white/20 bg-white/10 dark:bg-slate-950/10 text-white hover:bg-white/20 dark:bg-slate-950/20 backdrop-blur-md"
            }`}
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div 
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl text-slate-900 dark:text-slate-50 shadow-2xl dark:shadow-none animate-in slide-in-from-top-4"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                location.pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50"
              }`}
            >
              Home
            </Link>

            <div className="pt-2 pb-1 px-4 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-400">
              Support
            </div>

            {supportNavItems.map((link) => (
              <Link
                key={link.to}
                to={link.to as any}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${location.pathname === link.to ? "bg-primary/20" : "bg-primary/10"}`}>
                  <link.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{link.label}</div>
                  <div className="text-xs font-normal text-slate-500 dark:text-slate-400">{link.desc}</div>
                </div>
              </Link>
            ))}

            <div className="pt-4 pb-1 px-4 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-slate-400">
              Tools
            </div>

            <InstallAppCard
              className="rounded-xl px-4 py-3 shadow-none border-transparent bg-transparent hover:bg-slate-50 dark:bg-slate-900"
              onInstalled={() => setMobileOpen(false)}
              showUnavailable
            />

            {toolsNavItems.map((link) => (
              <Link
                key={link.to}
                to={link.to as any}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${location.pathname === link.to ? "bg-primary/20" : "bg-primary/10"}`}>
                  <link.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{link.label}</div>
                  <div className="text-xs font-normal text-slate-500 dark:text-slate-400">{link.desc}</div>
                </div>
              </Link>
            ))}

            <div className="h-px bg-slate-100 dark:bg-slate-900 my-2" />

            <Link
              to="/volunteer"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                location.pathname === "/volunteer"
                  ? "bg-primary text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-900"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <div className="font-semibold">I Want to Volunteer</div>
                <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  Support others as a trained peer listener
                </div>
              </div>
            </Link>

            <div className="pt-3 pb-2 space-y-2">
              <Link to="/chat" onClick={() => setMobileOpen(false)}>
                <Button variant="default" className="h-12 w-full rounded-xl font-bold">
                  Get Support
                </Button>
              </Link>

              {!userEmail && !isAuthRoute && (
                <div className="flex justify-center">
                  <IdentityRecoveryButton />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = "Navbar";

