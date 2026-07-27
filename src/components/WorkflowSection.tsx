import { motion } from "framer-motion";
import { MessageCircleHeart, Brain, UserCheck, Activity } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Arrive exactly as you are",
    desc: "No account walls, no pressure, and no demand to explain everything perfectly. A simple check-in is enough. We start with how you feel right now.",
    note: "Start with a mood signal",
  },
  {
    step: "02",
    title: "Guidance that slows the moment down",
    desc: "The conversation reflects what you are feeling and gently helps you name what is heavy without making the experience feel clinical.",
    note: "Grounding prompts & reflection",
  },
  {
    step: "03",
    title: "Connect with someone who gets it",
    desc: "When you're ready, we connect you with a trained student peer. No waiting lists, no clinical intake. Just real human support.",
    note: "Peer support & matching",
  },
  {
    step: "04",
    title: "Stay supported, seamlessly",
    desc: "Mood trends, follow-up care, and safety signals keep the platform useful after the immediate emotional moment has passed.",
    note: "Ongoing awareness",
  },
];

function StepMockup({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
          <p className="text-center text-sm font-semibold text-slate-500 mb-6">How are you feeling?</p>
          <div className="flex justify-between px-4">
            {['😭', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
              <div key={i} className={`text-3xl transition-transform ${i === 1 ? 'scale-125 opacity-100' : 'opacity-40 grayscale'}`}>
                {emoji}
              </div>
            ))}
          </div>
          <div className="mt-8 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-1/3 bg-orange-400 rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="flex flex-col w-full max-w-sm space-y-4 p-8">
        <div className="self-end rounded-2xl rounded-tr-sm bg-primary p-4 text-white shadow-md max-w-[85%]">
          <p className="text-sm">I just feel so overwhelmed with midterms. I can't focus.</p>
        </div>
        <div className="self-start rounded-2xl rounded-tl-sm bg-white p-4 shadow-xl border border-slate-100 max-w-[85%]">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">SoulSync AI</span>
          </div>
          <p className="text-sm text-slate-700">It's completely normal to feel overwhelmed right now. Let's take a deep breath together. What's one small thing you can tackle today?</p>
        </div>
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="flex -space-x-4">
          <div className="h-16 w-16 rounded-full border-4 border-slate-50 bg-indigo-100 flex items-center justify-center shadow-md">
            <UserCheck className="h-6 w-6 text-indigo-500" />
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-slate-50 bg-emerald-100 flex items-center justify-center shadow-md z-10">
            <MessageCircleHeart className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-xl border border-slate-100 text-center w-full max-w-xs mt-4">
          <p className="text-sm font-bold text-slate-800">Peer Matched!</p>
          <p className="text-xs text-slate-500 mt-1">Sarah (Trained Listener) is joining the chat.</p>
          <div className="mt-4 flex gap-2 justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-75" />
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-sm">
      <div className="w-full rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-bold text-slate-700">Mood Trend</span>
          </div>
          <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
        </div>
        <div className="flex items-end justify-between h-24 gap-2">
          {[40, 30, 45, 60, 50, 75, 85].map((h, i) => (
            <div key={i} className="w-full bg-emerald-100 rounded-t-sm" style={{ height: `${h}%` }}>
              {i === 6 && <div className="w-full h-full bg-emerald-500 rounded-t-sm" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
          <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
}

export function WorkflowSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary/80">
            The Journey
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl text-foreground">
            A softer first step to feeling better.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            We don't ask you to fill out forms when you're overwhelmed. 
            We guide you gently from the moment you arrive to long-term resilience.
          </p>
        </div>

        <div className="space-y-24 md:space-y-32">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`flex flex-col md:flex-row items-center gap-12 lg:gap-24 ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                    {step.step}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-primary/70">
                    Phase {index + 1}
                  </div>
                </div>
                <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground">{step.desc}</p>
                <div className="inline-flex rounded-full bg-slate-50 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200 shadow-sm">
                  {step.note}
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <div className="aspect-square sm:aspect-[4/3] rounded-[2.5rem] bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 overflow-hidden relative flex items-center justify-center group">
                  {/* Subtle decorative background blur */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl" />
                  
                  <div className="relative z-10 w-full flex justify-center transform group-hover:scale-[1.02] transition-transform duration-700 ease-out">
                    <StepMockup index={index} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

