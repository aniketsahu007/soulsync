import { motion } from "framer-motion";
import { Shield, Lock, EyeOff, UserCheck, Search, MessageCircle, Heart, Sparkles } from "lucide-react";

export function SafetyGovernance() {
  const steps = [
    {
      icon: EyeOff,
      title: "Absolute Anonymity",
      desc: "No email or login required for students. Your alias is stored strictly on your device.",
    },
    {
      icon: UserCheck,
      title: "Manual Verification",
      desc: "Every peer supporter's credentials and identity are manually vetted by our governance team.",
    },
    {
      icon: Search,
      title: "AI Safety Filter",
      desc: "Real-time content moderation via Google's AI models to ensure a toxicity-free ecosystem.",
    },
    {
      icon: Heart,
      title: "Impact First",
      desc: "Supporting SDG 3 (Mental Wellness) through data-driven session outcomes and recovery tracking.",
    },
  ];

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden border-t border-white/5">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 dark:bg-slate-950/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300 mb-6 border border-white/10 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Governance Standard
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-white mb-6">
            Safety Is Our Top Priority
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Our multi-layered security architecture ensures that SoulSync remains a safe, anonymous, and trusted space for every student.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative bg-white/5 dark:bg-slate-950/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 dark:bg-slate-950/10 hover:-translate-y-2 overflow-hidden"
            >
              {/* Subtle hover glow inside card */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="h-14 w-14 rounded-2xl bg-white/10 dark:bg-slate-950/10 flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500 shadow-inner ring-1 ring-white/20 relative z-10">
                <step.icon className="h-6 w-6 text-white transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-3 relative z-10">
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                {step.desc}
              </p>
              
              <div className="absolute top-8 right-8 text-[10px] font-black uppercase text-white/10 tracking-widest transition-opacity">
                #0{i+1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Governance Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-24 flex flex-col items-center"
        >
           <div className="px-8 py-5 rounded-full bg-black border border-white/10 flex flex-wrap justify-center items-center gap-6 shadow-2xl dark:shadow-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="flex -space-x-3 relative z-10">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center overflow-hidden">
                       <UserCheck className="h-4 w-4 text-slate-400" />
                    </div>
                 ))}
              </div>
              <div className="hidden sm:block h-10 w-px bg-white/10 dark:bg-slate-950/10 relative z-10" />
              <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1">Compliance Status</p>
                 <p className="text-[11px] font-medium text-slate-300 uppercase tracking-widest">ISO/IEC 27001 Resilience Standard</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center relative z-10">
                 <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
}

