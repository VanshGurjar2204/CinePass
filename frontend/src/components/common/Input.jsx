export default function Input({
  label,
  error,
  type = "text",
  id,
  className = "",
  placeholder,
  value,
  onChange,
  required = false,
  icon: Icon,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`block w-full rounded-xl border bg-white dark:bg-[#0e1626] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors ${
            Icon ? "pl-10" : ""
          } ${
            error
              ? "border-rose-400 dark:border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/25"
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
    </div>
  );
}

