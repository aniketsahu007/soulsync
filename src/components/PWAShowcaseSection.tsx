import { motion } from "framer-motion";
import { Download, Zap, Shield, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export function PWAShowcaseSection() {
  const { install, canInstall, isInstalled, isSecure } = usePWAInstall();

  return (
    <section className="relative px-4 py-32 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none opacity-40 -translate-x-1/3 translate-y-1/3" />

      <div className="mx-auto max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-8"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary mb-4">
                Always With You
              </p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight text-white">
                Your safe space.<br />One tap away.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-400 max-w-lg">
                Support shouldn't begin with opening a browser and typing a URL. Install SoulSync in seconds directly to your home screen for instant, native-like access when you need it most.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 dark:bg-slate-950/10 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Opens Instantly</h4>
                  <p className="mt-1 text-sm text-slate-400">Zero loading screens. Just immediate support.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 dark:bg-slate-950/10 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Private & Secure</h4>
                  <p className="mt-1 text-sm text-slate-400">No app store tracking. Totally anonymous.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 dark:bg-slate-950/10 text-white">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Native Experience</h4>
                  <p className="mt-1 text-sm text-slate-400">Feels exactly like a real iOS or Android app.</p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              {!isInstalled && isSecure && (
                <button
                  onClick={install}
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white dark:bg-slate-950 px-8 py-4 font-semibold text-slate-900 dark:text-slate-50 transition-all hover:scale-105 hover:bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <Download className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
                    {canInstall ? "Install SoulSync App" : "Install SoulSync"}
                  </span>
                </button>
              )}
              {isInstalled && (
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 dark:bg-slate-950/10 px-8 py-4 font-semibold text-white border border-white/20">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  App Installed & Ready
                </div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-sm lg:max-w-md"
          >
            {/* Ambient glow behind phone */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-90" />
            
            {/* Phone Mockup Frame */}
            <div className="relative z-10 rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px] border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-2xl dark:shadow-none overflow-hidden aspect-[9/16]">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-0 inset-x-0 h-5 sm:h-7 flex justify-center z-20">
                <div className="w-1/3 h-full bg-slate-800 rounded-b-xl sm:rounded-b-2xl" />
              </div>
              
              <img 
                src="/pwa.jpg" 
                alt="SoulSync App Interface" 
                className="w-full h-full object-cover object-top opacity-95 transition-opacity hover:opacity-100"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
