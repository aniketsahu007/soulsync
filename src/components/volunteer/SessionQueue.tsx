import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  MessageSquare, LayoutDashboard, Clock, Calendar, 
  ChevronRight, FileText, UserCheck, AlertTriangle,
  Video, CheckCircle, ChevronDown, ChevronUp, Sparkles,
  Heart, Smile, Brain, Coffee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseMemoryContext } from "@/utils/schedule.functions";

interface SessionQueueProps {
  sessions: any[];
  onSelectSession: (session: any) => void;
  computeStatus: (date: string, start: string, end: string) => string;
  onMarkCompleted?: (sessionId: string) => void;
}

export const SessionQueue = memo(({ 
  sessions, 
  onSelectSession, 
  computeStatus,
  onMarkCompleted
}: SessionQueueProps) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          Active Response Queue
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.length === 0 ? (
          <Card className="col-span-full p-12 text-center bg-white/50 border-dashed border-slate-200 rounded-[3rem]">
            <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <p className="text-sm font-bold text-slate-400">No active or upcoming sessions at the moment.</p>
          </Card>
        ) : sessions.map(session => {
          const status = computeStatus(
            session.time_slots?.slot_date, 
            session.time_slots?.start_time, 
            session.time_slots?.end_time
          );
          
          return (
            <Card 
              key={session.id} 
              className="group relative overflow-hidden rounded-[2.5rem] border-white bg-white p-8 shadow-sm ring-1 ring-slate-200/50 hover:shadow-xl transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 font-black text-slate-400 text-sm">
                       {session.student_profiles?.anonymous_username?.charAt(0)}
                    </div>
                    <div>
                       <p className="font-black text-slate-900 group-hover:text-primary transition-colors">{session.student_profiles?.anonymous_username}</p>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                         status === 'active' ? 'text-emerald-500' : 'text-slate-400'
                       }`}>
                         {status === 'active' && '● '} {status}
                       </span>
                    </div>
                 </div>
                 <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    ID: {session.id.slice(0, 8)}
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(session.time_slots?.slot_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                 </div>
                 <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {session.time_slots?.start_time} - {session.time_slots?.end_time}
                 </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Handoff Briefing</p>
                 <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {session.handoff_briefing || "No pre-session context available."}
                 </p>
              </div>

              {/* AI Wellness Preview Toggle Button */}
              {(() => {
                const memoryData = parseMemoryContext(session.student_profiles?.memory_context);
                const saState = memoryData.scheduleArchitect;
                const isExpanded = expandedSessionId === session.id;

                // 1. Consistency Index
                const habits = saState?.habits || [];
                const consistencyIndex = habits.length > 0 
                  ? Math.round(habits.reduce((acc, h) => acc + h.successRate, 0) / habits.length) 
                  : 0;

                // 2. Concentration Level (pauses)
                const activities = saState?.activities || [];
                const focusActs = activities.filter(a => a.description.startsWith("Deep Focus:"));
                let totalPauses = 0;
                let focusSessionsWithPauseData = 0;
                focusActs.forEach(a => {
                  const match = a.description.match(/\(Pauses:\s*(\d+)\)/);
                  if (match) {
                    totalPauses += parseInt(match[1], 10);
                    focusSessionsWithPauseData++;
                  }
                });

                let concentrationLevel = "Excellent";
                if (focusSessionsWithPauseData > 0) {
                  const avgPauses = totalPauses / focusSessionsWithPauseData;
                  if (avgPauses === 0) {
                    concentrationLevel = "High (0 breaks avg)";
                  } else if (avgPauses <= 1) {
                    concentrationLevel = "Good (1 break avg)";
                  } else if (avgPauses <= 2) {
                    concentrationLevel = "Moderate (2 breaks avg)";
                  } else {
                    concentrationLevel = "Needs Support (>2 breaks avg)";
                  }
                } else {
                  concentrationLevel = "No sessions logged";
                }

                // 3. Avoided Habit
                const avoidedHabit = habits.length > 0 
                  ? habits.reduce((min, h) => h.successRate < min.successRate ? h : min, habits[0]) 
                  : null;
                const mostAvoidedTask = avoidedHabit && avoidedHabit.successRate < 60
                  ? `"${avoidedHabit.action}" (${avoidedHabit.successRate}%)`
                  : "None (All on track)";

                // 4. Max Focus Time (longest single uninterrupted focus session)
                const maxFocusMins = focusActs.length > 0
                  ? Math.max(...focusActs.map(a => a.duration))
                  : 0;
                const maxFocusLabel = maxFocusMins > 0 ? `${maxFocusMins} min` : "No data";

                // 5. Stress Risk Score (0–100, higher = more at risk)
                const avgPausesForStress = focusSessionsWithPauseData > 0 ? totalPauses / focusSessionsWithPauseData : 0;
                let stressScore = 0;
                if (consistencyIndex < 40) stressScore += 35;
                else if (consistencyIndex < 60) stressScore += 20;
                if (avgPausesForStress > 2) stressScore += 30;
                else if (avgPausesForStress > 1) stressScore += 15;
                if (avoidedHabit && avoidedHabit.successRate < 40) stressScore += 25;
                else if (avoidedHabit && avoidedHabit.successRate < 60) stressScore += 10;
                const stressLabel = stressScore >= 60 ? "High Risk" : stressScore >= 35 ? "Moderate" : stressScore >= 15 ? "Low" : "Minimal";
                const stressColor = stressScore >= 60 ? "text-rose-400" : stressScore >= 35 ? "text-amber-400" : "text-emerald-400";

                // 6. Activity Balance
                const totalDur = activities.reduce((acc, a) => acc + a.duration, 0) || 1;
                const growthPct = Math.round(activities.filter(a => a.category === "Growth").reduce((acc, a) => acc + a.duration, 0) / totalDur * 100);
                const recoveryPct = Math.round(activities.filter(a => a.category === "Recovery").reduce((acc, a) => acc + a.duration, 0) / totalDur * 100);
                const leakagePct = 100 - growthPct - recoveryPct;
                const balanceLabel = activities.length === 0 ? "No logs yet" : `${growthPct}% Growth · ${recoveryPct}% Recovery · ${leakagePct}% Leakage`;

                // 7. Suggested Topic
                const profileType = saState?.profile;
                let suggestedDiscussion = "Review overall daily routines and outline a single clear focus habit.";
                if (profileType === "Achiever") {
                  suggestedDiscussion = "Focus on boundary setting and recovery to avoid overworking.";
                } else if (profileType === "Overthinker") {
                  suggestedDiscussion = "Discuss reducing planning friction by taking smaller actions.";
                } else if (profileType === "Caregiver") {
                  suggestedDiscussion = "Address prioritizing personal recovery and self-care boundaries.";
                } else if (profileType === "Avoider") {
                  suggestedDiscussion = "Suggest breaking down their lowest-success habit into a 2-min version.";
                } else if (profileType === "Sprinter") {
                  suggestedDiscussion = "Explore replacing high-intensity bursts with consistent daily habits.";
                }

                return (
                  <>
                    <button 
                      type="button"
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                      className="w-full flex items-center justify-between p-4 mb-8 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 hover:border-indigo-100 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">AI Student Wellness Preview</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-indigo-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-indigo-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-8"
                        >
                          {saState && saState.privacySync ? (
                            <div className="p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-4">
                              {/* Profile header */}
                              <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-3">
                                 <span className="font-bold text-slate-400 uppercase tracking-widest">Behavioral Profile</span>
                                 <span className="font-black text-indigo-300 uppercase tracking-wider bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
                                   {saState.profile || "Not Configured"}
                                 </span>
                              </div>
                              
                              {/* 6-metric grid */}
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                  <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest mb-1">Consistency</span>
                                  <span className="font-black text-white text-sm">{consistencyIndex}%</span>
                                </div>
                                
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                  <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest mb-1">Concentration</span>
                                  <span className="font-bold text-slate-200 block text-[10px] leading-tight">{concentrationLevel}</span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                  <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest mb-1">Max Focus</span>
                                  <span className="font-black text-emerald-400 text-sm">{maxFocusLabel}</span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                  <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest mb-1">Stress Risk</span>
                                  <span className={`font-black text-sm ${stressColor}`}>{stressLabel}</span>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2">
                                  <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest mb-1">Friction Habit</span>
                                  <span className="font-bold text-rose-300 block text-[10px] leading-tight" title={mostAvoidedTask}>{mostAvoidedTask}</span>
                                </div>
                              </div>

                              {/* Activity balance bar */}
                              {activities.length > 0 && (
                                <div>
                                  <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-widest mb-2">Activity Balance</span>
                                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                                    <div className="bg-emerald-500 rounded-full" style={{ width: `${growthPct}%` }} title={`Growth: ${growthPct}%`} />
                                    <div className="bg-blue-400 rounded-full" style={{ width: `${recoveryPct}%` }} title={`Recovery: ${recoveryPct}%`} />
                                    <div className="bg-slate-600 rounded-full" style={{ width: `${leakagePct}%` }} title={`Leakage: ${leakagePct}%`} />
                                  </div>
                                  <p className="text-[9px] text-slate-500 mt-1 font-medium">{balanceLabel}</p>
                                </div>
                              )}

                              {/* Suggested topic */}
                              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/40">
                                <span className="font-black text-indigo-400 uppercase tracking-wider text-[9px] block mb-1">Suggested Discussion Topic</span>
                                <p className="text-indigo-200/90 leading-relaxed text-[11px] font-medium">{suggestedDiscussion}</p>
                              </div>
                              
                              {memoryData.aiMemory && (
                                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                                  "{memoryData.aiMemory}"
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-xs text-indigo-800">
                              <p className="font-bold mb-1">
                                {!saState ? "No Summary Shared" : "Summary Private"}
                              </p>
                              <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                                {!saState 
                                  ? "No student behavioral summary is shared for this session."
                                  : "The student has chosen to keep their Schedule Architect summary private."
                                }
                              </p>
                              {memoryData.aiMemory && (
                                <p className="mt-2 p-2 bg-white rounded border border-indigo-100 italic">
                                  "{memoryData.aiMemory}"
                                </p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                );
              })()}

              <div className="flex flex-col sm:flex-row gap-3">
                 <Button 
                   onClick={() => onSelectSession(session)}
                   className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold text-xs"
                 >
                    Enter Workspace
                 </Button>
                 {status === 'active' && (
                   <Button 
                     asChild
                     className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20"
                   >
                     <a 
                       href={`https://meet.jit.si/SoulSync-Session-${session.id}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2"
                     >
                       <Video className="h-4 w-4" />
                       Join Meeting
                     </a>
                   </Button>
                 )}
                 {session.issue_type === 'Crisis' && (
                   <div className="h-12 w-12 shrink-0 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 text-red-500 shadow-lg shadow-red-500/10">
                      <AlertTriangle className="h-5 w-5" />
                   </div>
                 )}
                 {onMarkCompleted && (
                   <Button
                     onClick={() => onMarkCompleted(session.id)}
                     className="h-12 w-12 shrink-0 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-400 border border-slate-200 shadow-sm transition-all"
                     title="Mark as completed"
                   >
                     <CheckCircle className="h-5 w-5" />
                   </Button>
                 )}
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
});

SessionQueue.displayName = "SessionQueue";
