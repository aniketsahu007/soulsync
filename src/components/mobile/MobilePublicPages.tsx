import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  CalendarClock,
  ClipboardCheck,
  HandHeart,
  HeartHandshake,
  HelpCircle,
  MessageCircleHeart,
  Moon,
  PenLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wind,
} from "lucide-react";

import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { MobileActionCard } from "@/components/mobile/MobileActionCard";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";

const spring = { type: "spring", stiffness: 260, damping: 24 };

function MotionPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const moodOptions = [
  { label: "Great", color: "bg-emerald-500", icon: Sparkles },
  { label: "Good", color: "bg-sky-500", icon: ShieldCheck },
  { label: "Okay", color: "bg-amber-500", icon: Moon },
  { label: "Low", color: "bg-rose-400", icon: HeartHandshake },
  { label: "Hard", color: "bg-slate-700", icon: HandHeart },
];

function QuickMoodStrip() {
  return (
    <div className="rounded-[1.6rem] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">
            Quick Mood
          </p>
          <h2 className="mt-1 font-display text-xl font-black text-slate-950">
            How are you arriving?
          </h2>
        </div>
        <a href="/check-in?view=full" className="text-xs font-black text-emerald-700">
          Open
        </a>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {moodOptions.map((mood) => {
          const Icon = mood.icon;
          return (
            <a
              key={mood.label}
              href="/check-in?view=full"
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 text-[10px] font-black text-slate-600 transition active:scale-95"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${mood.color} text-white`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {mood.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function MobileHomePage() {
  return (
    <MobileLayout subtitle="Harmony, healing, growth">
      <div className="space-y-5">
        <MotionPanel className="rounded-[1.8rem] bg-slate-950 p-5 text-white shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
            Anonymous by design
          </p>
          <h1 className="mt-3 font-display text-[2.35rem] font-black leading-[0.95]">
            A softer place to start.
          </h1>
          <p className="mt-4 text-sm font-medium leading-6 text-slate-300">
            Check in, talk privately, or find a trained peer listener without turning your day into a form.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/chat">
              <Button className="h-12 w-full rounded-2xl font-black">
                Start Chat
              </Button>
            </Link>
            <a href="/peer-match?view=full">
              <Button variant="outline" className="h-12 w-full rounded-2xl border-white/20 bg-white/10 font-black text-white hover:bg-white/15">
                Peer Help
              </Button>
            </a>
          </div>
        </MotionPanel>

        <QuickMoodStrip />

        <div className="space-y-3">
          <MobileActionCard
            to="/resources?view=full"
            icon={Wind}
            title="Wellness Hub and Schedule Architect"
            description="Open the existing full hub with routines, logs, and regulation tools."
            tone="emerald"
          />
          <MobileActionCard
            to="/mood-tracker?view=full"
            icon={TrendingUp}
            title="Mood journal"
            description="Open the existing mood tracker and saved entries."
            tone="sky"
          />
          <MobileActionCard
            to="/community-qna?view=full"
            icon={HelpCircle}
            title="Community Q&A"
            description="Open the existing anonymous question board."
            tone="slate"
          />
          <MobileActionCard
            to="/volunteer"
            icon={HandHeart}
            title="Register as volunteer"
            description="Apply to become a verified peer listener."
            tone="rose"
          />
        </div>
      </div>
    </MobileLayout>
  );
}

export function MobileChatPage() {
  return (
    <MobileLayout title="Companion" subtitle="Private support" className="bg-white">
      <div className="-mx-4 -mt-2 h-[calc(100dvh-11.35rem)] min-h-[28rem] overflow-hidden border-y border-slate-100 bg-white">
        <ChatInterface showHeader={false} mobile />
      </div>
    </MobileLayout>
  );
}

export function MobileCheckInPage() {
  return (
    <MobileLayout title="Check-In" subtitle="One honest signal">
      <div className="space-y-5">
        <MobileSectionHeader
          eyebrow="Today"
          title="Name the feeling."
          description="Choose a quick entry point, then move toward the kind of support that fits this moment."
        />
        <QuickMoodStrip />
        <MobileActionCard
          to="/check-in?view=full"
          icon={ClipboardCheck}
          title="Open full check-in dashboard"
          description="Use the existing mood selector, stats, and journey chart."
          tone="emerald"
        />
        <MobileActionCard
          to="/chat"
          icon={MessageCircleHeart}
          title="Talk through it"
          description="Start a private companion chat now."
          tone="emerald"
        />
        <MobileActionCard
          to="/peer-match?view=full"
          icon={Users}
          title="Match with a peer"
          description="Bring this check-in into a human support session."
          tone="sky"
        />
        <MobileActionCard
          to="/mood-tracker?view=full"
          icon={PenLine}
          title="Add journal context"
          description="Capture a note so your patterns stay visible."
          tone="slate"
        />
      </div>
    </MobileLayout>
  );
}

export function MobileMoodTrackerPage() {
  return (
    <MobileLayout title="Mood Journal" subtitle="Patterns, not pressure">
      <div className="space-y-5">
        <MobileSectionHeader
          eyebrow="Journal"
          title="Track the shape of your week."
          description="Use the full journal tools when you want notes, trends, and saved reflections."
        />
        <div className="rounded-[1.6rem] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-black text-slate-950">
                Your journal lives here
              </h2>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                Mobile keeps the path simple: log a feeling, add context, and return when you are ready.
              </p>
            </div>
          </div>
        </div>
        <MobileActionCard
          to="/mood-tracker?view=full"
          icon={TrendingUp}
          title="Open full mood journal"
          description="Use the existing journal, trends, notes, and entry history."
          tone="emerald"
        />
        <MobileActionCard
          to="/check-in?view=full"
          icon={ClipboardCheck}
          title="Quick check-in"
          description="Start with a fast mood signal."
          tone="sky"
        />
        <MobileActionCard
          to="/resources?view=full"
          icon={BookOpen}
          title="Wellness Hub"
          description="Open Schedule Architect and resilience tools."
          tone="slate"
        />
      </div>
    </MobileLayout>
  );
}

export function MobileResourcesPage() {
  const tools = [
    { to: "/resources?view=full&tab=dashboard", icon: CalendarClock, title: "Schedule Architect", description: "Open the existing routine builder, logs, XP, and recommendations.", tone: "emerald" as const },
    { to: "/resources?view=full&tab=resilience&tool=breathing&origin=mobile", icon: Wind, title: "Breathing visualizer", description: "Open the existing breathing timer directly.", tone: "sky" as const },
    { to: "/resources?view=full&tab=resilience&tool=grounding&origin=mobile", icon: Brain, title: "Grounding journey", description: "Open the existing grounding flow directly.", tone: "slate" as const },
    { to: "/resources?view=full&tab=resilience&tool=reflection&origin=mobile", icon: PenLine, title: "Reflection pad", description: "Open the existing reflection feature directly.", tone: "rose" as const },
    { to: "/mood-tracker?view=full", icon: TrendingUp, title: "Mood Journal", description: "Go to the existing mood tracker.", tone: "emerald" as const },
  ];

  return (
    <MobileLayout title="Wellness Hub" subtitle="Small tools, quick starts">
      <div className="space-y-5">
        <MobileSectionHeader
          eyebrow="Wellness"
          title="Pick the next tiny tool."
          description="The mobile hub is action-first: choose what helps right now and keep moving gently."
        />
        <div className="grid gap-3">
          {tools.map((tool) => (
            <MobileActionCard key={tool.title} {...tool} />
          ))}
        </div>
        <div className="rounded-[1.6rem] border border-emerald-100 bg-emerald-50 p-5">
          <h2 className="font-display text-xl font-black text-emerald-950">
            Need another person?
          </h2>
          <p className="mt-2 text-sm font-medium leading-6 text-emerald-800">
            Switch from self-guided tools to a private chat or trained peer listener at any time.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/chat">
              <Button className="h-11 w-full rounded-2xl font-black">Chat</Button>
            </Link>
            <a href="/peer-match?view=full">
              <Button variant="outline" className="h-11 w-full rounded-2xl bg-white font-black">Peer</Button>
            </a>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}

export function MobilePeerMatchPage() {
  return (
    <MobileLayout title="Peer Support" subtitle="Human follow-up">
      <div className="space-y-5">
        <MobileSectionHeader
          eyebrow="Peer match"
          title="Find a listener at your pace."
          description="Use peer support when a human conversation would feel better than self-guided tools."
        />
        <div className="rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl">
          <CalendarClock className="h-7 w-7 text-emerald-300" />
          <h2 className="mt-4 font-display text-2xl font-black">Book private support</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
            The full matching flow remains available with volunteer slots, notes, and room details.
          </p>
          <motion.div whileTap={{ scale: 0.98 }} transition={spring} className="mt-5">
            <a href="/peer-match?view=full">
              <Button className="h-12 w-full rounded-2xl font-black">
                Continue Matching
              </Button>
            </a>
          </motion.div>
        </div>
        <MobileActionCard
          to="/chat"
          icon={MessageCircleHeart}
          title="Prepare with chat"
          description="Talk first, then bring context to the peer flow."
          tone="emerald"
        />
        <MobileActionCard
          to="/community-qna?view=full"
          icon={HelpCircle}
          title="Read shared questions"
          description="See what other students are asking anonymously."
          tone="slate"
        />
      </div>
    </MobileLayout>
  );
}

export function MobilePartnersPage() {
  return (
    <MobileLayout title="Partners" subtitle="Extended support network">
      <div className="space-y-5">
        <MobileSectionHeader
          eyebrow="Network"
          title="Support beyond SoulSync."
          description="Browse partner organizations and pathways for broader help."
        />
        <MobileActionCard
          to="/partners?view=full"
          icon={HeartHandshake}
          title="Verified NGO network"
          description="See organizations connected to the SoulSync safety net."
          tone="emerald"
        />
        <MobileActionCard
          to="/peer-match?view=full"
          icon={Users}
          title="Start with peer support"
          description="A trained listener can help you decide what support fits."
          tone="sky"
        />
        <MobileActionCard
          to="/privacy-policy?view=full"
          icon={ShieldCheck}
          title="Privacy first"
          description="Understand how anonymous support data is handled."
          tone="slate"
        />
      </div>
    </MobileLayout>
  );
}

export function MobileCommunityQnAPage() {
  return (
    <MobileLayout title="Community" subtitle="Anonymous, shared, human">
      <div className="space-y-5">
        <MobileSectionHeader
          eyebrow="Q&A"
          title="You are not the only one."
          description="Read common student questions, relate quietly, or add your own when you are ready."
        />
        <MobileActionCard
          to="/community-qna?view=full"
          icon={HelpCircle}
          title="Open community board"
          description="Ask or answer anonymously in the full Q&A flow."
          tone="emerald"
        />
        <MobileActionCard
          to="/chat"
          icon={MessageCircleHeart}
          title="Talk privately first"
          description="Use companion chat before posting publicly."
          tone="sky"
        />
        <MobileActionCard
          to="/peer-match?view=full"
          icon={Users}
          title="Bring it to a peer"
          description="Turn a question into a supportive conversation."
          tone="slate"
        />
      </div>
    </MobileLayout>
  );
}

export function MobilePrivacyPolicyPage() {
  return (
    <MobileLayout title="Privacy" subtitle="Anonymous by design">
      <div className="space-y-5">
        <MobileSectionHeader
          eyebrow="Privacy first"
          title="Your identity stays protected."
          description="SoulSync is designed around anonymous support, limited sharing, and user-controlled context."
        />
        {[
          ["Anonymous identifiers", "Support flows use an alias rather than a campus-facing identity."],
          ["Controlled sharing", "Volunteer context is only shared when the support flow needs it."],
          ["Secure storage", "Supabase policies and app-side boundaries protect sensitive records."],
          ["Data questions", "Contact SoulSync for privacy questions or deletion requests."],
        ].map(([title, description]) => (
          <div key={title} className="rounded-[1.35rem] border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{description}</p>
          </div>
        ))}
        <a href="mailto:Soulsyncsoul@gmail.com">
          <Button className="h-12 w-full rounded-2xl font-black">
            Contact Privacy Team
          </Button>
        </a>
      </div>
    </MobileLayout>
  );
}
