import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle({ className = "", scrolled = false }: { className?: string, scrolled?: boolean }) {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`group relative inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 bg-black/20 px-5 text-sm font-semibold text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-black/40 hover:text-white hover:scale-105 active:scale-95 ${className}`}
      title="Toggle theme"
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 opacity-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
      </div>
      <span className="hidden sm:inline-block w-[4.5rem] text-left transition-all duration-300">
        {theme === "dark" ? "Light" : "Dark"} Mode
      </span>
      <span className="sr-only">Toggle theme</span>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  )
}
