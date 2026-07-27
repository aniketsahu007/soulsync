import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityStories } from "./CommunityStories";
import { PathfinderSurvey } from "./PathfinderSurvey";
import { PlayCircle, Compass, Sparkles } from "lucide-react";

export function EngagementHub() {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 overflow-hidden bg-slate-950 text-slate-50">
      {/* Decorative gradient for the hub area */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/20 rounded-full blur-[150px] pointer-events-none opacity-60" />
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-primary">
            Explore the Platform
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl text-white drop-shadow-sm">
            Experience SoulSync
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            Listen to real experiences or take a brief survey to find the support path that fits you best right now.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col items-center mb-16">
            <TabsList className="h-auto p-2 bg-white/5 rounded-[2rem] shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
              <TabsTrigger 
                value="stories" 
                className="px-8 py-3 rounded-[1.5rem] text-sm font-bold transition-all text-slate-400 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white"
              >
                <PlayCircle className="mr-2 h-4 w-4" /> 
                See the Impact
              </TabsTrigger>
              <TabsTrigger 
                value="survey" 
                className="px-8 py-3 rounded-[1.5rem] text-sm font-bold transition-all text-slate-400 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg hover:text-white"
              >
                <Compass className="mr-2 h-4 w-4" />
                Find Your Path
              </TabsTrigger>
            </TabsList>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={activeTab}
              className="mt-6 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em]"
            >
              <Sparkles className="h-3 w-3" />
              {activeTab === "stories" ? "Watch Student Experiences" : "Get a Personalized Suggestion"}
            </motion.div>
          </div>

          <div className="relative rounded-[2.5rem] bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 p-4 sm:p-8 md:p-12 shadow-2xl overflow-hidden">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <AnimatePresence mode="wait">
              <TabsContent value="stories" key="stories" className="focus-visible:ring-0 mt-0 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <CommunityStories />
                </motion.div>
              </TabsContent>

              <TabsContent value="survey" key="survey" className="focus-visible:ring-0 mt-0 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <PathfinderSurvey />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </section>
  );
}

