import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  MessageCircleHeart,
  Shield,
  Sparkles,
  TrendingUp,
  UserCheck,
} from "lucide-react";

export function FeaturesSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-[#f6faf9] overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 max-w-3xl"
        >
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary">
            Built For Emotional Connection
          </p>
          <h2 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl text-foreground">
            More warmth in the way support is delivered.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
            The goal is not to make mental health support look futuristic. It is to make it feel softer, safer, and easier to trust when someone is already carrying a lot.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-12"
        >
          {/* Card 1: A calmer first reply */}
          <motion.div variants={itemVariants} className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-white p-8 sm:p-12 border border-slate-100 shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircleHeart className="h-6 w-6" />
              </div>
              <h3 className="font-display text-3xl font-semibold text-slate-900 mb-4">A calmer first reply</h3>
              <p className="text-lg leading-relaxed text-slate-500 max-w-lg mb-8">SoulSync responds like a supportive companion, helping users untangle what they feel before asking them to make decisions.</p>
              <div className="inline-flex rounded-full bg-slate-50 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 border border-slate-200">
                Warm language, reflective prompts
              </div>
            </div>
          </motion.div>

          {/* Card 2: Gentle nudges */}
          <motion.div variants={itemVariants} className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 sm:p-12 border border-slate-800 shadow-2xl transition-transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-white mb-4">Gentle nudges, not pressure</h3>
              <p className="text-base leading-relaxed text-slate-400 mb-auto">The experience notices emotional strain and offers one grounded step at a time.</p>
              <div className="mt-8 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/80 border border-white/10">
                Micro-actions
              </div>
            </div>
          </motion.div>

          {/* Card 3: Safety (Dark/Red theme) */}
          <motion.div variants={itemVariants} className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-red-50 p-8 sm:p-12 border border-red-100 shadow-xl shadow-red-100/50 transition-transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-red-950 mb-4">Safety that stays close</h3>
              <p className="text-base leading-relaxed text-red-900/70 mb-8">When a conversation turns serious, SoulSync escalates with care, surfacing urgent resources.</p>
              <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 border border-red-200">
                Protection built-in
              </div>
            </div>
          </motion.div>

          {/* Card 4: Patterns */}
          <motion.div variants={itemVariants} className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-white p-8 sm:p-12 border border-slate-100 shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center h-full">
              <div>
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-display text-3xl font-semibold text-slate-900 mb-4">Understand yourself</h3>
                <p className="text-lg leading-relaxed text-slate-500">Mood-aware prompts and trend signals help users notice what keeps showing up, without turning emotions into cold data.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-inner">
                 <div className="space-y-4">
                   <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full w-[70%] bg-blue-500 rounded-full"></div></div>
                   <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full w-[45%] bg-indigo-500 rounded-full"></div></div>
                   <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-emerald-500 rounded-full"></div></div>
                 </div>
                 <p className="text-center text-xs font-bold text-slate-400 mt-6 uppercase tracking-widest">Personal Reflection</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Row - Glassmorphism & Solid */}
          <motion.div variants={itemVariants} className="md:col-span-6 group relative overflow-hidden rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-12 border border-white shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-slate-900 mb-4">Human support when ready</h3>
            <p className="text-base leading-relaxed text-slate-500 mb-8">AI can open the door, but peer listeners bring the warmth of being heard by another person who shows up with empathy.</p>
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 border border-slate-100 shadow-sm">
              Thoughtful matching
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-6 group relative overflow-hidden rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-12 border border-white shadow-xl shadow-slate-200/40 transition-transform hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-slate-900 mb-4">Private enough to be honest</h3>
            <p className="text-base leading-relaxed text-slate-500 mb-8">Anonymous by default, so people can say the hard thing without fear of being exposed or judged.</p>
            <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 border border-slate-100 shadow-sm">
              Trust as a feature
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

