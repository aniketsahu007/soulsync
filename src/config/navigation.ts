import {
  BookOpen,
  ClipboardCheck,
  HeartHandshake,
  HelpCircle,
  Home,
  MessageCircleHeart,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AppRoutePath =
  | "/"
  | "/chat"
  | "/check-in"
  | "/mood-tracker"
  | "/resources"
  | "/peer-match"
  | "/partners"
  | "/community-qna"
  | "/privacy-policy"
  | "/volunteer";

export interface NavigationItem {
  to: AppRoutePath;
  label: string;
  shortLabel: string;
  desc: string;
  icon: LucideIcon;
  group: "primary" | "support" | "tools" | "about";
  showInDesktopNav?: boolean;
  showInMobileNav?: boolean;
}

export const navigationItems: NavigationItem[] = [
  {
    to: "/",
    label: "Home",
    shortLabel: "Home",
    desc: "Return to your safe space",
    icon: Home,
    group: "primary",
    showInDesktopNav: true,
    showInMobileNav: true,
  },
  {
    to: "/chat",
    label: "Talk to Someone",
    shortLabel: "Chat",
    desc: "Safe, anonymous AI support",
    icon: MessageCircleHeart,
    group: "support",
    showInMobileNav: true,
  },
  {
    to: "/peer-match",
    label: "Peer Support",
    shortLabel: "Peer",
    desc: "Connect with a trained volunteer",
    icon: Users,
    group: "support",
    showInMobileNav: true,
  },
  {
    to: "/resources",
    label: "Wellness Hub",
    shortLabel: "Wellness",
    desc: "Behavioral patterns & focus intelligence",
    icon: BookOpen,
    group: "tools",
    showInMobileNav: true,
  },
  {
    to: "/community-qna",
    label: "Community Q&A",
    shortLabel: "Community",
    desc: "You are not alone in this",
    icon: HelpCircle,
    group: "support",
    showInMobileNav: true,
  },
  {
    to: "/partners",
    label: "NGO Partners",
    shortLabel: "Partners",
    desc: "Our network of professional help",
    icon: HeartHandshake,
    group: "support",
  },
  {
    to: "/check-in",
    label: "My Check-In",
    shortLabel: "Check-In",
    desc: "How are you feeling?",
    icon: ClipboardCheck,
    group: "tools",
  },
  {
    to: "/mood-tracker",
    label: "Mood Journal",
    shortLabel: "Mood",
    desc: "Track your emotional journey",
    icon: TrendingUp,
    group: "tools",
  },
  {
    to: "/privacy-policy",
    label: "Privacy Policy",
    shortLabel: "Privacy",
    desc: "Privacy-first data practices",
    icon: Shield,
    group: "about",
  },
  {
    to: "/volunteer",
    label: "Volunteer",
    shortLabel: "Volunteer",
    desc: "Support others as a trained peer listener",
    icon: UserCheck,
    group: "about",
    showInDesktopNav: true,
  },
];

export const supportNavItems = navigationItems.filter((item) => item.group === "support");
export const toolsNavItems = navigationItems.filter((item) => item.group === "tools");
export const mobilePrimaryNavItems = navigationItems.filter((item) => item.showInMobileNav);
