// SoulSync Volunteer Dashboard - White Theme Optimized
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { VolunteerNavbar } from "@/components/volunteer/VolunteerNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateSessionReport } from "@/utils/chat.functions";
import { Tables } from "@/integrations/supabase/types";
import { VolunteerStats } from "@/components/volunteer/VolunteerStats";
import { BadgeRibbon } from "@/components/volunteer/BadgeRibbon";
import { VolunteerImpactMetrics } from "@/components/volunteer/VolunteerImpactMetrics";
import { SessionQueue } from "@/components/volunteer/SessionQueue";
import { AvailabilityManager } from "@/components/volunteer/AvailabilityManager";
import { SessionWorkspace } from "@/components/volunteer/SessionWorkspace";
import { LayoutDashboard, MessageSquare, Calendar, LogOut, Award, Trophy, AlarmClock, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { z } from "zod";

type Volunteer = Tables<"volunteers">;
type Session = Tables<"session_bookings"> & {
  student_profiles: {
    anonymous_username: string;
    memory_context: string | null;
  } | null;
  time_slots: Tables<"time_slots"> | null;
};

interface CRMNote {
  id: string;
  content: string;
  created_at: string;
}

const dashboardSearchSchema = z.object({
  tab: z.enum(["overview", "sessions", "slots"]).optional().default("overview"),
});

export const Route = createFileRoute("/volunteer/dashboard")({
  validateSearch: (search) => dashboardSearchSchema.parse(search),
  component: VolunteerDashboard,
});

type Tab = "overview" | "sessions" | "slots";

function VolunteerDashboard() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  
  const activeTab = tab;
  const setActiveTab = (newTab: Tab) => {
    navigate({
      search: { tab: newTab } as any
    });
  };
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");
  // Tracks whether the active session came from the manual (non-OAuth) login flow
  const [isManualLogin, setIsManualLogin] = useState(false);

  const [timeSlots, setTimeSlots] = useState<Tables<"time_slots">[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [crmNotes, setCrmNotes] = useState<CRMNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<Tables<"mood_entries">[]>([]);
  const [pastNotes, setPastNotes] = useState<{ id: string, created_at: string, volunteer_notes: string | null }[]>([]);

  const fetchTimeSlots = useCallback(async (volunteerId: string) => {
    setSlotsLoading(true);
    try {
      const todayDateString = new Date().toISOString().split("T")[0];
      await supabase
        .from("time_slots")
        .delete()
        .eq("volunteer_id", volunteerId)
        .lt("slot_date", todayDateString);
      
      const { data, error } = await supabase
        .from("time_slots")
        .select("*")
        .eq("volunteer_id", volunteerId)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
        
      if (error) throw error;
      if (data) setTimeSlots(data);
    } catch (err) {
      console.error("Error fetching time slots:", err);
      toast.error("Failed to load availability schedule.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async (volunteerId: string) => {
    try {
      let query = supabase
        .from("session_bookings")
        .select(`*, student_profiles(anonymous_username, memory_context), time_slots(*)`)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });
      
      query = query.eq("volunteer_id", volunteerId);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const enrichedData = await Promise.all(data.map(async (session) => {
          const slotId = session.time_slot_id;
          if (!session.time_slots && slotId) {
             const { data: slotData } = await supabase.from("time_slots").select("*").eq("id", slotId).single();
             return { ...session, time_slots: slotData } as Session;
          }
          return session as Session;
        }));
        setSessions(enrichedData);
      }
    } catch (err) {
      console.error("Error in fetchSessions:", err);
    }
  }, []);

  const verifyAndFetchData = useCallback(async (userEmail: string, skipAuthSignOut = false) => {
    const { data, error: volError } = await supabase
      .from("volunteers")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (volError || !data) {
      if (!skipAuthSignOut) await supabase.auth.signOut();
      setError("No volunteer profile found for this account.");
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    if (data.verification_status !== "verified") {
      if (!skipAuthSignOut) await supabase.auth.signOut();
      setError("Your account is pending verification. Access is restricted to verified volunteers.");
      setIsLoggedIn(false);
    } else {
      setVolunteer(data);
      setIsLoggedIn(true);
      fetchSessions(data.id);
      fetchTimeSlots(data.id);
    }
    setLoading(false);
  }, [fetchSessions, fetchTimeSlots]);

  const checkUser = useCallback(async () => {
    setLoading(true);

    // Check for a persisted manual login session first
    const manualEmail = localStorage.getItem("volunteer_manual_email");
    if (manualEmail) {
      setIsManualLogin(true);
      await verifyAndFetchData(manualEmail, true /* skipAuthSignOut */);
      return;
    }

    // Otherwise check for an active Google OAuth session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await verifyAndFetchData(session.user.email!);
    } else {
      setLoading(false);
    }
  }, [verifyAndFetchData]);

  const fetchNotes = useCallback(async (sessionId: string) => {
    try {
      setNotesLoading(true);
      const { data, error } = await supabase
        .from("session_bookings")
        .select("volunteer_notes")
        .eq("id", sessionId)
        .single();
      
      if (error) throw error;
      if (data && data.volunteer_notes) {
        setCrmNotes([{ id: "1", content: data.volunteer_notes, created_at: new Date().toISOString() }]);
        setNewNote(data.volunteer_notes);
      } else {
        setCrmNotes([]);
        setNewNote("");
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  const handleSaveNote = async () => {
    if (!newNote.trim() || !selectedSession || !volunteer) return;
    try {
      setNotesLoading(true);
      const { error } = await supabase
        .from("session_bookings")
        .update({ volunteer_notes: newNote })
        .eq("id", selectedSession.id);
        
      if (error) throw error;
      
      await fetchNotes(selectedSession.id);
      toast.success("Note saved successfully.");
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note.");
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchStudentMoodHistory = useCallback(async (aliasId: string) => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("alias_id", aliasId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      if (data) setMoodHistory(data);
    } catch (err) {
      console.error("Error fetching mood history:", err);
    }
  }, []);

  const fetchPastNotes = useCallback(async (aliasId: string, currentSessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("id, created_at, volunteer_notes")
        .eq("student_alias_id", aliasId)
        .neq("id", currentSessionId)
        .not("volunteer_notes", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPastNotes(data);
    } catch (err) {
      console.error("Error fetching past notes:", err);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (volunteer && activeTab === "slots") {
      fetchTimeSlots(volunteer.id);
    }
  }, [activeTab, volunteer, fetchTimeSlots]);

  useEffect(() => {
    if (selectedSession) {
      fetchNotes(selectedSession.id);
      if (selectedSession.student_alias_id) {
        fetchStudentMoodHistory(selectedSession.student_alias_id);
        fetchPastNotes(selectedSession.student_alias_id, selectedSession.id);
      } else {
        setPastNotes([]);
      }
    }
  }, [selectedSession, fetchNotes, fetchStudentMoodHistory, fetchPastNotes]);

  const handleMarkCompleted = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("session_bookings")
        .update({ status: "completed" })
        .eq("id", sessionId);

      if (error) throw error;
      
      toast.success("Session marked as completed.");
      if (volunteer) {
        fetchSessions(volunteer.id);
      }
    } catch (err) {
      console.error("Error marking session completed:", err);
      toast.error("Failed to update session status.");
    }
  };

  const handleAIGenerate = async () => {
    if (!selectedSession) return;
    setNotesLoading(true);
    
    const formattedPastNotes = pastNotes.length > 0 
      ? pastNotes.map(n => `[${new Date(n.created_at).toLocaleDateString()}]: ${n.volunteer_notes}`).join("\n\n")
      : null;

    try {
      const { report } = await generateSessionReport({
        data: {
          handoff: selectedSession.handoff_briefing,
          studentNote: selectedSession.notes,
          pastNotes: formattedPastNotes,
          issueType: selectedSession.issue_type,
          volunteerDraft: newNote,
        }
      });
      setNewNote(report || newNote);
      toast.success("AI notes generated! Please review before saving.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI notes.");
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteer) return;
    try {
      setSlotsLoading(true);
      const { error } = await supabase
        .from("time_slots")
        .insert({
          volunteer_id: volunteer.id,
          slot_date: slotDate,
          start_time: startTime,
          end_time: endTime,
          is_booked: false,
        });
      if (error) throw error;
      toast.success("Time slot added!");
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      await fetchTimeSlots(volunteer.id);
    } catch (err) {
      console.error("Error adding slot:", err);
      toast.error("Failed to add time slot.");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!volunteer) return;
    try {
      setSlotsLoading(true);
      const { error } = await supabase
        .from("time_slots")
        .delete()
        .eq("id", slotId);
      if (error) throw error;
      toast.success("Time slot deleted!");
      await fetchTimeSlots(volunteer.id);
    } catch (err) {
      console.error("Error deleting slot:", err);
      toast.error("Failed to delete time slot.");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/volunteer/dashboard'
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Manual login: email = registered email, "password" field = their registered full name
      const normalizedEmail = email.trim().toLowerCase();
      const enteredName = password.trim();

      if (!normalizedEmail || !enteredName) {
        throw new Error("Please enter your email and registered name.");
      }

      const { data, error: lookupError } = await supabase
        .from("volunteers")
        .select("*")
        .eq("email", normalizedEmail)
        .single();

      if (lookupError || !data) {
        throw new Error("No volunteer account found with that email address.");
      }

      // Compare registered name (case-insensitive, whitespace-trimmed)
      if (data.name.trim().toLowerCase() !== enteredName.toLowerCase()) {
        throw new Error("Incorrect password. Please try again.");
      }

      if (data.verification_status !== "verified") {
        throw new Error("Your account is pending verification. You will be notified once approved.");
      }

      // Success — persist session in localStorage so page refreshes keep the user logged in
      localStorage.setItem("volunteer_manual_email", normalizedEmail);
      setIsManualLogin(true);
      setVolunteer(data);
      setIsLoggedIn(true);
      fetchSessions(data.id);
      fetchTimeSlots(data.id);

    } catch (err: any) {
      setError(err.message || "Invalid credentials or unverified account.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isManualLogin) {
      // Manual login session — clear localStorage, no Supabase Auth to sign out of
      localStorage.removeItem("volunteer_manual_email");
      setIsManualLogin(false);
    } else {
      // Google OAuth session
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setVolunteer(null);
    setError("");
  };

  const sessionDurationMinutes = (start: string, end: string) => {
    const s = new Date(`1970-01-01T${start}`);
    const e = new Date(`1970-01-01T${end}`);
    return (e.getTime() - s.getTime()) / 60000;
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const computeStatus = (date: string, start: string, end: string) => {
    const now = new Date();
    const sessionStart = new Date(`${date}T${start}`);
    const sessionEnd = new Date(`${date}T${end}`);
    
    if (now < sessionStart) return "upcoming";
    if (now > sessionEnd) return "completed";
    return "active";
  };

  const upcomingSessions = sessions.filter(s => {
    if (s.status === "completed") return false;
    if (!s.time_slots?.slot_date || !s.time_slots?.start_time || !s.time_slots?.end_time) 
      return false;
    const status = computeStatus(
      s.time_slots.slot_date, 
      s.time_slots.start_time, 
      s.time_slots.end_time
    );
    return status === "upcoming" || status === "active";
  });

  const completedSessions = sessions.filter(s => {
    if (s.status === "completed") return true;
    if (!s.time_slots?.slot_date || !s.time_slots?.start_time || !s.time_slots?.end_time) return false;
    return computeStatus(
      s.time_slots.slot_date,
      s.time_slots.start_time,
      s.time_slots.end_time
    ) === "completed";
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950 selection:bg-primary/10">
        <VolunteerNavbar />
        <main className="relative z-10 mx-auto flex min-h-screen max-w-[440px] flex-col justify-center px-6 py-24">
          <div className="mb-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-xl dark:shadow-none shadow-primary/10">
               <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Volunteer Access</h1>
            <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">Verified Supporters Only</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-2xl dark:shadow-none shadow-slate-100">
               {error && <p className="mb-6 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
               {loading ? (
                 <div className="py-12 text-center text-sm font-black uppercase tracking-widest text-slate-400">Verifying Identity...</div>
               ) : (
                  <>
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@college.edu" className="w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-primary transition-colors" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enter Your Password</label>
                        <input type="text" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your full name" className="w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-primary transition-colors" required />
                      </div>
                      <Button type="submit" className="w-full h-14 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg dark:shadow-none shadow-primary/10">Authorize & Enter</Button>
                    </form>
                    <div className="my-8 border-t border-slate-100 dark:border-slate-800 relative text-center">
                      <span className="bg-white dark:bg-slate-950 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 absolute -top-2 left-1/2 -translate-x-1/2">secure gate</span>
                    </div>
                    <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-14 rounded-xl border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:bg-slate-900">Continue with Google</Button>
                  </>
               )}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const activeMinutes = sessions.filter(s => s.status === 'completed' || s.mood_after).reduce((acc, s) => acc + (s.time_slots ? sessionDurationMinutes(s.time_slots.start_time, s.time_slots.end_time) : 0), 0);

  const showOnboardingNudge = activeMinutes === 0 && sessions.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex selection:bg-primary/10">
      
      {/* Fixed Left Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 bg-[#0D1B2A] text-white flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-[220px]"
        } border-r border-slate-800`}
      >
        <div>
          {/* Header Area */}
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-[#00C48C] flex items-center justify-center shadow-lg dark:shadow-none shadow-[#00C48C]/20">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              {!isCollapsed && (
                <span className="font-display text-lg font-black tracking-tight text-white block">
                  SoulSync
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
            >
              {isCollapsed ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-2">
            {[
              { key: "overview" as Tab, label: "Hub", icon: LayoutDashboard },
              { key: "sessions" as Tab, label: "Conversations", icon: MessageSquare, badge: upcomingSessions.length },
              { key: "slots" as Tab, label: "Schedule", icon: Calendar },
            ].map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => setActiveTab(link.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    isActive 
                      ? "bg-[#00C48C] text-[#0D1B2A] shadow-lg dark:shadow-none shadow-[#00C48C]/15" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title={link.label}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{link.label}</span>}
                  {link.badge && !isCollapsed ? (
                    <span className={`ml-auto rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-black ${
                      isActive ? "bg-[#0D1B2A] text-[#00C48C]" : "bg-slate-800 text-white"
                    }`}>
                      {link.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
            
          </nav>

          {/* Online/Offline availability toggle in the middle */}
          <div className="p-4 border-t border-slate-800/60 mt-4">
            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-800 transition-all ${
              isCollapsed ? "px-1" : "px-4"
            }`}>
              {!isCollapsed && (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Availability
                </span>
              )}
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOnline ? "bg-[#00C48C]" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                    isOnline ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              {!isCollapsed && (
                <span className={`text-[10px] font-black mt-2 uppercase tracking-wider ${
                  isOnline ? "text-[#00C48C]" : "text-slate-400"
                }`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Area of Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {/* Verified Peer Badge */}
          {!isCollapsed ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-900 text-emerald-400">
              <Award className="h-4 w-4 shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-wider">Verified Peer</span>
            </div>
          ) : (
            <div className="flex justify-center text-emerald-400">
              <Award className="h-5 w-5" aria-label="Verified Peer" />
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen p-8 lg:p-12 overflow-y-auto ${
          isCollapsed ? "ml-20" : "ml-[220px]"
        }`}
      >
        {/* Top Header & Stats Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-12">
          <div>
            <h1 className="text-3xl font-display font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Welcome, {volunteer?.name?.split(" ")[0] || "Supporter"}
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1">
              Managing your anonymous student support journey.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 items-center">
            {showOnboardingNudge ? (
              <div className="flex items-center gap-3 px-6 py-4 rounded-[2rem] bg-emerald-50 border border-[#00C48C]/30 text-slate-700 dark:text-slate-300">
                <span className="text-xs font-bold text-[#0D1B2A]">
                  You've supported 0 students so far — your first conversation could change everything
                </span>
                <span className="text-[#00C48C] font-bold">💚</span>
              </div>
            ) : null}

            <div className="bg-white dark:bg-slate-950 px-6 py-4 rounded-[1.75rem] shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Given</p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-50">{formatDuration(activeMinutes)}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-950 px-6 py-4 rounded-[1.75rem] shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 text-center min-w-[120px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Conversations</p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-50">{sessions.length}</p>
            </div>
            
            <div className="bg-[#0D1B2A] px-6 py-4 rounded-[1.75rem] shadow-xl dark:shadow-none text-center min-w-[120px] border border-white/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#00C48C] mb-1">Upcoming</p>
              <p className="text-xl font-black text-white">{upcomingSessions.length}</p>
            </div>
          </div>
        </div>

        {/* Pill Navigation Tabs */}
        <div className="flex gap-2 mb-10 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-1.5 w-fit shadow-sm dark:shadow-none">
          {[
            { key: "overview" as Tab, label: "My Impact", icon: <Trophy className="h-3.5 w-3.5" /> },
            { key: "sessions" as Tab, label: "Response Queue", icon: <LayoutDashboard className="h-3.5 w-3.5" />, badge: upcomingSessions.length },
            { key: "slots" as Tab, label: "Availability", icon: <AlarmClock className="h-3.5 w-3.5" /> },
          ].map(t => (
            <button 
              key={t.key} 
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === t.key 
                ? "bg-[#00C48C] text-[#0D1B2A] shadow-md dark:shadow-none font-black" 
                : "text-slate-500 dark:text-slate-400 hover:bg-white dark:bg-slate-950"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge ? (
                <span className={`ml-1.5 text-[9px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center ${
                  activeTab === t.key ? "bg-[#0D1B2A] text-[#00C48C]" : "bg-slate-200 text-slate-700 dark:text-slate-300"
                }`}>
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
             {activeTab === "overview" ? (
               <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                 <BadgeRibbon 
                   completedSessionsCount={completedSessions.length}
                   hasNightSession={sessions.some(s => s.time_slots && parseInt(s.time_slots.start_time.split(":")[0]) >= 20)}
                   hasCrisisSession={sessions.some(s => s.issue_type === 'Crisis' || s.issue_type === 'Emergency')}
                 />
                 <VolunteerImpactMetrics 
                   activeMinutes={activeMinutes}
                   uniqueStudentsCount={new Set(completedSessions.map(s => s.student_alias_id)).size}
                   formatDuration={formatDuration}
                 />
               </motion.div>
             ) : activeTab === "sessions" ? (
               <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <SessionQueue 
                   sessions={upcomingSessions}
                   onSelectSession={setSelectedSession}
                   computeStatus={computeStatus}
                   onMarkCompleted={handleMarkCompleted}
                 />
               </motion.div>
             ) : (
               <motion.div key="slots" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <AvailabilityManager 
                   timeSlots={timeSlots}
                   slotsLoading={slotsLoading}
                   slotDate={slotDate}
                   setSlotDate={setSlotDate}
                   startTime={startTime}
                   setStartTime={setStartTime}
                   endTime={endTime}
                   setEndTime={setEndTime}
                   onAddSlot={handleAddSlot}
                   onDeleteSlot={handleDeleteSlot}
                   upcomingSessions={upcomingSessions}
                   onMarkCompleted={handleMarkCompleted}
                 />
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {selectedSession && (
            <SessionWorkspace 
              selectedSession={selectedSession}
              onClose={() => setSelectedSession(null)}
              crmNotes={crmNotes}
              newNote={newNote}
              setNewNote={setNewNote}
              notesLoading={notesLoading}
              onSaveNote={handleSaveNote}
              onAIGenerate={handleAIGenerate}
              moodHistory={moodHistory}
              pastNotes={pastNotes}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default VolunteerDashboard;

