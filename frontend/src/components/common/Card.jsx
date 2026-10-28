export default function Card({
  children,
  className = "",
  hover = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#0e1626]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl p-6 text-slate-900 dark:text-slate-100 transition-colors ${
        hover
          ? "hover:shadow-md dark:hover:border-indigo-500/50 dark:hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-all cursor-pointer"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

