import { Link } from "@tanstack/react-router";
import { ArrowRight, Shield, Heart, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IdentityRecoveryButton } from "@/components/IdentityRecoveryButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeroSection() {
  return (
    <section 
      className="px-4 pt-32 pb-56 sm:px-6 lg:px-8 lg:pt-40 lg:pb-72 relative overflow-hidden flex flex-col justify-center min-h-[85vh]"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="mx-auto max-w-4xl text-center relative z-10">
        {/* Consolidated Trust Signal Row */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white drop-shadow-md">
          <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400" /> 100% Anonymous</span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-emerald-400" /> AI Guided</span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-400" /> Peer Matched</span>
        </div>

        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl text-white drop-shadow-xl shadow-black">
          A student-led healing movement
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/95 drop-shadow-md font-medium">
          The softer first step to feeling better. No logins, no tracking, just immediate and anonymous support.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/chat">
            <Button size="lg" className="w-full sm:w-auto">
              Start Talking
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/check-in">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Check In With Myself
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex justify-center">
          <IdentityRecoveryButton forceView="recover" />
        </div>
      </div>
      
      {/* Theme Toggle - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-20">
        <ThemeToggle scrolled={false} />
      </div>
    </section>
  );
}

