import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  HeartHandshake,
  HelpCircle,
  Menu,
  MessageCircleHeart,
  TrendingUp,
  UserCheck,
  Users,
  X,
  ShieldCheck
} from "lucide-react";
import { useEffect, useRef, useState, memo } from "react";
import { ALLOWED_ADMIN_EMAILS, normalizeEmail } from "@/lib/admin-governance";

import { Button } from "@/components/ui/button";
import { IdentityRecoveryButton } from "@/components/IdentityRecoveryButton";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const exploreLinks = [
  { to: "/check-in", label: "My Check-In", desc: "How are you feeling?", icon: ClipboardCheck },
  { to: "/chat", label: "Talk to Someone", desc: "Safe, anonymous AI support", icon: MessageCircleHeart },
  { to: "/peer-match", label: "Peer Support", desc: "Connect with a trained volunteer", icon: Users },
  { to: "/partners", label: "NGO Partners", desc: "Our network of professional help", icon: HeartHandshake },
  { to: "/mood-tracker", label: "Mood Journal", desc: "Track your emotional journey", icon: TrendingUp },
  { to: "/community-qna", label: "Community Q&A", desc: "You are not alone in this", icon: HelpCircle },
  { to: "/resources", label: "Schedule Architect", desc: "Atomic habits & focus timer", icon: BookOpen },
] as const;

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
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.96)"
          : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(16,185,129,0.18)"
          : "1px solid rgba(16,185,129,0.10)",
        boxShadow: scrolled
          ? "0 4px 24px -4px rgba(16,185,129,0.10), 0 1px 0 0 rgba(16,185,129,0.08)"
          : "0 2px 16px -4px rgba(15,23,42,0.06)",
      }}
    >
      {/* Top accent line — a thin green glow stripe at the very top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #10b981 30%, #0ea5e9 70%, transparent 100%)",
          opacity: scrolled ? 1 : 0.6,
          transition: "opacity 0.3s",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.25rem] items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
              <img 
                src="/logo.png" 
                alt="SoulSync Logo" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/heart-handshake.svg';
                  e.currentTarget.className = 'h-6 w-6 opacity-50';
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-display text-[1.35rem] font-semibold leading-none text-gradient sm:text-[1.5rem]">
                SoulSync
              </span>
              <p className="mt-0.5 hidden text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:block">
                Harmony · Healing · Growth
              </p>
            </div>
          </Link>

          <div className="hidden xl:flex flex-1 items-center justify-center">
            <div
              className="flex items-center gap-0.5 rounded-full p-1"
              style={{
                background: "rgba(241,245,249,0.8)",
                border: "1px solid rgba(16,185,129,0.14)",
              }}
            >
              <Link
                to="/"
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  location.pathname === "/"
                    ? "bg-white text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-slate-500 hover:bg-white/70 hover:text-foreground"
                }`}
              >
                Home
              </Link>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((value) => !value)}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                    dropdownOpen
                      ? "bg-white text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-slate-500 hover:bg-white/70 hover:text-foreground"
                  }`}
                >
                  Explore
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-primary" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-3 w-80 p-2"
                    style={{
                      background: "rgba(255,255,255,0.98)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      borderRadius: "1.5rem",
                      boxShadow: "0 20px 48px -8px rgba(15,23,42,0.14), 0 0 0 1px rgba(255,255,255,0.8) inset",
                    }}
                  >
                    {exploreLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-start gap-3 rounded-[1.1rem] px-3 py-3 transition-all duration-150 ${
                          location.pathname === link.to
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background: location.pathname === link.to
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(16,185,129,0.08)",
                          }}
                        >
                          <link.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{link.label}</div>
                          <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{link.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/volunteer"
                className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  location.pathname === "/volunteer"
                    ? "bg-white text-primary shadow-sm ring-1 ring-primary/20"
                    : "text-slate-500 hover:bg-white/70 hover:text-foreground"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Volunteer
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 md:flex items-center gap-2 lg:gap-3">
            {userEmail ? (
              <div className="flex items-center gap-3">
                <div className="hidden flex-col items-end xl:flex">
                  <span className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">Signed in</span>
                  <span className="text-sm font-semibold text-foreground truncate max-w-[12rem]">{userEmail}</span>
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
                  variant="heroOutline" 
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
                  <Button variant="hero" size="default" className="rounded-full px-5 font-bold shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200">
                    <span className="lg:hidden">Get Support</span>
                    <span className="hidden lg:inline xl:hidden">Start Chat</span>
                    <span className="hidden xl:inline">Start a Conversation</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-foreground shadow-sm transition-colors hover:bg-slate-50 md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div 
          className="md:hidden border-t"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(16,185,129,0.12)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                location.pathname === "/"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-slate-50"
              }`}
            >
              Home
            </Link>

            <div className="pt-2 pb-1 px-4 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Explore
            </div>

            {exploreLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-slate-50"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 shrink-0">
                  <link.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{link.label}</div>
                  <div className="text-xs font-normal text-muted-foreground">{link.desc}</div>
                </div>
              </Link>
            ))}

            <div className="h-px bg-slate-100 my-2" />

            <Link
              to="/volunteer"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                location.pathname === "/volunteer"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-slate-50"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 shrink-0">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold">I Want to Volunteer</div>
                <div className="text-xs font-normal text-muted-foreground">
                  Support others as a trained peer listener
                </div>
              </div>
            </Link>

            <div className="pt-3 pb-2 space-y-2">
              <Link to="/chat" onClick={() => setMobileOpen(false)}>
                <Button variant="hero" className="h-12 w-full rounded-xl font-bold">
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
