import { motion } from "framer-motion";
import { INDIAN_NGO_PARTNERS } from "@/constants/partners";
import { Button } from "@/components/ui/button";
import { DonationModal } from "./DonationModal";
import { useState } from "react";
import { Heart, Users, HandHeart, Target, Sparkles } from "lucide-react";

export function NGOImpactSection() {
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState<{ name: string; id: string } | null>(null);
  
  const partners = INDIAN_NGO_PARTNERS;

  const stats = [
    { label: "Students Supported", value: "100+", icon: Users },
    { label: "Active Peer Supporters", value: "40+", icon: HandHeart },
    { label: "NGO Partners", value: "4", icon: Heart },
    { label: "SDG Impact Goals", value: "3 & 17", icon: Target },
  ];

  const handleDonateClick = (ngoName?: string, ngoId?: string) => {
    if (ngoName && ngoId) {
      setSelectedNgo({ name: ngoName, id: ngoId });
    } else {
      setSelectedNgo({ name: "SoulSync", id: "soulsync" });
    }
    setIsDonationOpen(true);
  };

  return (
    <>
      <section className="py-32 bg-slate-950 relative overflow-hidden border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6">
                Social Impact Architecture
              </h2>
              <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight text-white">
                Trusted by Leading <span className="text-primary/90">Impact Partners</span>
              </h1>
              <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
                Join us in making mental health support accessible to every student in India.
                Your contribution directly impacts lives.
              </p>
            </motion.div>
          </div>

          {/* Logo Marquee - Glass Style */}
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 mb-24 opacity-50 hover:opacity-100 transition-all duration-700">
            {partners.map((p, index) => (
              <motion.div 
                key={p.name} 
                className="group cursor-default flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                viewport={{ once: true }}
              >
                <span className="text-2xl font-display font-bold text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors duration-300">
                  {p.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] text-slate-600 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  onClick={() => handleDonateClick(p.name, `ngo_${index}`)}
                >
                  <Heart className="h-3 w-3 mr-1" /> Support
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Stats Grid - Premium Aesthetic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="group relative p-10 rounded-[2.5rem] bg-white/5 dark:bg-slate-950/5 border border-white/10 shadow-2xl dark:shadow-none overflow-hidden transition-all hover:bg-white/10 dark:hover:bg-slate-950/10 hover:-translate-y-2 backdrop-blur-sm"
                >
                  <div className="relative z-10">
                    <div className="mb-4">
                      <Icon className="h-8 w-8 text-primary/60 group-hover:text-primary transition-colors duration-300" />
                    </div>
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
              );
            })}
          </div>

          {/* Call to Action - Donate Now */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="inline-flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Every contribution counts</span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <Button
                variant="hero"
                size="lg"
                className="px-12 h-16 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                onClick={() => handleDonateClick()}
              >
                <Heart className="h-5 w-5 mr-2" />
                Donate to Support Mental Health
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                🔒 100% secure • Tax benefits under 80G
              </p>
            </div>
          </motion.div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      </section>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => {
          setIsDonationOpen(false);
          setSelectedNgo(null);
        }}
        ngoName={selectedNgo?.name}
        ngoId={selectedNgo?.id}
      />
    </>
  );
}