import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  X, Info, MessageSquare, Zap, CheckCircle, RefreshCw,
  TrendingUp, Activity, User, Video, FileText, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoodChart, moodValues } from "@/components/MoodChart";

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
                       <User className="h-4 w-4" />
                       Supportive Context
                    </h3>
                    <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100/50">
                       <p className="text-xs font-bold text-indigo-900 mb-2 uppercase tracking-widest">Memory Context (Privacy Protected)</p>
                       <p className="text-sm text-indigo-700/80 leading-relaxed italic">
                          "{selectedSession.student_profiles?.memory_context || "No recurring themes noted for this student identity yet."}"
                       </p>
                    </div>
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
