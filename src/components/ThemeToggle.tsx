import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className = "", scrolled = false }: { className?: string, scrolled?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("w-[72px] h-9 rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse", className)} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-9 w-[72px] cursor-pointer items-center rounded-full p-1 transition-colors duration-300",
        isDark ? "bg-slate-800 border border-slate-700" : "bg-slate-200 border border-slate-300",
        className
      )}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          "flex h-7 w-7 transform items-center justify-center rounded-full bg-white dark:bg-slate-950 shadow-sm dark:shadow-none transition-transform duration-300 ease-in-out dark:bg-slate-950",
          isDark ? "translate-x-[34px]" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-slate-200" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
        <Sun className={cn("h-3.5 w-3.5 transition-opacity duration-300", isDark ? "opacity-30 text-slate-400" : "opacity-0")} />
        <Moon className={cn("h-3.5 w-3.5 transition-opacity duration-300", isDark ? "opacity-0" : "opacity-30 text-slate-500 dark:text-slate-400")} />
      </div>
    </button>
  );
}
