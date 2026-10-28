export default function Select({
  label,
  error,
  options = [],
  value,
  onChange,
  id,
  className = "",
  required = false,
  placeholder = "Select an option",
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={`block w-full rounded-xl border bg-white dark:bg-[#0e1626] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors cursor-pointer ${
          error ? "border-rose-400 dark:border-rose-500/60" : "border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/25"
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-white dark:bg-[#0e1626] text-slate-500 dark:text-slate-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0e1626] text-slate-900 dark:text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>}
    </div>
  );
}

