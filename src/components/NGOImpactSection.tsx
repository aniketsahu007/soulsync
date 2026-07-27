import { motion } from "framer-motion";
import { INDIAN_NGO_PARTNERS } from "@/constants/partners";

export function NGOImpactSection() {
  const partners = INDIAN_NGO_PARTNERS;

  const stats = [
    { label: "Students Supported", value: "100+" },
    { label: "Active Peer Supporters", value: "40+" },
    { label: "NGO Partners", value: "4" },
    { label: "SDG Impact Goals", value: "3 & 17" },
  ];

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6">Social Impact Architecture</h2>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-white">
            Trusted by Leading <span className="text-primary/90">Impact Partners</span>
          </h1>
        </div>

        {/* Logo Marquee - Glass Style */}
        <div className="flex flex-wrap justify-center items-center gap-16 mb-24 opacity-50 hover:opacity-100 transition-all duration-700">
          {partners.map((p) => (
            <div key={p.name} className="group cursor-default">
              <span className="text-2xl font-display font-bold text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors duration-300">
                {p.name}
              </span>
            </div>
          ))}
        </div>

        {/* Stats Grid - Premium Aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="group relative p-10 rounded-[2.5rem] bg-white/5 dark:bg-slate-950/5 border border-white/10 shadow-2xl dark:shadow-none overflow-hidden transition-all hover:bg-white/10 dark:bg-slate-950/10 hover:-translate-y-2 backdrop-blur-sm"
            >
              <div className="relative z-10">
                <p className="text-4xl font-display font-semibold text-white mb-3 group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
              
              {/* Animated Glow */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
    </section>
  );
}

