import { Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Heart, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IdentityRecoveryButton } from "@/components/IdentityRecoveryButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeroSection() {
  return (
    <section 
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-slate-950 px-4 pt-24 pb-20 sm:px-6 lg:px-12 lg:pt-32 lg:pb-32"
      style={{
        backgroundImage: "url('/hero-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
      }}
    >
      {/* Directional Scrim for contrast: Solid dark on left, fading to right */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-0" />
      <div className="absolute inset-0 bg-black/40 lg:hidden z-0" /> {/* Extra darkening on mobile */}

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start text-left">
        
        {/* Headline */}
        <h1 
          className="max-w-3xl text-[3rem] font-bold leading-[1.05] tracking-tight text-white drop-shadow-2xl sm:text-6xl lg:text-[5.5rem]"
          style={{ fontFamily: 'var(--font-serif, "Plus Jakarta Sans")' }}
        >
          A student-led<br />
          healing movement
        </h1>
        
        {/* Subhead */}
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 drop-shadow-lg font-medium sm:text-2xl">
          The softer first step to feeling better. No logins, no tracking, just immediate and anonymous support.
        </p>
        
        {/* CTAs - Grouped together to save vertical space */}
        <div className="mt-10 flex w-full max-w-3xl flex-col items-start justify-start gap-4 sm:flex-row sm:items-center sm:flex-wrap">
          <Link to="/chat" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 px-8 text-base bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-900/50">
              Start Talking
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link to="/check-in" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full h-14 px-8 text-base border-2 border-white/40 text-white hover:bg-white/10 rounded-full bg-transparent shadow-lg backdrop-blur-sm">
              Check In With Myself
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust Badges - Moved to the right side on Desktop, horizontal scroll on Mobile */}
      <div className="absolute bottom-6 right-0 left-0 lg:left-auto lg:top-1/2 lg:bottom-auto lg:right-8 lg:-translate-y-1/2 z-20 flex w-full lg:w-auto overflow-x-auto lg:overflow-visible px-4 lg:px-0 pb-4 lg:pb-0 gap-3 lg:flex-col lg:items-end snap-x snap-mandatory hide-scrollbar">
        <div className="flex shrink-0 snap-start items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg lg:hover:scale-105 transition-transform">
          <span className="text-sm font-semibold text-white drop-shadow-sm">100% Anonymous</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Shield className="h-4 w-4" />
          </div>
        </div>
        <div className="flex shrink-0 snap-start items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg lg:hover:scale-105 transition-transform lg:-translate-x-4">
          <span className="text-sm font-semibold text-white drop-shadow-sm">AI Guided</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Heart className="h-4 w-4" />
          </div>
        </div>
        <div className="flex shrink-0 snap-start items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg lg:hover:scale-105 transition-transform lg:-translate-x-8">
          <span className="text-sm font-semibold text-white drop-shadow-sm">Peer Matched</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Users className="h-4 w-4" />
          </div>
        </div>
      </div>
      
      {/* Theme Toggle - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:block">
        <ThemeToggle scrolled={false} />
      </div>
    </section>
  );
}

