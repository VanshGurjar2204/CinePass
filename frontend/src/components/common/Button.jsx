import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 focus:ring-indigo-500 border border-indigo-400/20",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-white/10 focus:ring-slate-400",
    outline:
      "bg-transparent hover:bg-slate-50 text-slate-700 border-slate-300 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 dark:border-white/15 focus:ring-slate-400",
    danger:
      "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-500/25 focus:ring-rose-500",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-white/10 dark:text-slate-300 dark:hover:text-white focus:ring-slate-300",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2.5 gap-2",
    lg: "text-base px-6 py-3 gap-2.5 font-semibold",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

