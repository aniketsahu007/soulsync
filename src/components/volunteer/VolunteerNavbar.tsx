import { Link, useLocation } from "@tanstack/react-router";
import { 
  Heart, 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  LogOut,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function VolunteerNavbar() {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/volunteer";
  };

  const navLinks = [
    { to: "/volunteer/dashboard", search: { tab: "overview" }, label: "Hub", icon: LayoutDashboard },
    { to: "/volunteer/dashboard", search: { tab: "sessions" }, label: "Sessions", icon: MessageSquare },
    { to: "/volunteer/dashboard", search: { tab: "slots" }, label: "Schedule", icon: Calendar },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-7xl">
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] px-6 py-3 flex items-center justify-between shadow-xl dark:shadow-none shadow-slate-100/50">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg dark:shadow-none shadow-primary/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">Volunteer Hub</span>
              <span className="block text-[10px] font-bold text-primary uppercase tracking-[0.1em]">SoulSync Support</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label + link.to}
                to={link.to}
                search={link.search as any}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  location.pathname === link.to && 
                  (!link.search || (location.search as any).tab === link.search.tab)
                    ? "bg-primary text-white shadow-lg dark:shadow-none"
                    : "text-slate-400 hover:text-primary hover:bg-slate-50 dark:bg-slate-900"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <Award className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Verified Peer</span>
             </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

