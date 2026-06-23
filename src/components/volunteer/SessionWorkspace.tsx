import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  X, Info, MessageSquare, Zap, CheckCircle, RefreshCw,
  TrendingUp, Activity, User, Video, FileText, History,
  Sparkles, Smile, Clock, Heart, AlertTriangle, ArrowRight, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodChart, moodValues } from "@/components/MoodChart";
import { parseMemoryContext } from "@/utils/schedule.functions";

interface SessionWorkspaceProps {
  selectedSession: any;
  onClose: () => void;
  crmNotes: any[];
  newNote: string;
  setNewNote: (note: string) => void;
  notesLoading: boolean;
  onSaveNote: () => void;
  onAIGenerate: () => void;
  moodHistory: any[];
  pastNotes?: any[];
}

export const SessionWorkspace = memo(({ 
  selectedSession, 
  onClose, 
  crmNotes, 
  newNote, 
  setNewNote, 
  notesLoading,
  onSaveNote,
  onAIGenerate,
  moodHistory,
  pastNotes = []
}: SessionWorkspaceProps) => {
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    if (crmNotes && crmNotes.length > 0) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [crmNotes]);

  if (!selectedSession) return null;

  const memoryData = parseMemoryContext(selectedSession?.student_profiles?.memory_context);
  const saState = memoryData.scheduleArchitect;
  
  // 1. Consistency Index
  const habits = saState?.habits || [];
  const consistencyIndex = habits.length > 0 
    ? Math.round(habits.reduce((acc, h) => acc + h.successRate, 0) / habits.length) 
    : 0;
    
  // 2. Focus Trend
  const activities = saState?.activities || [];
  const focusActivities = activities.filter(a => a.description.startsWith("Deep Focus:") || a.category === "Growth");
  const focusXP = saState?.xp?.focus || 0;
  
  let focusTrend = "Stable";
  if (focusXP > 120 || focusActivities.length >= 3) {
    focusTrend = "Increasing (Strong)";
  } else if (focusXP === 0 && focusActivities.length === 0) {
    focusTrend = "No Data Yet";
  } else if (focusXP < 40) {
    focusTrend = "Declining / Low";
  }

  // 3. Mood Trend
  let moodTrend = "Stable";
  if (moodHistory && moodHistory.length >= 2) {
    const sortedMoods = [...moodHistory].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const lastMoodObj = sortedMoods[sortedMoods.length - 1];
    const prevMoodObj = sortedMoods[sortedMoods.length - 2];
    const lastMoodKey = (lastMoodObj.mood || "").toLowerCase() as keyof typeof moodValues;
    const prevMoodKey = (prevMoodObj.mood || "").toLowerCase() as keyof typeof moodValues;
    const lastVal = moodValues[lastMoodKey] || 3;
    const prevVal = moodValues[prevMoodKey] || 3;
    if (lastVal > prevVal) {
      moodTrend = `Improving (${lastMoodObj.mood})`;
    } else if (lastVal < prevVal) {
      moodTrend = `Declining (${lastMoodObj.mood})`;
    } else {
      moodTrend = `Consistent (${lastMoodObj.mood})`;
    }
  } else if (moodHistory && moodHistory.length === 1) {
    moodTrend = `Stable (${moodHistory[0].mood})`;
  } else {
    moodTrend = "No logs yet";
  }

  // 4. Most Avoided Task
  const avoidedHabit = habits.length > 0 
    ? habits.reduce((min, h) => h.successRate < min.successRate ? h : min, habits[0]) 
    : null;
  const mostAvoidedTask = avoidedHabit && avoidedHabit.successRate < 60
    ? `"${avoidedHabit.action}" (${avoidedHabit.successRate}% completion)`
    : "None (All habits >60%)";

  // 5. Recovery Index
  const selfCareXP = saState?.xp?.selfCare || 0;
  const recoveryActivities = activities.filter(a => a.category === "Recovery");
  const recoveryMins = recoveryActivities.reduce((acc, a) => acc + a.duration, 0);
  
  let recoveryIndex = "Moderate (Balanced)";
  if (selfCareXP > 100 || recoveryMins > 60) {
    recoveryIndex = "High (Restorative)";
  } else if (selfCareXP < 30 && recoveryMins < 15) {
    recoveryIndex = "Low (Burnout Risk)";
  }

  // 6. Social Engagement
  const socialXP = saState?.xp?.social || 0;
  let socialIndex = "Moderate Connection";
  if (socialXP > 80) {
    socialIndex = "High Connection";
  } else if (socialXP < 20) {
    socialIndex = "Low (Socially Isolated)";
  }

  // 7. Suggested Discussion Topic
  const profileType = saState?.profile;
  let suggestedDiscussion = "Review overall daily routines, highlight one specific habit to focus on, and encourage regular recovery time.";
  if (profileType === "Achiever") {
    suggestedDiscussion = "Focus on boundary setting and active recovery. The student is highly productive but may be overworking and neglecting restorative buffers.";
  } else if (profileType === "Overthinker") {
    suggestedDiscussion = "Discuss taking smaller actions. The student tends to plan extensively but experiences friction in starting. Explore simplifying targets.";
  } else if (profileType === "Caregiver") {
    suggestedDiscussion = "Address personal recovery time. Check if they are giving support to others at the expense of their own self-care and sleep habits.";
  } else if (profileType === "Avoider") {
    suggestedDiscussion = "Acknowledge avoidance pattern compassionately. Discuss how to shrink the lowest-success habit into a tiny, friction-free 2-minute version.";
  } else if (profileType === "Sprinter") {
    suggestedDiscussion = "Explore building a steady daily rhythm. Discuss replacing intense bursts of activity with low-friction, daily daily habits.";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white rounded-[3.5rem] shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black">
                 {selectedSession.student_profiles?.anonymous_username?.charAt(0)}
              </div>
              <div>
                 <h2 className="text-xl font-black text-slate-900">Workspace: {selectedSession.student_profiles?.anonymous_username}</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Session ID: {selectedSession.id.slice(0, 12)}</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Button 
                asChild
                className="h-12 px-6 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all"
              >
                <a 
                  href={`https://meet.jit.si/SoulSync-Session-${selectedSession.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Join Video Session
                </a>
              </Button>
              <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                 <X className="h-5 w-5" />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Context & History */}
              <div className="space-y-10">
                 <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                       <Info className="h-4 w-4" />
                       Handoff Context
                    </h3>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 leading-relaxed text-slate-700 text-sm">
                       {selectedSession.handoff_briefing || "No pre-session handoff provided."}
                    </div>
                 </section>

                 <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                       <FileText className="h-4 w-4" />
                       Student's Booking Notes
                    </h3>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 leading-relaxed text-slate-700 text-sm italic">
                       {selectedSession.notes ? `"${selectedSession.notes}"` : "No notes provided during booking."}
                    </div>
                 </section>

                 <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                       <Activity className="h-4 w-4" />
                       Student Mood History
                    </h3>
                    <div className="h-64 w-full bg-slate-50 rounded-3xl border border-slate-100 p-6">
                       {moodHistory.length > 0 ? (
                          <MoodChart 
                            data={moodHistory.map(m => ({ 
                              date: new Date(m.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
                              value: moodValues[m.mood as keyof typeof moodValues] || null,
                              moodLabel: m.mood
                            }))} 
                          />
                       ) : (
                         <div className="h-full flex items-center justify-center flex-col text-slate-300">
                            <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs font-bold">Insufficient data for trend mapping</p>
                         </div>
                       )}
                    </div>
                 </section>

                  <section>
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                        AI Behavioral Intelligence Summary
                     </h3>
                     
                     {saState ? (
                        <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
                           {/* Background decorative gradient */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                           <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                           
                           {/* Header line: Profile Type */}
                           <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                              <div className="flex items-center gap-2">
                                 <Shield className="h-5 w-5 text-indigo-400" />
                                 <span className="text-sm font-bold text-slate-200">Behavioral Profile</span>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-wider uppercase">
                                 {saState.profile || "Not Configured"}
                              </span>
                           </div>
                           
                           {/* Dashboard Grid */}
                           <div className="grid grid-cols-2 gap-4">
                              {/* Consistency Index */}
                              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consistency Index</span>
                                 <div className="flex items-end justify-between mt-2">
                                    <span className="text-2xl font-black text-white">{consistencyIndex}%</span>
                                    <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                                       <div 
                                          className="bg-indigo-50 h-full rounded-full transition-all" 
                                          style={{ width: `${consistencyIndex}%` }} 
                                       />
                                    </div>
                                 </div>
                              </div>
                              
                              {/* Focus Trend */}
                              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus Trend</span>
                                 <div className="flex items-center gap-2 mt-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                                    <span className="text-xs font-bold text-slate-200">{focusTrend}</span>
                                 </div>
                              </div>
                              
                              {/* Mood Trend */}
                              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mood Trend</span>
                                 <div className="flex items-center gap-2 mt-2">
                                    <Smile className="h-4 w-4 text-amber-400" />
                                    <span className="text-xs font-bold text-slate-200">{moodTrend}</span>
                                 </div>
                              </div>
                              
                              {/* Recovery Index */}
                              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recovery Index</span>
                                 <div className="flex items-center gap-2 mt-2">
                                    <Heart className="h-4 w-4 text-rose-400" />
                                    <span className="text-xs font-bold text-slate-200">{recoveryIndex}</span>
                                 </div>
                              </div>

                              {/* Social Engagement */}
                              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Social Connection</span>
                                 <div className="flex items-center gap-2 mt-2">
                                    <User className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs font-bold text-slate-200">{socialIndex}</span>
                                 </div>
                              </div>

                              {/* Most Avoided Habit */}
                              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Friction Habit</span>
                                 <span className="text-xs font-bold text-rose-300 truncate mt-2">
                                    {mostAvoidedTask}
                                 </span>
                              </div>
                           </div>

                           {/* Suggested Discussion Topic */}
                           <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/40 space-y-2">
                              <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
                                 <MessageSquare className="h-3.5 w-3.5" />
                                 Suggested Topic for Session
                              </div>
                              <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
                                 {suggestedDiscussion}
                              </p>
                           </div>
                           
                           {/* Raw memory context if exists and is not purely json */}
                           {memoryData.aiMemory && (
                              <div className="pt-2 border-t border-slate-800">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">AI Clinical Memory Notes</span>
                                 <p className="text-xs text-slate-400 leading-relaxed italic">
                                    "{memoryData.aiMemory}"
                                 </p>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100/50 space-y-4">
                           <div className="flex items-start gap-3">
                              <Info className="h-5 w-5 text-indigo-500 mt-0.5" />
                              <div>
                                 <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider mb-1">Schedule Architect Not Configured</h4>
                                 <p className="text-xs text-indigo-700/80 leading-relaxed">
                                    The student has not initialized the AI Life OS module yet. In the dashboard, they can design habits, log daily growth/recovery stats, and complete focus breathing sessions.
                                 </p>
                              </div>
                           </div>
                           {memoryData.aiMemory ? (
                              <div className="p-4 rounded-2xl bg-white border border-indigo-100 text-xs text-slate-700 italic leading-relaxed">
                                 "{memoryData.aiMemory}"
                              </div>
                           ) : (
                              <p className="text-xs font-bold text-slate-400 italic text-center">No supportive theme context captured yet.</p>
                           )}
                        </div>
                     )}
                  </section>

                 <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                       <History className="h-4 w-4" />
                       Past Session History
                    </h3>
                    <div className="space-y-3">
                       {pastNotes.length > 0 ? (
                         pastNotes.map((note) => (
                           <div key={note.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                               {new Date(note.created_at).toLocaleDateString()}
                             </p>
                             <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                               {note.volunteer_notes}
                             </p>
                           </div>
                         ))
                       ) : (
                         <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                           <p className="text-sm text-slate-500 italic">First time support session or no previous notes found.</p>
                         </div>
                       )}
                    </div>
                 </section>
              </div>

              {/* Right Column: AI Note Taking */}
              <div className="space-y-10">
                 <section className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Volunteer Reflection & Notes
                       </h3>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => {
                           setIsEditing(true);
                           onAIGenerate();
                         }}
                         disabled={notesLoading}
                         className="h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-black uppercase tracking-widest"
                       >
                          <Zap className="h-3 w-3 mr-2" />
                          AI Summarize
                       </Button>
                    </div>
                    
                    <div className="relative flex-1 group">
                       {!isEditing ? (
                         <div className="w-full h-80 lg:h-full min-h-[400px] p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 overflow-y-auto text-sm text-slate-700 leading-relaxed">
                            <div className="whitespace-pre-wrap">{newNote}</div>
                         </div>
                       ) : (
                         <textarea
                           value={newNote}
                           onChange={(e) => setNewNote(e.target.value)}
                           placeholder="Synthesize the session, key takeaways, and handoff notes for the next volunteer..."
                           className="w-full h-80 lg:h-full min-h-[400px] p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-8 focus:ring-primary/5 transition-all outline-none text-sm text-slate-700 leading-relaxed resize-none"
                         />
                       )}
                       <div className="absolute bottom-6 right-6 flex items-center gap-3">
                          {!isEditing ? (
                            <Button 
                              onClick={() => setIsEditing(true)}
                              className="h-12 px-8 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-xs shadow-sm transition-all hover:bg-slate-50 active:scale-95"
                            >
                               Edit
                            </Button>
                          ) : (
                            <Button 
                              onClick={onSaveNote}
                              disabled={notesLoading || !newNote.trim()}
                              className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black text-xs shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                               {notesLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Secure Save"}
                            </Button>
                          )}
                       </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                       <CheckCircle className="h-4 w-4 text-amber-500" />
                       <p className="text-[10px] font-bold text-amber-700 leading-tight">
                          Notes are confidential and only visible to authorized SoulSync volunteers.
                       </p>
                    </div>
                 </section>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
});

SessionWorkspace.displayName = "SessionWorkspace";
