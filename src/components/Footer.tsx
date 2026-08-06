import { Link } from "@tanstack/react-router";
import { HeartHandshake, Mail, ChevronRight } from "lucide-react";

const footerLinks = {
  "Get Help": [
    { to: "/chat" as const, label: "Talk to Someone" },
    { to: "/peer-match" as const, label: "Peer Support" },
    { to: "/resources" as const, label: "Resources" },
    { to: "/check-in" as const, label: "Daily Check-in" },
  ],
  Platform: [
    { to: "/community-qna" as const, label: "Community Q&A" },
    { to: "/admin" as const, label: "Admin Portal" },
    { to: "/volunteer" as const, label: "Volunteer Portal" },
    { to: "/mood-tracker" as const, label: "Mood Tracker" },
  ],
  Company: [
    { to: "/" as const, label: "About SoulSync" },
    { to: "/partners" as const, label: "Social Impact" },
    { to: "/privacy-policy" as const, label: "Privacy Policy" },
    { to: "/terms-of-service" as const, label: "Terms of Service" },
  ],
};

const supportEmail = "Soulsyncsoul@gmail.com";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-12 lg:grid-cols-5 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <HeartHandshake className="h-6 w-6 text-primary" />
              </div>
              <span className="font-display text-2xl font-semibold tracking-tight">SoulSync</span>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-7 text-muted-foreground font-medium">
              A student-led movement for emotional resilience and anonymous peer support.
            </p>
            {/* Support Email */}
            <a
              href={`mailto:${supportEmail}`}
              className="mt-6 inline-flex items-center gap-2 group"
              aria-label="Email SoulSync support"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                {supportEmail}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors" />
            </a>
          </div>

          {/* Dynamic Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                {title}
              </h3>
              <ul className="mt-6 space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm font-semibold text-slate-600 dark:text-slate-400 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-slate-50 dark:border-slate-800 pt-10 sm:flex-row">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} SoulSync
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-slate-200 dark:text-slate-700">·</span>
            <Link to="/terms-of-service" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-safe animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secure & Anonymous Connection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

