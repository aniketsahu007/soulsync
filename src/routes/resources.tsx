import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAnonymousIdentity } from "@/hooks/useAnonymousIdentity";
import {
  BookOpen,
  Heart,
  Brain,
  Shield,
  Sun,
  Users,
  Phone,
  Lightbulb,
  X,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Send,
  User,
  Activity,
  Zap,
  Info,
  Lock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CRISIS_HELPLINES } from "@/constants/partners";
import { BreathingVisualizer } from "@/components/resilience-tools/BreathingVisualizer";
import { GroundingJourney } from "@/components/resilience-tools/GroundingJourney";
import { HALTDiagnostic } from "@/components/resilience-tools/HALTDiagnostic";
import { ReflectionPad } from "@/components/resilience-tools/ReflectionPad";
import { ChatInterface } from "@/components/ChatInterface";
import { MobileResourcesPage } from "@/components/mobile/MobilePublicPages";
import { ResponsivePage } from "@/components/responsive/ResponsivePage";
import {
  fetchScheduleArchitectData,
  saveScheduleArchitectData,
  DEFAULT_STATE,
  type AtomicHabit,
  type ScheduleActivity,
  type ScheduleArchitectState,
} from "@/utils/schedule.functions";
import { sendChatMessage } from "@/utils/chat.functions";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <ResponsivePage
      DesktopComponent={DesktopResourcesPage}
      MobileComponent={MobileResourcesPage}
    />
  );
}

function DesktopResourcesPage() {
  const { aliasId, isLoading: identityLoading } = useAnonymousIdentity();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "habits" | "chat" | "resilience" | "helplines">("dashboard");

  // State loaded from Supabase or fallback LocalStorage
  const [state, setState] = useState<ScheduleArchitectState>(DEFAULT_STATE);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Focus Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerHabit, setTimerHabit] = useState<AtomicHabit | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 mins
  const [timerTotal, setTimerTotal] = useState(25 * 60);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerPauseCount, setTimerPauseCount] = useState(0);
  const [breathingText, setBreathingText] = useState("Focus");
  const [breathingPhase, setBreathingPhase] = useState<"in" | "hold" | "out">("in");

  // Local form inputs
  const [newHabit, setNewHabit] = useState({ cue: "", location: "", action: "", category: "Growth" as any, duration: 25 });
  const [newActivity, setNewActivity] = useState({ category: "Growth" as any, description: "" });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Onboarding Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Hey! I am your Schedule Architect AI Coach. I'm here to help you structure your daily habits, analyze focus gaps, and dodge burnout. What's on your mind today?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  // Selected tool modal state
  const [selectedResilienceTool, setSelectedResilienceTool] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);
  const breathingIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const tool = params.get("tool");
    const validTabs = ["dashboard", "habits", "chat", "resilience", "helplines"];
    const validTools = ["breathing", "grounding", "halt", "reflection"];

    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab as typeof activeTab);
    }

    if (tool && validTools.includes(tool)) {
      setActiveTab("resilience");
      setSelectedResilienceTool(tool);
    }
  }, []);

  const closeResilienceTool = () => {
    if (typeof window === "undefined") {
      setSelectedResilienceTool(null);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const origin = params.get("origin");
    const hasToolQuery = params.has("tool");

    if (origin === "mobile" && hasToolQuery) {
      window.location.href = "/resources";
      return;
    }

    setSelectedResilienceTool(null);
  };

  // Dynamic NLP/Keyword Parser for Gentle Growth Motivational Projections
  const parseActionMotivation = (action: string, duration: number) => {
    const cleanAction = action.trim();
    const days = 30;
    const totalMins = (duration || 25) * days;
    const hours = Math.round(totalMins / 60);

    if (!cleanAction) {
      return {
        identity: "a gentle, self-compassionate student building a happier life",
        habitRepetitionText: "Give yourself permission to grow, one quiet step at a time.",
        growthStatText: "Carve out 12.5 hours of intentional space for your well-being.",
        neuroPathwayText: "Slowly quiet the noise in your mind, making it easier to start without anxiety.",
      };
    }

    const lower = cleanAction.toLowerCase();
    
    // Clean filler words
    let core = cleanAction;
    const fillers = [
      "i will", "i want to", "try to", "start to", "learn to", "practice", "study", 
      "solve", "write", "do", "read", "make", "eat", "drink", "avoid", "no", "stop",
      "go to", "go", "run", "play", "walk", "limit", "cut"
    ];
    
    let coreLower = lower;
    let modified = true;
    while (modified) {
      modified = false;
      for (const filler of fillers) {
        if (coreLower.startsWith(filler + " ")) {
          core = core.substring(filler.length + 1).trim();
          coreLower = core.toLowerCase();
          modified = true;
        }
      }
    }

    const capitalizedCore = core.charAt(0).toUpperCase() + core.slice(1);

    let identity = `someone who honors their peace and practices ${capitalizedCore}`;
    let habitRepetitionText = `Dedicate ${days} gentle, conscious moments to practice "${cleanAction}".`;
    let growthStatText = `Devote a beautiful total of ${hours} hours and ${totalMins % 60} minutes to your personal path.`;
    let neuroPathwayText = `Nourish your confidence and build deep, comforting familiarity with "${capitalizedCore}".`;

    if (lower.includes("code") || lower.includes("dsa") || lower.includes("leetcode") || lower.includes("program") || lower.includes("develop") || lower.includes("python") || lower.includes("javascript") || lower.includes("rust") || lower.includes("c++") || lower.includes("java")) {
      identity = "a patient creator shaping their future without rushing";
      habitRepetitionText = `Take it one problem at a time, building steady momentum over ${days} gentle days.`;
      growthStatText = `Invest ${hours} hours of quiet focus into your craft, free from comparison.`;
      neuroPathwayText = `Solve approx. ${Math.round(totalMins / 20)} algorithm puzzles at your own comfortable pace.`;
    } else if (lower.includes("read") || lower.includes("book") || lower.includes("novel") || lower.includes("page")) {
      identity = "a thoughtful, lifelong learner and quiet seeker";
      habitRepetitionText = `Give yourself the gift of uninterrupted focus and page-turning ${days} times.`;
      growthStatText = `Absorb approx. ${Math.round(totalMins * 0.8)} pages, expanding your perspective and completing ~2 books.`;
      neuroPathwayText = `Lower baseline stress levels, expand your empathy database, and discover new ideas.`;
    } else if (lower.includes("study") || lower.includes("math") || lower.includes("physics") || lower.includes("chem") || lower.includes("class") || lower.includes("lecture") || lower.includes("revise") || lower.includes("exam") || lower.includes("test")) {
      identity = "a dedicated student cultivating true capability with self-compassion";
      habitRepetitionText = `Show up for yourself gently for ${days} active study sessions.`;
      growthStatText = `Dedicate ${hours} hours to unlocking your potential and reducing exam dread.`;
      neuroPathwayText = `Replace late-night panic with steady consistency, making retention feel natural and rewarding.`;
    } else if (lower.includes("gym") || lower.includes("workout") || lower.includes("exercise") || lower.includes("lift") || lower.includes("pushup") || lower.includes("weight") || lower.includes("swim") || lower.includes("sport") || lower.includes("football") || lower.includes("cricket")) {
      identity = "someone who listens to their body and respects their physical home";
      habitRepetitionText = `Celebrate what your body can do by completing ${days} joyful movement sessions.`;
      growthStatText = `Release stress and reconnect with yourself through ${hours} hours of movement.`;
      neuroPathwayText = `Stabilize your mental health, improve your deep sleep quality, and feel physically lighter.`;
    } else if (lower.includes("walk") || lower.includes("run") || lower.includes("jog") || lower.includes("steps")) {
      identity = "someone who walks with purpose and values fresh air";
      habitRepetitionText = `Step away from screens and connect with the movement of life for ${days} days.`;
      growthStatText = `Cover approx. ${Math.round(hours * 6)} kilometers of peaceful distance.`;
      neuroPathwayText = `Clear active brain fog, trigger healthy endorphins, and enjoy the healing rhythm of walking.`;
    } else if (lower.includes("meditat") || lower.includes("breathe") || lower.includes("journal") || lower.includes("reflect") || lower.includes("pray") || lower.includes("relax") || lower.includes("calm")) {
      identity = "a calm mind that stays grounded during chaotic seasons";
      habitRepetitionText = `Give your nervous system a soft place to rest and recover ${days} times.`;
      growthStatText = `Log ${hours} hours of conscious breathing and emotional offloading.`;
      neuroPathwayText = `Quiet the inner critic, ease academic overwhelm, and live more present in the moment.`;
    } else if (lower.includes("sweet") || lower.includes("sugar") || lower.includes("junk") || lower.includes("chocolate") || lower.includes("coke") || lower.includes("soda") || lower.includes("fast food") || lower.includes("pizza") || lower.includes("burger")) {
      identity = "someone who honors their vitality and protects their energy gently";
      habitRepetitionText = `Successfully protect your body's energy balance ${days} times without guilt.`;
      growthStatText = `Keep approx. ${days * 200} calories of processed additives out of your system.`;
      neuroPathwayText = `Break addictive dopamine spikes, stabilize your moods, and wake up feeling refreshed.`;
    } else if (lower.includes("phone") || lower.includes("social") || lower.includes("scroll") || lower.includes("insta") || lower.includes("reel") || lower.includes("youtube") || lower.includes("game") || lower.includes("play")) {
      identity = "a peaceful mind in complete control of their attention";
      habitRepetitionText = `Reclaim your presence and resist addictive scroll loops ${days} times.`;
      growthStatText = `Win back ${hours} beautiful hours of active life to spend on what truly matters to you.`;
      neuroPathwayText = `Rewire your attention span, quiet peer-comparison anxiety, and restore baseline mindfulness.`;
    } else if (lower.includes("sleep") || lower.includes("wake") || lower.includes("bed") || lower.includes("morning") || lower.includes("night")) {
      identity = "someone who respects their biological rhythm and values rest";
      habitRepetitionText = `Align with your biological clock and establish comforting sleep timings ${days} times.`;
      growthStatText = `Secure up to ${days} nights of deep, nourishing recovery cycles.`;
      neuroPathwayText = `Accelerate cognitive repair, eliminate chronic daytime fatigue, and wake up with a positive outlook.`;
    }

    return {
      identity,
      habitRepetitionText,
      growthStatText,
      neuroPathwayText
    };
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load state from DB / LocalStorage
  useEffect(() => {
    if (!aliasId) return;
    const id = aliasId; // narrowed to string

    async function loadData() {
      setIsSyncing(true);
      // Try DB first
      const dbData = await fetchScheduleArchitectData(id);
      if (dbData) {
        setState(dbData);
      } else {
        // Fallback to local storage
        const local = localStorage.getItem(`soulsync_sa_${id}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setState(parsed);
            // Async backup to DB
            await saveScheduleArchitectData(id, parsed);
          } catch (e) {
            setState(DEFAULT_STATE);
          }
        } else {
          setState(DEFAULT_STATE);
        }
      }
      setIsLoaded(true);
      setIsSyncing(false);
    }
    loadData();
  }, [aliasId]);

  // Sync state helper
  const syncState = async (updated: ScheduleArchitectState) => {
    setState(updated);
    if (aliasId) {
      localStorage.setItem(`soulsync_sa_${aliasId}`, JSON.stringify(updated));
      setIsSyncing(true);
      await saveScheduleArchitectData(aliasId, updated);
      setIsSyncing(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Breathing timer circle animation cycle
  useEffect(() => {
    if (timerActive && !timerPaused) {
      breathingIntervalRef.current = setInterval(() => {
        setBreathingPhase((prev) => {
          if (prev === "in") {
            setBreathingText("Hold...");
            return "hold";
          } else if (prev === "hold") {
            setBreathingText("Breathe Out...");
            return "out";
          } else {
            setBreathingText("Breathe In...");
            return "in";
          }
        });
      }, 4000); // 4 second cycles
    } else {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
      setBreathingText("Focus");
    }

    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [timerActive, timerPaused]);

  // Dynamic AI optimization suggestions logic
  useEffect(() => {
    if (!state.onboardingCompleted) return;

    const suggestions = [];

    // Calculate Growth/Recovery/Leakage ratios
    const totalDuration = state.activities.reduce((acc, a) => acc + a.duration, 0) || 1;
    const growthDuration = state.activities.filter(a => a.category === "Growth").reduce((acc, a) => acc + a.duration, 0);
    const recoveryDuration = state.activities.filter(a => a.category === "Recovery").reduce((acc, a) => acc + a.duration, 0);
    const leakageDuration = state.activities.filter(a => a.category === "Leakage").reduce((acc, a) => acc + a.duration, 0);

    const growthPct = (growthDuration / totalDuration) * 100;
    const recoveryPct = (recoveryDuration / totalDuration) * 100;
    const leakagePct = (leakageDuration / totalDuration) * 100;

    // Suggestion 1: Systems vs Goals (Routine & Schedule focus)
    if (state.habits.length === 0) {
      suggestions.push("🌱 \"You do not rise to the level of your goals. You fall to the level of your systems.\" — Focus on designing your first tiny routine today. Don't worry about outcomes; just build a cue that is too simple to ignore.");
    } else if (state.profile === "Overthinker") {
      suggestions.push("🧠 \"You do not rise to the level of your goals. You fall to the level of your systems.\" — For an Overthinker, a complex system causes friction. Simplify your DSA or study routines down to a 10-minute entry step. Master the art of starting, and momentum will take care of the rest.");
    } else {
      suggestions.push("🌱 \"You do not rise to the level of your goals. You fall to the level of your systems.\" — Your active habit checklist is your daily shield. Protect your routines instead of worrying about final grades or exams.");
    }

    // Suggestion 2: Identity Shift & Self-Belief (Empathetic / Self-growth focus)
    if (state.profile === "Achiever" && recoveryPct < 25) {
      suggestions.push("🎯 \"Every action you take is a vote for the type of person you wish to become.\" — Constant study without rest votes for burnout. Schedule a recovery buffer (like walking or listening to music). treat rest as a vote for a sustainable, healthy future self.");
    } else if (state.profile === "Avoider" || leakagePct > 35) {
      suggestions.push("📱 \"Every action you take is a vote for the type of person you wish to become.\" — Resisting a high-dopamine scroll trigger and starting your focus timer for just 5 minutes is a vote for a focused, clear mind. Cast small votes daily.");
    } else {
      suggestions.push("🎯 \"Every action you take is a vote for the type of person you wish to become.\" — Completing your habits isn't just about utility; it's about proving to yourself that you are someone who honors their commitments. Build self-trust.");
    }

    // Suggestion 3: Resilience & Forgiveness (Procrastination recovery / Never miss twice)
    const weakHabits = state.habits.filter((h) => h.successRate < 60);
    if (weakHabits.length > 0) {
      suggestions.push(`✨ "Missing once is an accident. Missing twice is the start of a new habit." — The routine "${weakHabits[0].action}" has broken recently. Be kind to yourself, but do not let it slip today. Even a 2-minute effort keeps the identity alive.`);
    } else {
      suggestions.push("✨ \"Missing once is an accident. Missing twice is the start of a new habit.\" — If a chaotic day breaks your schedule, forgive yourself. Just ensure you take a tiny micro-action tomorrow to protect the loop. Consistent, messy action beats perfect inaction.");
    }

    setAiSuggestions(suggestions);
  }, [state.activities, state.habits, state.profile, state.onboardingCompleted]);

  // Onboarding Quiz Questions
  const onboardingQuestions = [
    {
      question: "How do you typically react when academic deadlines pile up?",
      options: [
        { text: "I double down, study through the night, and cut out all social/rest time.", val: "Achiever" },
        { text: "I get anxious, spend hours planning how to start, and end up overwhelmed.", val: "Overthinker" },
        { text: "I feel paralyzed, log into social media/games, and try to escape the anxiety.", val: "Avoider" },
        { text: "I ignore my schedule to support friends or family going through tough times.", val: "Caregiver" },
        { text: "I work in intense creative bursts, but crash completely afterwards.", val: "Sprinter" }
      ]
    },
    {
      question: "What is the primary way you spend your 'free time' when you should be studying?",
      options: [
        { text: "doomscrolling reels/tiktoks or looking at peer accomplishments.", val: "Avoider" },
        { text: "Over-analyzing my future career path or worrying about missing out.", val: "Overthinker" },
        { text: "Running errands, helping peers, or catching up on calls with family.", val: "Caregiver" },
        { text: "Working on secondary side projects or learning extra courses.", val: "Achiever" },
        { text: "No plan, I jump between random tasks and sleep odd hours.", val: "Sprinter" }
      ]
    },
    {
      question: "Which statement best describes your feelings after taking a rest day?",
      options: [
        { text: "Guilt. I feel like I'm falling behind my peers.", val: "Achiever" },
        { text: "Restless. I try to rest but my brain is still scanning my homework list.", val: "Overthinker" },
        { text: "Fine, it helps me ignore my tasks for a while, though the backlog remains.", val: "Avoider" },
        { text: "I enjoy it if I spend it connecting with people, otherwise I feel lonely.", val: "Caregiver" },
        { text: "Refreshing, but I struggle to switch back to deep focus mode afterwards.", val: "Sprinter" }
      ]
    },
    {
      question: "How specific is your daily schedule?",
      options: [
        { text: "Non-existent. I just study whatever feels urgent.", val: "Avoider" },
        { text: "Vague. E.g. 'Study DSA in evening' – but I struggle to follow it.", val: "Sprinter" },
        { text: "Extremely detailed timetables, but I often fail to meet my own high standards.", val: "Overthinker" },
        { text: "My calendar is dictated by group study projects and peer meetings.", val: "Caregiver" },
        { text: "I work whenever I have energy, regardless of what's written down.", val: "Achiever" }
      ]
    },
    {
      question: "What is your sleep quality like during exam season?",
      options: [
        { text: "I sleep 4-5 hours to squeeze in extra study time.", val: "Achiever" },
        { text: "I lie awake for hours, simulating study scenarios in my head.", val: "Overthinker" },
        { text: "I over-sleep (9+ hours) as a coping mechanism to avoid facing study targets.", val: "Avoider" },
        { text: "Chaotic. I sleep at different times to sync up with my study group.", val: "Caregiver" },
        { text: "I pull all-nighters followed by huge crash sleeps.", val: "Sprinter" }
      ]
    }
  ];

  const handleQuizAnswer = (optionVal: string) => {
    const nextAnswers = { ...quizAnswers, [quizStep]: optionVal };
    setQuizAnswers(nextAnswers);

    if (quizStep < onboardingQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate final profile
      const counts: Record<string, number> = {};
      Object.values(nextAnswers).forEach((val) => {
        const key = val as string;
        counts[key] = (counts[key] || 0) + 1;
      });

      let assignedProfile: any = "Overthinker";
      let maxCount = 0;
      Object.keys(counts).forEach((key) => {
        if (counts[key] > maxCount) {
          maxCount = counts[key];
          assignedProfile = key;
        }
      });

      const updated = {
        ...state,
        onboardingCompleted: true,
        profile: assignedProfile,
        onboardingAnswers: nextAnswers,
      };
      syncState(updated);
    }
  };

  // Onboarding Profile details
  const profileDetails: Record<string, { title: string; desc: string; trigger: string; advice: string }> = {
    Achiever: {
      title: "🎯 The High Achiever",
      desc: "Driven, structured, and goal-oriented. You find satisfaction in checkbox completion, but suffer from chronic task guilt and push rest aside, placing you at a high risk of sudden burnout.",
      trigger: "Rigid study marathons, skipped meals, zero downtime.",
      advice: "Rule 4: Make rest satisfying. Schedule mandatory 'Recovery' blocks (gym, walking, music) and treat them as non-negotiable tasks. Remember, recovery is active fuel, not laziness.",
    },
    Overthinker: {
      title: "🧠 The Strategic Overthinker",
      desc: "Detail-oriented, analytical, and highly organized in theory. You spend massive mental energy building perfect schedules, but minor setbacks spark high anxiety and avoidance loops.",
      trigger: "Complex schedules, peer comparison, fear of incomplete tasks.",
      advice: "Rule 3: Make it easy. Simplify your cues down to micro-actions. Instead of writing 'Study DSA', write 'Open DSA website at desk'. Master the 2-minute starter to bypass mental barriers.",
    },
    Caregiver: {
      title: "🤝 The Peer Caregiver",
      desc: "Empathetic, social, and supportive. You are the first to volunteer to help others. However, you constantly deprioritize your own academic schedule, leading to silent panic as deadlines loom.",
      trigger: "Saying yes to every peer study session, taking on extra tasks.",
      advice: "Set firm time blocks for yourself (Rule 1: Make it Obvious). Design a cue: 'After I complete my 1-hour solo study block, I am free to help my friends.' Create boundaries.",
    },
    Avoider: {
      title: "🌀 The Comfort Avoider",
      desc: "Spontaneous and comfort-driven. Under high stress, your brain immediately flags study tasks as threats, pushing you into doomscrolling, gaming, or avoidance guilt.",
      trigger: "Large, vague tasks scheduled late at night when energy is low.",
      advice: "Rule 1: Make it Invisible. Place your phone in another room. Rule 2: Make it Attractive. Pair your avoidance habit with something you love: e.g. 'Only listen to my favorite lo-fi playlist while solving questions.'",
    },
    Sprinter: {
      title: "⚡ The Pulse Sprinter",
      desc: "Energetic and burst-driven. You excel when working under tight pressure, leading to high-performance nights. But your routines are unstable, causing major sleep debts and crash-cycles.",
      trigger: "Waiting until the last 48 hours to start assignments.",
      advice: "Build micro-consistency. Keep a streak score (Rule 4: Make it Satisfying). Even in off-weeks, complete 5 minutes of study daily to protect your neuro-habits.",
    },
  };

  // Add Habit function (Atomic Habits Cue/Location/Action template)
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.cue || !newHabit.location || !newHabit.action) return;

    const habit: AtomicHabit = {
      id: crypto.randomUUID(),
      cue: newHabit.cue.trim(),
      location: newHabit.location.trim(),
      action: newHabit.action.trim(),
      successRate: 100,
      completionCount: 0,
      totalTarget: 1,
      category: newHabit.category,
      streak: 0,
      duration: newHabit.duration || 25,
    };

    const updated = {
      ...state,
      habits: [...state.habits, habit],
    };
    syncState(updated);
    setNewHabit({ cue: "", location: "", action: "", category: "Growth", duration: 25 });
  };

  // Delete Habit
  const handleDeleteHabit = (id: string) => {
    const updated = {
      ...state,
      habits: state.habits.filter((h) => h.id !== id),
    };
    syncState(updated);
  };

  // Log manual activity (Growth / Recovery / Leakage)
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.description) return;

    const computedDuration = newActivity.category === "Growth" ? 45 
                           : newActivity.category === "Recovery" ? 30 
                           : 15;

    const activity: ScheduleActivity = {
      id: crypto.randomUUID(),
      category: newActivity.category,
      description: newActivity.description.trim(),
      duration: computedDuration,
      timestamp: new Date().toISOString(),
    };

    // Award XP based on category
    const xpAwards = { ...state.xp };
    if (newActivity.category === "Growth") {
      xpAwards.growth += Math.floor(computedDuration * 0.8);
    } else if (newActivity.category === "Recovery") {
      xpAwards.selfCare += Math.floor(computedDuration * 0.5);
      xpAwards.social += Math.floor(computedDuration * 0.3);
    }

    const updated = {
      ...state,
      activities: [...state.activities, activity],
      xp: xpAwards,
    };
    syncState(updated);
    setNewActivity({ category: "Growth", description: "" });
  };

  // Timer focus logic
  const startTimer = (habit: AtomicHabit) => {
    const targetMins = habit.duration || 25;
    setTimerHabit(habit);
    setTimeLeft(targetMins * 60);
    setTimerTotal(targetMins * 60);
    setTimerActive(true);
    setTimerPaused(false);
    setTimerPauseCount(0);
    setBreathingPhase("in");

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          completeFocusSession(habit, targetMins, timerPauseCount);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const togglePauseTimer = () => {
    const targetMins = timerHabit?.duration || 25;
    if (timerPaused) {
      setTimerPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            completeFocusSession(timerHabit!, targetMins, timerPauseCount + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimerPaused(true);
      setTimerPauseCount((prev) => prev + 1);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    setTimerActive(false);
    setTimerHabit(null);
  };

  const completeFocusSession = (habit: AtomicHabit, mins: number, pauses: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    setTimerActive(false);

    // Create custom completed activity
    const activity: ScheduleActivity = {
      id: crypto.randomUUID(),
      category: habit.category,
      description: `Deep Focus: ${habit.action} (Pauses: ${pauses})`,
      duration: mins,
      timestamp: new Date().toISOString(),
    };

    // Calculate XP
    const xpAwards = { ...state.xp };
    xpAwards.focus += Math.floor(mins * 1.5); // Focus session awards premium focus XP
    if (habit.category === "Growth") {
      xpAwards.growth += mins;
    } else if (habit.category === "Recovery") {
      xpAwards.selfCare += mins;
    }

    // Update habit statistics
    const updatedHabits = state.habits.map((h) => {
      if (h.id === habit.id) {
        const nextComp = h.completionCount + 1;
        const nextTarget = h.totalTarget + 1;
        const streakMultiplier = pauses === 0 ? 1 : 0; // lock streak on clean sessions
        return {
          ...h,
          completionCount: nextComp,
          totalTarget: nextTarget,
          successRate: Math.round((nextComp / nextTarget) * 100),
          streak: streakMultiplier === 1 ? h.streak + 1 : h.streak,
        };
      }
      return h;
    });

    const updated = {
      ...state,
      activities: [...state.activities, activity],
      xp: xpAwards,
      habits: updatedHabits,
    };
    syncState(updated);
    setTimerHabit(null);
    alert(`🎉 Brilliant Focus Session! You completed your habit: "${habit.action}". You earned +${Math.floor(mins * 1.5)} Focus XP!`);
  };

  // AI Mentor Chat Client Integration with Local Fallback
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setIsChatSending(true);

    // AI thinking state
    setChatMessages((prev) => [...prev, { sender: "bot", text: "Writing..." }]);

    try {
      // 1. Prepare chat context history
      const recentMessages = chatMessages
        .filter(m => m.text !== "Writing...")
        .map(m => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text
        }));

      recentMessages.push({ role: "user", content: userText });

      // 2. Call server function
      const response = await sendChatMessage({
        data: {
          messages: recentMessages,
          aliasId: aliasId || undefined
        }
      });

      // Remove the temporary "Writing..." placeholder
      setChatMessages((prev) => prev.filter(m => m.text !== "Writing..."));

      if (response && !response.error && response.content) {
        setChatMessages((prev) => [...prev, { sender: "bot", text: response.content }]);
      } else {
        // Fallback: Smart local rule-based advisor tailored to their profile and habits
        const fallbackText = getLocalAiMentorResponse(userText, state);
        setChatMessages((prev) => [...prev, { sender: "bot", text: fallbackText }]);
      }
    } catch (e) {
      setChatMessages((prev) => prev.filter(m => m.text !== "Writing..."));
      const fallbackText = getLocalAiMentorResponse(userText, state);
      setChatMessages((prev) => [...prev, { sender: "bot", text: fallbackText }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Local rule-based fallback responder for AI Mentor
  const getLocalAiMentorResponse = (input: string, currentState: ScheduleArchitectState): string => {
    const text = input.toLowerCase();
    const profile = currentState.profile || "Overthinker";
    const habitsCount = currentState.habits.length;
    const weekStreak = currentState.habits.reduce((acc, h) => Math.max(acc, h.streak), 0);

    if (text.includes("hello") || text.includes("hey") || text.includes("hi")) {
      return `Hey there! As a ${profile}, how is your energy looking today? We have ${habitsCount} habits designed on your Schedule Architect board. How can I help you optimize them?`;
    }

    if (text.includes("atomic") || text.includes("book") || text.includes("habit")) {
      return `James Clear's 'Atomic Habits' is all about designing cues and removing friction. 
- Rule 1: Make it Obvious (Specify location & cue).
- Rule 2: Make it Attractive (Pair study with something nice).
- Rule 3: Make it Easy (Reduce focus time to 15 mins to start).
- Rule 4: Make it Satisfying (Your XP rewards dashboard).
Which habit are we struggling with right now?`;
    }

    if (text.includes("burnout") || text.includes("tired") || text.includes("exhausted") || text.includes("stress")) {
      return `I hear you, and that feeling is valid. As a ${profile}, you are highly susceptible to exhaustion because you tend to avoid recovery or worry too much. Look at your Recovery tracker today. What is one small recovery cue you can schedule? E.g., 'After shutting my screen, walk outside for 10 minutes.' Let's focus on refueling. 🫂`;
    }

    if (text.includes("procrastinate") || text.includes("lazy") || text.includes("avoid")) {
      return `Procrastination isn't a laziness issue, it's emotional regulation. Your brain sees the task as a threat and runs to 'Leakage' (doomscrolling). 
Try the 2-Minute Rule: Open the task card, click 'Start Focus Session', and commit to only 2 minutes. Once you start, momentum takes over!`;
    }

    if (text.includes("dsa") || text.includes("study") || text.includes("coding")) {
      return `To make study consisten, look at your cues. Is 'Hostel Desk' too distracting? Try moving to the Library at 4 PM (Rule 1: Make it Obvious). And remember, Growth XP is awarded for consistency, not perfection!`;
    }

    return `That's a really interesting point. As a ${profile}, one key leverage point for you is simplifying your cues. Let's make sure your cues are tied to actions you already do (like 'After having morning coffee'). What do you think about tweaking your routine to include this?`;
  };

  // Helper calculation metrics
  const totalHoursLog = state.activities.reduce((acc, a) => acc + a.duration, 0);
  const growthMins = state.activities.filter(a => a.category === "Growth").reduce((acc, a) => acc + a.duration, 0);
  const recoveryMins = state.activities.filter(a => a.category === "Recovery").reduce((acc, a) => acc + a.duration, 0);
  const leakageMins = state.activities.filter(a => a.category === "Leakage").reduce((acc, a) => acc + a.duration, 0);

  const growthRatio = totalHoursLog ? Math.round((growthMins / totalHoursLog) * 100) : 0;
  const recoveryRatio = totalHoursLog ? Math.round((recoveryMins / totalHoursLog) * 100) : 0;
  const leakageRatio = totalHoursLog ? Math.round((leakageMins / totalHoursLog) * 100) : 0;

  // Dynamic risk calculation logic
  const burnoutRisk = Math.min(100, Math.max(10, Math.round(
    (state.profile === "Achiever" || state.profile === "Sprinter" ? 30 : 10) +
    (growthMins > recoveryMins * 2 ? 40 : 0) +
    (state.activities.length > 5 && recoveryMins < 30 ? 25 : 0)
  )));

  const procrastinationRisk = Math.min(100, Math.max(10, Math.round(
    (state.profile === "Avoider" ? 40 : 15) +
    (leakageMins > growthMins ? 35 : 0) +
    (state.habits.some(h => h.successRate < 50) ? 20 : 0)
  )));

  const academicRisk = Math.min(100, Math.max(10, Math.round(
    (state.habits.length === 0 ? 30 : 0) +
    (state.habits.length > 0 && state.habits.every(h => h.successRate < 60) ? 45 : 0) +
    (growthMins < 20 ? 25 : 0)
  )));

  const isolationRisk = Math.min(100, Math.max(10, Math.round(
    (state.profile === "Caregiver" ? 10 : 20) +
    (state.xp.social < 20 ? 40 : 0) +
    (recoveryMins < 15 ? 30 : 0)
  )));

  const totalXp = state.xp.growth + state.xp.focus + state.xp.selfCare + state.xp.social;

  if (identityLoading || !isMounted || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Schedule Architect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900 relative overflow-x-hidden">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Sync Indicator */}
        <div className="absolute right-8 top-24 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
          {isSyncing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin text-primary" />
              Syncing to Supabase...
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              Synced to Supabase
            </>
          )}
        </div>

        {/* --- ONBOARDING STAGE --- */}
        {!state.onboardingCompleted ? (
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[3rem] p-8 sm:p-12 border border-emerald-100 shadow-2xl dark:shadow-none relative"
            >
              <div className="absolute -top-10 -left-10 h-32 w-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-calm/5 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-150 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                Schedule Architect Onboarding
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight text-slate-800 dark:text-slate-200 mb-2">
                Find Your <span className="text-gradient">Habit Blueprint</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-semibold mb-8 text-sm sm:text-base leading-relaxed">
                Atomic Habits states: "You do not rise to the level of your goals. You fall to the level of your systems." Let's identify your productivity type and build your system.
              </p>

              {/* Progress Indicator */}
              <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full mb-8 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-350"
                  style={{ width: `${((quizStep + 1) / onboardingQuestions.length) * 100}%` }}
                />
              </div>

              <div className="mb-8">
                <p className="text-xs uppercase font-black text-primary tracking-widest mb-2">Question {quizStep + 1} of {onboardingQuestions.length}</p>
                <h3 className="font-display text-2xl font-black text-slate-800 dark:text-slate-200 leading-snug">
                  {onboardingQuestions[quizStep].question}
                </h3>
              </div>

              <div className="space-y-3">
                {onboardingQuestions[quizStep].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(opt.val)}
                    className="w-full text-left p-5 rounded-3xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:bg-emerald-50/20 active:bg-emerald-50/50 transition-all duration-200 flex gap-4 items-center group shadow-sm dark:shadow-none"
                  >
                    <div className="h-8 w-8 rounded-2xl bg-slate-50 dark:bg-slate-900 group-hover:bg-primary/10 flex items-center justify-center font-black text-slate-400 group-hover:text-primary transition-colors text-xs shrink-0">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-bold text-sm leading-relaxed">{opt.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* --- MAIN SCHEDULE ARCHITECT DASHBOARD STAGE --- */
          <div className="space-y-8">
            
            {/* Header section with branding & User profile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/25 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-3">
                  <Zap className="h-4 w-4" />
                  Wellness Intelligence Hub
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight text-slate-800 dark:text-slate-200">
                  Your Behavioral <span className="text-gradient">Story</span>
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400 font-semibold max-w-2xl text-sm sm:text-base leading-relaxed">
                  Based on the framework of Atomic Habits, build consistency, manage leakage, and protect your mind. Every pattern you log here becomes the context your volunteer uses to support you better.
                </p>
              </div>

              {/* Profile Card Summary */}
              {state.profile && (
                <div className="glass-card rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4 relative overflow-hidden shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-shadow">
                  <div className="h-16 w-16 shrink-0 rounded-[1.75rem] gradient-wellness flex items-center justify-center text-white shadow-lg dark:shadow-none">
                    {state.profile === "Achiever" && <Zap className="h-8 w-8" />}
                    {state.profile === "Overthinker" && <Brain className="h-8 w-8" />}
                    {state.profile === "Caregiver" && <Users className="h-8 w-8" />}
                    {state.profile === "Avoider" && <RotateCcw className="h-8 w-8" />}
                    {state.profile === "Sprinter" && <TrendingUp className="h-8 w-8" />}
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">Your Focus Profile</span>
                    <h3 className="font-display text-xl font-black text-slate-800 dark:text-slate-200 mt-0.5">
                      {profileDetails[state.profile].title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                      {profileDetails[state.profile].desc}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm("Reset onboarding test? This will reset your profile type.")) {
                        const updated = { ...state, onboardingCompleted: false, profile: null };
                        syncState(updated);
                        setQuizStep(0);
                      }
                    }}
                    className="absolute right-4 top-4 p-1 hover:bg-slate-100 dark:bg-slate-900 rounded-full text-slate-300 hover:text-slate-500 dark:text-slate-400 transition-colors"
                    title="Retake Onboarding Questionnaire"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 pb-1 scrollbar-none">
              {[
                { id: "dashboard", label: "My Overview", icon: Activity },
                { id: "habits", label: "Daily Patterns", icon: BookOpen },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${
                      active
                        ? "bg-slate-900 text-white shadow-md dark:shadow-none"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-900 hover:text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* --- TAB CONTENT AREA --- */}
            <AnimatePresence mode="wait">
              {/* 1. DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* XP / Reward HUD & Risk Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* XP Scoreboard Card */}
                    <div className="md:col-span-2 glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total System XP</span>
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{totalXp} XP</span>
                        </div>
                        <h2 className="font-display text-5xl font-black text-slate-800 dark:text-slate-200 tracking-tight leading-none mb-1">
                          {totalXp}
                          <span className="text-2xl text-slate-400 font-bold ml-1">XP</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                          Consistency reward system. Complete study sessions and recovery blocks to build leveling streaks.
                        </p>
                      </div>

                      {/* XP breakdown */}
                      <div className="grid grid-cols-4 gap-2 mt-6">
                        {[
                          { label: "Growth", xp: state.xp.growth, color: "bg-emerald-100 text-emerald-950 font-extrabold border-emerald-300" },
                          { label: "Focus", xp: state.xp.focus, color: "bg-cyan-150 text-cyan-950 font-extrabold border-cyan-300" },
                          { label: "Self-Care", xp: state.xp.selfCare, color: "bg-rose-100 text-rose-950 font-extrabold border-rose-350" },
                          { label: "Social", xp: state.xp.social, color: "bg-indigo-100 text-indigo-950 font-extrabold border-indigo-300" },
                        ].map((xpItem) => (
                          <div key={xpItem.label} className={`p-3 rounded-2xl ${xpItem.color} text-center flex flex-col justify-center border`}>
                            <span className="text-[10px] font-black uppercase tracking-wider block opacity-95">{xpItem.label}</span>
                            <span className="text-base font-black mt-1 block">{xpItem.xp}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Behavioral Dashboard meters */}
                    <div className="md:col-span-2 surface-card rounded-[2.5rem] p-8 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Daily Behavioral Ratio</span>
                        
                        <div className="space-y-4">
                          {[
                            { label: "🌱 Growth (Study, Code, Gym)", ratio: growthRatio, color: "bg-emerald-500", text: "text-emerald-600", mins: growthMins },
                            { label: "☁ Recovery (Rest, Friends, Hobby)", ratio: recoveryRatio, color: "bg-cyan-500", text: "text-cyan-600", mins: recoveryMins },
                            { label: "⚠ Leakage (Doomscroll, Comparison)", ratio: leakageRatio, color: "bg-rose-500", text: "text-rose-600", mins: leakageMins }
                          ].map((item) => (
                            <div key={item.label} className="space-y-1">
                              <div className="flex justify-between text-xs font-black text-slate-700 dark:text-slate-300">
                                <span>{item.label}</span>
                                <span className={item.text}>{item.ratio}% <span className="text-slate-300 font-bold">({item.mins}m)</span></span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                                <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${item.ratio}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-slate-400 leading-relaxed mt-4">
                        Ideal System: 50% Growth, 30% Recovery, 20% Leakage. Design cues to align your balance.
                      </div>
                    </div>
                  </div>

                  {/* Predictive Risk Metrics dials */}
                  <div className="surface-card rounded-[2.5rem] p-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-6">AI Behavioral Risk Engines</span>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: "Burnout Risk", val: burnoutRisk, desc: "Rushed growth vs rest ratio" },
                        { label: "Procrastination", val: procrastinationRisk, desc: "High leakage avoiding cue" },
                        { label: "Academic Risk", val: academicRisk, desc: "Routine completion index" },
                        { label: "Social Isolation", val: isolationRisk, desc: "Connection & peer contact rate" }
                      ].map((risk) => {
                        let colorClass = "text-emerald-500";
                        let progressColor = "bg-emerald-500";
                        if (risk.val > 65) {
                          colorClass = "text-rose-500 animate-pulse";
                          progressColor = "bg-rose-500";
                        } else if (risk.val > 35) {
                          colorClass = "text-amber-500";
                          progressColor = "bg-amber-500";
                        }

                        return (
                          <div key={risk.label} className="p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-sm dark:shadow-none transition-shadow">
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{risk.label}</span>
                              <h4 className={`font-display text-3xl font-black mt-2 ${colorClass}`}>
                                {risk.val}%
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                                {risk.desc}
                              </p>
                            </div>
                            <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden mt-4">
                              <div className={`${progressColor} h-full transition-all duration-500`} style={{ width: `${risk.val}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Log Activity and AI Routine Optimization block */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Log Activity Form */}
                    <div className="lg:col-span-1 glass-card rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col justify-between">
                      <form onSubmit={handleAddActivity} className="space-y-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Log Daily Activity</span>
                          <h3 className="font-display text-2xl font-black text-slate-800 dark:text-slate-200">Track Behavior</h3>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Category</label>
                          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                            {["Growth", "Recovery", "Leakage"].map((cat) => (
                              <button
                                type="button"
                                key={cat}
                                onClick={() => setNewActivity({ ...newActivity, category: cat as any })}
                                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                                  newActivity.category === cat
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Activity Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. studied math, browsed reels, gym"
                            value={newActivity.description}
                            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary/40 bg-white dark:bg-slate-950 mb-4"
                          />
                          <Button type="submit" className="w-full rounded-2xl py-3 bg-slate-950 hover:bg-slate-900 font-black text-xs uppercase tracking-widest shrink-0">
                            Log Activity
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* AI Suggestions Box */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50/40 to-white dark:from-slate-900 dark:to-slate-950 rounded-[2.5rem] p-8 sm:p-10 border border-indigo-100/30 dark:border-white/5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                      {/* Gentle blur background */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <Heart className="h-3 w-3 text-indigo-500" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500/80">
                            A Gentle Reminder
                          </span>
                        </div>
                        <h3 className="font-display text-2xl font-medium text-slate-800 dark:text-slate-200 mb-8 tracking-tight">Words of Comfort & Care</h3>

                        <div className="space-y-4">
                          {aiSuggestions.map((sug, i) => {
                            const isWarning = sug.startsWith("⚠️") || sug.startsWith("🚨");
                            return (
                              <div
                                key={i}
                                className={`flex gap-4 p-5 rounded-[1.5rem] border ${
                                  isWarning
                                    ? "bg-rose-50/50 border-rose-100/50 dark:bg-rose-950/20 dark:border-rose-900/30 text-slate-700 dark:text-slate-300"
                                    : "bg-sky-50/50 border-sky-100/50 dark:bg-sky-950/20 dark:border-sky-900/30 text-slate-700 dark:text-slate-300"
                                } transition-all duration-300 hover:shadow-sm`}
                              >
                                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center ${
                                  isWarning ? "bg-rose-100/50 dark:bg-rose-900/40" : "bg-sky-100/50 dark:bg-sky-900/40"
                                }`}>
                                  {isWarning ? <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> : <Info className="h-3.5 w-3.5 text-sky-500" />}
                                </div>
                                <p className="text-[14px] font-medium leading-[1.7] tracking-tight">{sug}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-400 font-medium relative z-10">
                        <span>Take a deep breath, you're doing fine.</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-400">A Safe Space</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Log Feed */}
                  <div className="surface-card rounded-[2.5rem] p-8">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Daily Activity Feed</span>
                    {state.activities.length === 0 ? (
                      <p className="text-sm text-slate-400 font-bold text-center py-6">No activities logged for today yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                        {state.activities.slice().reverse().map((a) => (
                          <div key={a.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                a.category === "Growth" ? "bg-emerald-100 text-emerald-700" :
                                a.category === "Recovery" ? "bg-cyan-100 text-cyan-700" : "bg-rose-100 text-rose-700"
                              }`}>
                                {a.category}
                              </span>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.description}</span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 font-bold text-xs">
                              <span>{a.duration} mins</span>
                              <span>{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <button 
                                onClick={() => {
                                  const updated = {
                                    ...state,
                                    activities: state.activities.filter(act => act.id !== a.id)
                                  };
                                  syncState(updated);
                                }}
                                className="text-slate-300 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 2. HABITS TAB (Schedule Architect Board) */}
              {activeTab === "habits" && (
                <motion.div
                  key="habits"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* Atomic Habit Builder Form */}
                  <div className="glass-card rounded-[3.5rem] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                    <div className="max-w-3xl">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-150 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary mb-4">
                        <Sparkles className="h-4 w-4" />
                        Atomic Habit Builder
                      </div>
                      <h2 className="font-display text-4xl font-black text-slate-800 dark:text-slate-200 leading-tight mb-2">Schedule Architect</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-semibold mb-8 text-sm sm:text-base leading-relaxed">
                        Design specific, obvious routines. Complete studies (Growth) or restorative buffers (Recovery) directly from your checklist.
                      </p>

                      <form onSubmit={handleAddHabit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Rule 1: Cue (Obvious)</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. After dinner, After waking up"
                              value={newHabit.cue}
                              onChange={(e) => setNewHabit({ ...newHabit, cue: e.target.value })}
                              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary/40 bg-white dark:bg-slate-950 shadow-inner"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Rule 2: Location (Easy)</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. At hostel desk, In room balcony"
                              value={newHabit.location}
                              onChange={(e) => setNewHabit({ ...newHabit, location: e.target.value })}
                              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary/40 bg-white dark:bg-slate-950 shadow-inner"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Rule 3: Action (Specific)</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Solve 1 DSA question, Read 5 pages"
                              value={newHabit.action}
                              onChange={(e) => setNewHabit({ ...newHabit, action: e.target.value })}
                              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary/40 bg-white dark:bg-slate-950 shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                          {/* Target Duration Field */}
                          <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Target Duration (Minutes)</label>
                            <input
                              type="text"
                              required
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="25"
                              value={newHabit.duration === 0 ? "" : newHabit.duration}
                              onKeyDown={(e) => {
                                // Block symbols and allow only numbers, backspace, delete, arrows, tabs
                                if (
                                  !/[0-9]/.test(e.key) &&
                                  e.key !== "Backspace" &&
                                  e.key !== "Delete" &&
                                  e.key !== "Tab" &&
                                  e.key !== "ArrowLeft" &&
                                  e.key !== "ArrowRight" &&
                                  e.key !== "Enter"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                // Filter out non-numeric characters just in case of copy-paste
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                setNewHabit({ ...newHabit, duration: val === "" ? 0 : parseInt(val) || 0 });
                              }}
                              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary/40 bg-white dark:bg-slate-950 shadow-inner"
                            />
                          </div>

                          {/* Category selection */}
                          <div className="md:col-span-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">Routine Category</label>
                              <div className="flex gap-2">
                                {["Growth", "Recovery"].map((cat) => (
                                  <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setNewHabit({ ...newHabit, category: cat as any })}
                                    className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                                      newHabit.category === cat
                                        ? "bg-slate-900 border-slate-900 text-white"
                                        : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-450 hover:text-slate-800 dark:text-slate-200"
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <Button type="submit" className="rounded-full bg-primary hover:bg-primary/95 text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 shadow-lg dark:shadow-none shadow-primary/20 shrink-0 self-end">
                              <Plus className="h-4 w-4 mr-2" /> Add System Habit
                            </Button>
                          </div>
                        </div>

                        {/* Live preview + 30-Day Projections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-10">
                          {/* Left Box: Live habits output */}
                          <div className="p-6 sm:p-8 rounded-[1.5rem] bg-gradient-to-br from-indigo-50/90 to-white dark:from-slate-900/90 dark:to-slate-950 border border-indigo-100/30 dark:border-white/5 shadow-sm relative overflow-hidden group flex flex-col justify-center transition-all duration-500 h-fit">
                            {/* Decorative background blur */}
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-400/5 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <div className="relative z-10 max-w-lg">
                              <div className="inline-flex items-center gap-2 mb-6">
                                <div className="h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                  <Heart className="h-2.5 w-2.5 text-indigo-500" />
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500/80">A Gentle Promise</span>
                              </div>
                              
                              <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 leading-[1.8] tracking-tight">
                                {newHabit.cue && newHabit.location && newHabit.action ? (
                                  <span>
                                    "When <span className="text-slate-900 dark:text-white font-semibold border-b border-indigo-200 dark:border-indigo-500/30 pb-0.5">{newHabit.cue}</span> happens, I will protect my peace by choosing to go to <span className="text-slate-900 dark:text-white font-semibold border-b border-indigo-200 dark:border-indigo-500/30 pb-0.5">{newHabit.location}</span> and spend <span className="text-slate-900 dark:text-white font-semibold">{newHabit.duration} minutes</span> to <span className="text-indigo-500 font-semibold">{newHabit.action}</span>, because I deserve to grow."
                                  </span>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 italic font-normal">
                                    Every routine is a quiet act of kindness to your future self. Fill out your cue, location, and specific action above to craft your daily promise.
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Right Box: 30-Day Projection (Human-centered Motivation) */}
                          <div className="p-6 sm:p-8 rounded-[1.5rem] bg-slate-950 dark:bg-black border border-slate-800/60 shadow-xl relative overflow-hidden flex flex-col justify-between">
                            {/* Ambient glow - Soft Sky/Teal */}
                            <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                            
                            <div className="relative z-10">
                              <span className="inline-flex items-center gap-2 mb-5">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Your Journey Ahead</span>
                              </span>

                              {(() => {
                                const motive = parseActionMotivation(newHabit.action, newHabit.duration);
                                return (
                                  <div className="space-y-6">
                                    {/* Identity Statement (No Sparkle Box) */}
                                    <div className="pb-1 border-b border-slate-800/50">
                                      <h4 className="text-[11px] font-bold uppercase text-sky-300/90 tracking-[0.15em] mb-1.5">A Kinder You</h4>
                                      <p className="text-[14px] font-medium text-slate-300 leading-relaxed pb-3">
                                        Every time you choose this habit, you become <span className="text-white font-semibold">{motive.identity}</span>.
                                      </p>
                                    </div>

                                    {/* Projections List */}
                                    <ul className="space-y-3 pt-2">
                                      <li className="flex gap-3 items-start group">
                                        <div className="mt-1 flex items-center justify-center h-4 w-4">
                                          <Heart className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                                        </div>
                                        <span className="text-[13px] text-slate-400 leading-relaxed font-medium">Find quiet focus and earn <span className="text-slate-200">+{Math.round((newHabit.duration || 25) * 1.5 * 30)} Focus XP</span> through steady practice.</span>
                                      </li>
                                      <li className="flex gap-3 items-start group">
                                        <div className="mt-1 flex items-center justify-center h-4 w-4">
                                          <Activity className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                                        </div>
                                        <span className="text-[13px] text-slate-400 leading-relaxed font-medium">{motive.growthStatText}</span>
                                      </li>
                                      <li className="flex gap-3 items-start group">
                                        <div className="mt-1 flex items-center justify-center h-4 w-4">
                                          <Brain className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                                        </div>
                                        <span className="text-[13px] text-slate-400 leading-relaxed font-medium">{motive.neuroPathwayText}</span>
                                      </li>
                                    </ul>
                                  </div>
                                );
                              })()}
                            </div>

                            {/* The 1% Compounding interest curve chart representation */}
                            <div className="mt-8 pt-6 border-t border-slate-800/50 relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">Growth Trajectory</span>
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full">Things Get Easier</span>
                              </div>
                              <div className="w-full h-[50px] relative">
                                <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                                  <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
                                  <path
                                    d={`M 0,50 C 60,48 120,40 180,25 C 220,15 260,10 300,5`}
                                    fill="none"
                                    stroke="url(#skyGradient)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                  <defs>
                                    <linearGradient id="skyGradient" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#64748b" />
                                      <stop offset="100%" stopColor="#38bdf8" />
                                    </linearGradient>
                                  </defs>
                                  <circle cx="0" cy="50" r="3" className="fill-slate-900 stroke-slate-500 stroke-2" />
                                  <circle cx="180" cy="25" r="3" className="fill-slate-900 stroke-sky-400 stroke-2" />
                                  <circle cx="300" cy="5" r="4" className="fill-sky-400 shadow-glow" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Active Habits list */}
                  <div>
                    <h2 className="font-display text-2xl font-black text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                      <BookOpen className="h-6 w-6 text-primary" /> Active Habits System ({state.habits.length})
                    </h2>

                    {state.habits.length === 0 ? (
                      <div className="surface-card rounded-[2.5rem] p-12 text-center">
                        <p className="text-slate-400 font-bold text-sm">No atomic habits designed yet. Build your system above!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {state.habits.map((habit) => (
                          <div
                            key={habit.id}
                            className="surface-card rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md dark:shadow-none transition-shadow relative overflow-hidden group"
                          >
                            {/* Top row */}
                            <div className="flex justify-between items-start gap-4">
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                habit.category === "Growth" ? "bg-emerald-100 text-emerald-750 border border-emerald-200" : "bg-cyan-100 text-cyan-755 border border-cyan-200"
                              }`}>
                                {habit.category} ({habit.duration || 25}m)
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{habit.streak}d Streak 🔥</span>
                                <button 
                                  onClick={() => handleDeleteHabit(habit.id)}
                                  className="text-slate-355 hover:text-rose-500 p-1 rounded-full hover:bg-slate-50 dark:bg-slate-900 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Habit specification */}
                            <div className="my-6">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Atomic Formula</span>
                              <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                                After <span className="text-slate-900 dark:text-slate-50 font-extrabold">{habit.cue}</span>, at <span className="text-slate-900 dark:text-slate-50 font-extrabold">{habit.location}</span>, I will:
                                <span className="block text-slate-900 dark:text-slate-50 font-black text-lg mt-2 group-hover:text-primary transition-colors">
                                  {habit.action}
                                </span>
                              </p>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-3">
                              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                <span>Success Rate</span>
                                <span className="text-primary">{habit.successRate}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${habit.successRate}%` }} />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-2">
                                <span>Completions: {habit.completionCount} / {habit.totalTarget}</span>
                                <Button 
                                  onClick={() => startTimer(habit)}
                                  className="rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 shrink-0 flex items-center gap-1.5 shadow-sm dark:shadow-none"
                                >
                                  <Play className="h-3 w-3" /> Focus ({habit.duration || 25}m)
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* 3. AI MENTOR COACH CHAT TAB */}
              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="mx-auto max-w-4xl w-full h-[650px]"
                >
                  <div className="surface-card rounded-[3.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col shadow-sm dark:shadow-none">
                    <ChatInterface />
                  </div>
                </motion.div>
              )}

              {/* 4. RESILIENCE TOOLKIT TAB */}
              {activeTab === "resilience" && (
                <motion.div
                  key="resilience"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
                    <Sparkles className="h-4 w-4" />
                    Emergency Recovery Suite
                  </div>
                  <h2 className="font-display text-4xl font-black text-slate-800 dark:text-slate-200 leading-tight">Mental Resilience Toolkit</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold max-w-2xl text-sm sm:text-base leading-relaxed">
                    Access immediate grounding guides, breathing visualizers, HALT checks, or reflections. Completing these logs recovery XP to prevent burnout.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "Breathing Room", desc: "4-7-8 Respiratory regulation timer for severe panic.", key: "breathing", icon: Sun, color: "border-amber-100 hover:bg-amber-50/10" },
                      { title: "Grounding Journey", desc: "5-4-3-2-1 Sensory grounding exercises for dissociation.", key: "grounding", icon: Brain, color: "border-cyan-100 hover:bg-cyan-50/10" },
                      { title: "HALT Assessment", desc: "India-curated physical check for academic avoidance.", key: "halt", icon: Shield, color: "border-emerald-100 hover:bg-emerald-50/10" },
                      { title: "Reflection Pad", desc: "Zero-trace emotional dumping pad to offload study guilt.", key: "reflection", icon: BookOpen, color: "border-pink-100 hover:bg-pink-50/10" },
                    ].map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <div
                          key={tool.key}
                          onClick={() => setSelectedResilienceTool(tool.key)}
                          className={`surface-card rounded-[2.5rem] p-8 cursor-pointer border hover:shadow-md dark:shadow-none transition-all hover:-translate-y-1 ${tool.color}`}
                        >
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-primary shadow-inner mb-6">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="font-display text-2xl font-black text-slate-800 dark:text-slate-200 mb-2">{tool.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{tool.desc}</p>
                          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-primary tracking-widest mt-6">
                            Launch Tool <ChevronRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* 5. HELPLINES TAB */}
              {activeTab === "helplines" && (
                <motion.div
                  key="helplines"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-150 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-rose-700">
                    <Phone className="h-4 w-4" />
                    Indian Emergency Support
                  </div>
                  <h2 className="font-display text-4xl font-black text-slate-800 dark:text-slate-200 leading-tight">24/7 Verified Helplines</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold max-w-2xl text-sm sm:text-base leading-relaxed">
                    If you are experiencing severe distress or a crisis, please connect with these verified professional helplines immediately.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CRISIS_HELPLINES.map((helpline) => (
                      <div key={helpline.name} className="surface-card rounded-[2.5rem] p-8 border border-rose-100 flex flex-col justify-between hover:shadow-sm dark:shadow-none transition-shadow">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-display text-2xl font-black text-slate-800 dark:text-slate-200 leading-tight">{helpline.name}</h3>
                            <span className="text-[8px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-0.5 rounded-full shrink-0">
                              {helpline.type}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hours: {helpline.hours}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-50 dark:border-slate-800">
                          <span className="text-lg font-black text-slate-700 dark:text-slate-300">{helpline.number}</span>
                          <a href={`tel:${helpline.number.replace(/\s+/g, "")}`}>
                            <Button className="rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 shadow-md dark:shadow-none shadow-rose-200">
                              Call Now
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Volunteer share sync config footer panel */}
            <div className="surface-card rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-12 bg-emerald-50/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                  <Heart className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">Share my behavioral summary with my volunteer</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-normal mt-1">
                    When enabled, your chosen volunteer sees your focus patterns, habit consistency, and behavioral trends before your session — not your personal data. This helps them support you more meaningfully.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">
                  {state.privacySync ? "Enabled (Encrypted)" : "Disabled (Local only)"}
                </span>
                <button
                  onClick={() => {
                    const nextSync = !state.privacySync;
                    syncState({ ...state, privacySync: nextSync });
                  }}
                  className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                    state.privacySync ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`bg-white dark:bg-slate-950 w-6 h-6 rounded-full shadow-md dark:shadow-none transform transition-transform duration-300 ${
                      state.privacySync ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* --- BREATHING FOCUS TIMER FULLSCREEN OVERLAY --- */}
      {timerActive && timerHabit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4">
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            {/* Breathing circular backdrop pulse glow */}
            <motion.div
              animate={{
                scale: breathingPhase === "in" ? 1.5 : breathingPhase === "hold" ? 1.5 : 1,
                opacity: breathingPhase === "in" ? 0.25 : breathingPhase === "hold" ? 0.35 : 0.1,
              }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl"
            />
          </div>

          <div className="relative z-10 max-w-md w-full bg-slate-900 text-white rounded-[3.5rem] border border-white/10 p-8 sm:p-12 text-center shadow-2xl dark:shadow-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-2">
              Focus Session (Atomic Habit)
            </span>
            <h3 className="font-display text-2xl font-black mb-6 line-clamp-1">
              {timerHabit.action}
            </h3>

            {/* Timer visual circle indicator */}
            <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
              {/* Circular track */}
              <svg className="absolute w-full h-full transform -rotate-95">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress highlight */}
                <motion.circle
                  cx="128"
                  cy="128"
                  r="110"
                  className="stroke-primary"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 110}
                  strokeDashoffset={2 * Math.PI * 110 * (1 - timeLeft / timerTotal)}
                  transition={{ ease: "linear" }}
                />
              </svg>

              {/* Text indicator inside circle */}
              <div className="text-center relative z-10 space-y-1">
                <h2 className="text-4xl font-black font-display text-white tracking-tight">
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </h2>
                {/* Breathing cue text */}
                <motion.p
                  animate={{
                    scale: breathingPhase === "in" ? 1.15 : 1,
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-xs uppercase tracking-[0.25em] font-black text-emerald-400"
                >
                  {breathingText}
                </motion.p>
              </div>
            </div>

            {/* Timer controls */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <button
                onClick={togglePauseTimer}
                className="h-16 w-16 rounded-full bg-white/10 dark:bg-slate-950/10 hover:bg-white/20 dark:bg-slate-950/20 flex items-center justify-center transition-all border border-white/15"
                title={timerPaused ? "Resume Session" : "Pause Session"}
              >
                {timerPaused ? <Play className="h-6 w-6 text-emerald-400" /> : <Pause className="h-6 w-6 text-white" />}
              </button>
              
              <button
                onClick={() => {
                  if (confirm("Stop focus session? You will lose this session's progress.")) {
                    stopTimer();
                  }
                }}
                className="h-12 w-12 rounded-full bg-white/5 dark:bg-slate-950/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all border border-white/5 text-slate-400"
                title="Cancel Focus Session"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  const actualMins = Math.max(1, Math.round((timerTotal - timeLeft) / 60));
                  completeFocusSession(timerHabit, actualMins, timerPauseCount);
                }}
                className="h-12 w-12 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white flex items-center justify-center transition-all border border-emerald-500/30"
                title="Complete Focus Session Early"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
              Rule 3: Make it Easy. Start with a breath, block out the environment, and focus purely on the action step.
            </div>
          </div>
        </div>
      )}

      {/* --- RESILIENCE TOOL MODAL POPUPS --- */}
      <AnimatePresence>
        {selectedResilienceTool && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeResilienceTool}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[3.5rem] shadow-2xl dark:shadow-none overflow-hidden max-h-[85vh] flex flex-col border border-slate-100 dark:border-slate-800"
            >
              <div className="p-8 sm:p-12 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  
                  <button
                    onClick={closeResilienceTool}
                    className="p-2 hover:bg-slate-100 dark:bg-slate-900 rounded-full transition-colors text-slate-350 hover:text-slate-600 dark:text-slate-400"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-8">
                  <span className="text-[9px] font-black uppercase text-primary tracking-widest block mb-1">SoulSync Resilience Center</span>
                  <h2 className="font-display text-3xl font-black text-slate-800 dark:text-slate-200 leading-snug">
                    {selectedResilienceTool === "breathing" && "4-7-8 Breathing Room"}
                    {selectedResilienceTool === "grounding" && "5-4-3-2-1 Grounding Journey"}
                    {selectedResilienceTool === "halt" && "HALT Diagnostic"}
                    {selectedResilienceTool === "reflection" && "Zero-Trace Reflection Pad"}
                  </h2>
                </div>

                <div className="space-y-6">
                  {selectedResilienceTool === "breathing" && <BreathingVisualizer />}
                  {selectedResilienceTool === "grounding" && <GroundingJourney />}
                  {selectedResilienceTool === "halt" && <HALTDiagnostic />}
                  {selectedResilienceTool === "reflection" && <ReflectionPad />}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-150 flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>Active Recovery Mode</span>
                <span>Complete to award Self-Care XP</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default ResourcesPage;

