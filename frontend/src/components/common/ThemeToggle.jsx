import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className = "", size = "md" }) {
  const { isDark, toggleTheme } = useTheme();

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      className={`relative p-2 rounded-xl transition-all duration-300 cursor-pointer select-none border ${
        isDark
          ? "bg-white/5 hover:bg-white/10 text-amber-300 border-white/10 hover:border-amber-400/40 shadow-xs"
          : "bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-200 hover:border-indigo-300 shadow-2xs"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className={`${isSmall ? "w-4 h-4" : "w-4.5 h-4.5"} transition-transform duration-300 hover:rotate-45`} />
        ) : (
          <Moon className={`${isSmall ? "w-4 h-4" : "w-4.5 h-4.5"} transition-transform duration-300 hover:-rotate-12`} />
        )}
      </div>
    </button>
  );
}

