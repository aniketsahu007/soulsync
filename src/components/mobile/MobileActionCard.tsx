import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface MobileActionCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "emerald" | "sky" | "rose" | "slate";
}

const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  sky: "bg-sky-50 text-sky-700 border-sky-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  slate: "bg-slate-50 text-slate-700 border-slate-100",
};

export function MobileActionCard({
  to,
  icon: Icon,
  title,
  description,
  tone = "emerald",
}: MobileActionCardProps) {
  const className =
    "flex min-h-[88px] items-center gap-3 rounded-[1.35rem] border border-slate-100 bg-white p-4 shadow-sm transition duration-200 active:scale-[0.98]";
  const content = (
    <>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-slate-900">{title}</span>
        <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{description}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
    </>
  );

  if (to.includes("?")) {
    return (
      <a href={to} className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to as any} className={className}>
      {content}
    </Link>
  );
}
