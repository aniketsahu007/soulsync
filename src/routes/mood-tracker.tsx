// SoulSync Mood Journal - Detailed Tracking & Insights
import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MoodChart, moodValues, type ChartDataPoint, type MoodType } from "@/components/MoodChart";
import { MoodSelector } from "@/components/MoodSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  TrendingUp, 
  Plus, 
  MessageSquare, 
  Filter, 
  Clock, 
  ChevronRight,
  Loader2,
  Trash2,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { MobileMoodTrackerPage } from "@/components/mobile/MobilePublicPages";
import { ResponsivePage } from "@/components/responsive/ResponsivePage";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/mood-tracker")({
  component: MoodTrackerPage,
});

function MoodTrackerPage() {
  return (
    <ResponsivePage
      DesktopComponent={DesktopMoodTrackerPage}
      MobileComponent={MobileMoodTrackerPage}
    />
  );
}

function DesktopMoodTrackerPage() {
  const isMobile = useIsMobile();
  const { aliasId, isLoading: identityLoading } = useAnonymousIdentity();
  const [entries, setEntries] = useState<Tables<"mood_entries">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New entry state
  const [newMood, setNewMood] = useState<MoodType | undefined>();
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!aliasId) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("alias_id", aliasId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
    setIsLoading(false);
  }, [aliasId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddEntry = async () => {
    if (!newMood || !aliasId) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("mood_entries")
      .insert({
        alias_id: aliasId,
        mood: newMood,
        note: newNote.trim() || null
      });

    if (error) {
      toast.error("Failed to save entry.");
    } else {
      toast.success("Mood entry saved! ✨");
      setNewMood(undefined);
      setNewNote("");
      setIsAdding(false);
      fetchEntries();
    }
    setIsSubmitting(false);
  };

  const handleDeleteEntry = async (id: string) => {
    const { error } = await supabase
      .from("mood_entries")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete entry.");
    } else {
      toast.success("Entry deleted.");
      fetchEntries();
    }
  };

  const chartData = useMemo((): ChartDataPoint[] => {
    return [...entries]
      .reverse()
      .slice(-14) // Show last 14 entries
      .map(entry => ({
        date: format(new Date(entry.created_at), "MMM d"),
        value: moodValues[entry.mood as MoodType],
        moodLabel: entry.mood as MoodType,
        isAverage: false
      }));
  }, [entries]);

  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = { great: 0, good: 0, okay: 0, low: 0, struggling: 0 };
    entries.forEach(e => {
      if (counts[e.mood] !== undefined) counts[e.mood]++;
    });
    return counts;
  }, [entries]);

  const averageMoodValue = useMemo(() => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, curr) => acc + moodValues[curr.mood as MoodType], 0);
    return sum / entries.length;
  }, [entries]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'text-emerald-500 bg-emerald-50';
      case 'good': return 'text-primary bg-primary/10';
      case 'okay': return 'text-amber-500 bg-amber-50';
      case 'low': return 'text-rose-400 bg-rose-50';
      case 'struggling': return 'text-rose-600 bg-rose-100';
      default: return 'text-slate-400 bg-slate-50 dark:bg-slate-900';
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden pt-16 bg-slate-50/50 dark:bg-slate-900/50">
      <Navbar />
      
      <main className={`mx-auto ${isMobile ? "max-w-none px-3 py-6" : "max-w-6xl px-4 py-12 sm:px-6 lg:px-8"}`}>
        
        {/* Header Section */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${isMobile ? "mb-8" : "mb-12"}`}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className={`${isMobile ? "text-[2rem] leading-tight" : "text-4xl"} font-black tracking-tight text-slate-900 dark:text-slate-50`}>
              Mood <span className="text-gradient">Journal</span>
            </h1>
            <p className={`mt-2 text-slate-500 dark:text-slate-400 font-medium ${isMobile ? "max-w-none text-sm leading-6" : "max-w-md"}`}>
              Reflect on your emotional patterns and discover the factors that influence your wellbeing.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Button 
              onClick={() => setIsAdding(!isAdding)}
              className={`${isMobile ? "h-12 w-full rounded-2xl justify-center" : "h-14 rounded-full px-8"} font-black gap-3 shadow-xl dark:shadow-none shadow-primary/20 hover:scale-105 active:scale-95 transition-all`}
            >
              {isAdding ? <Plus className="h-5 w-5 rotate-45 transition-transform" /> : <Plus className="h-5 w-5" />}
              {isAdding ? "Cancel Entry" : "Add New Entry"}
            </Button>
          </motion.div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <Card className={`${isMobile ? "p-5 rounded-[1.5rem]" : "p-8 rounded-[3rem]"} border-white bg-white dark:bg-slate-950 shadow-2xl dark:shadow-none shadow-primary/5 ring-1 ring-slate-200/50`}>
                <h3 className={`${isMobile ? "mb-6 text-lg" : "mb-8 text-xl"} text-slate-800 dark:text-slate-200 text-center font-black`}>How are you feeling right now?</h3>
                
                <div className={`mx-auto ${isMobile ? "max-w-none space-y-6" : "max-w-2xl space-y-10"}`}>
                  <MoodSelector selected={newMood} onSelect={setNewMood} />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                      <MessageSquare className="h-4 w-4" />
                      Add a Reflection (Optional)
                    </div>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="What's contributing to your mood today? Any specific events or thoughts?"
                      className="w-full rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 text-sm font-medium focus:outline-none focus:border-primary/30 min-h-[120px] resize-none transition-all"
                    />
                  </div>

                  <div className="flex justify-center">
                      <Button 
                      onClick={handleAddEntry}
                      disabled={!newMood || isSubmitting}
                      className={`${isMobile ? "h-12 w-full rounded-2xl text-base" : "h-14 rounded-full px-12 text-lg"} font-black gap-3`}
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5" />}
                      Save to Journal
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`grid grid-cols-1 ${isMobile ? "gap-5" : "gap-8"} lg:grid-cols-3`}>
          
          {/* Stats & Trends Column */}
          <div className={`space-y-5 lg:col-span-1 ${isMobile ? "order-2" : ""}`}>
            <Card className={`${isMobile ? "p-4 rounded-[1.35rem]" : "p-6 rounded-[2.5rem]"} border-white bg-white dark:bg-slate-950 shadow-sm dark:shadow-none ring-1 ring-slate-200/50`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Insights
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Average Mood</p>
                    <p className="text-xl font-black text-slate-800 dark:text-slate-200">
                      {averageMoodValue >= 80 ? "Radiant" : averageMoodValue >= 60 ? "Steady" : averageMoodValue >= 40 ? "Balanced" : "Challenging"}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black ${averageMoodValue >= 60 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {Math.round(averageMoodValue)}%
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Distribution</p>
                  {Object.entries(moodCounts).map(([mood, count]) => (
                    <div key={mood} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                        <span className="text-slate-500 dark:text-slate-400">{mood}</span>
                        <span className="text-slate-900 dark:text-slate-50">{count} entries</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: entries.length > 0 ? `${(count / entries.length) * 100}%` : 0 }}
                          className={`h-full ${getMoodColor(mood).split(' ')[0].replace('text', 'bg')}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className={`${isMobile ? "p-4 rounded-[1.35rem]" : "p-6 rounded-[2.5rem]"} border-white bg-slate-900 shadow-xl dark:shadow-none overflow-hidden relative group`}>
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-32 w-32 text-white" />
               </div>
               <div className="relative z-10">
                 <h3 className="font-black text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trend Analysis
                 </h3>
                 <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    We've noticed you tend to feel more "Struggling" on Mondays. Consider scheduling a peer session on Sunday evenings.
                 </p>
                 <Button variant="outline" className={`w-full border-slate-700 text-white hover:bg-slate-800 text-xs font-bold ${isMobile ? "h-11 rounded-2xl" : "h-10 rounded-xl"}`}>
                    View Full Analysis
                 </Button>
                </div>
            </Card>
          </div>

          {/* History Column */}
          <div className={`space-y-5 lg:col-span-2 ${isMobile ? "order-1" : ""}`}>
            <Card className={`${isMobile ? "p-4 rounded-[1.5rem]" : "p-8 rounded-[3rem]"} border-white bg-white dark:bg-slate-950 shadow-sm dark:shadow-none ring-1 ring-slate-200/50`}>
              <div className={`flex items-center justify-between ${isMobile ? "mb-5" : "mb-8"}`}>
                <h3 className="font-black text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Your Journey
                </h3>
                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Filter className="h-4 w-4 text-slate-400" /></Button>
                </div>
              </div>

              <div className={`${isMobile ? "mb-6 h-[220px]" : "mb-12 h-[250px]"} w-full`}>
                 {isLoading || identityLoading ? (
                   <div className="h-full flex items-center justify-center opacity-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
                 ) : entries.length > 0 ? (
                   <MoodChart data={chartData} />
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300">
                      <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-sm font-bold">No data points yet</p>
                   </div>
                 )}
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2">History</h4>
                 {isLoading || identityLoading ? (
                   <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-20 w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl" />)}
                   </div>
                 ) : entries.length > 0 ? (
                    <div className="space-y-3">
                        {entries.map((entry) => (
                          <motion.div 
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group relative flex items-start gap-4 border border-transparent bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300 hover:bg-white dark:bg-slate-950 hover:border-slate-100 dark:border-slate-800 hover:shadow-xl dark:shadow-none hover:shadow-slate-200/50 ${isMobile ? "rounded-[1.25rem] p-4" : "rounded-3xl p-5"}`}
                          >
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm dark:shadow-none ${getMoodColor(entry.mood)}`}>
                               <span className="text-xl">
                                  {entry.mood === 'great' ? '🌟' : entry.mood === 'good' ? '😊' : entry.mood === 'okay' ? '😐' : entry.mood === 'low' ? '😔' : '😫'}
                               </span>
                            </div>
                            <div className="flex-1 pt-1">
                                <div className={`mb-1 flex ${isMobile ? "flex-col items-start gap-1" : "items-center justify-between"}`}>
                                  <span className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize">{entry.mood}</span>
                                   <div className={`flex ${isMobile ? "w-full items-center justify-between gap-2" : "items-center gap-3"}`}>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(entry.created_at), "MMM d, p")}
                                     </span>
                                     <button 
                                       onClick={() => handleDeleteEntry(entry.id)}
                                        className={`${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"} text-slate-300 hover:text-rose-500 transition-all`}
                                     >
                                        <Trash2 className="h-4 w-4" />
                                     </button>
                                  </div>
                               </div>
                               {entry.note && (
                                 <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-2 bg-white/50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-50 dark:border-slate-800 italic">
                                   "{entry.note}"
                                 </p>
                               )}
                            </div>
                         </motion.div>
                       ))}
                    </div>
                 ) : (
                   <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-400 italic">Your emotional map will appear here.</p>
                   </div>
                 )}
              </div>
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MoodTrackerPage;

