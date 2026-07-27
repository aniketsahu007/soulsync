import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="relative px-4 py-32 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">
      {/* Immersive glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay pointer-events-none" />

      <div className="mx-auto max-w-4xl relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground border border-white/20 mb-8 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <span className="text-white">Take the First Step</span>
          </div>

          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-tight mb-8 drop-shadow-lg">
            "I don't have to go through this alone."
          </h2>

          <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-slate-300 leading-relaxed font-medium mb-12">
            No forms. No waiting rooms. No pressure. <br className="hidden sm:block" />
            Just a safe space to breathe and someone who gets it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/chat">
              <button className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-white px-8 py-5 font-bold text-slate-900 transition-all hover:scale-105 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-950 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] w-full sm:w-auto text-lg">
                <span className="relative z-10 flex items-center gap-2">
                  Start a Conversation
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
            </Link>
            <Link to="/resources">
              <button className="inline-flex items-center justify-center gap-3 rounded-full bg-white/10 border border-white/20 px-8 py-5 font-bold text-white transition-all hover:bg-white/20 hover:scale-105 w-full sm:w-auto text-lg backdrop-blur-md">
                Explore Resources
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

