export default function Logo({
  size = "md",
  withTagline = false,
  className = "",
  variant = "auto", // 'auto' adapts via dark: classes, or 'dark' | 'light'
}) {
  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-lg", sub: "text-[9px]" },
    md: { icon: "w-10 h-10", text: "text-2xl", sub: "text-[10px]" },
    lg: { icon: "w-12 h-12", text: "text-3xl", sub: "text-xs" },
    xl: { icon: "w-16 h-16", text: "text-4xl", sub: "text-sm" },
  };

  const { icon, text, sub } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Vector Ticket-Film Mark */}
      <div className={`relative ${icon} shrink-0 group`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 rounded-2xl blur-xs opacity-60 group-hover:opacity-100 transition-opacity" />

        {/* Outer Icon Badge */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 p-[1.5px] shadow-md shadow-indigo-500/25">
          <div className="w-full h-full bg-slate-950/20 backdrop-blur-xs rounded-[14px] flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4/5 h-4/5 drop-shadow-sm"
            >
              <defs>
                <linearGradient id="ticketGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="0.6" stopColor="#e0e7ff" />
                  <stop offset="1" stopColor="#c7d2fe" />
                </linearGradient>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#fbbf24" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Main Ticket Silhouette with side notches */}
              <path
                d="M7 9C7 7.89543 7.89543 7 9 7H27C28.1046 7 29 7.89543 29 9V14.5C27.6193 14.5 26.5 15.6193 26.5 17C26.5 18.3807 27.6193 19.5 29 19.5V27C29 28.1046 28.1046 29 27 29H9C7.89543 29 7 28.1046 7 27V19.5C8.38071 19.5 9.5 18.3807 9.5 17C9.5 15.6193 8.38071 14.5 7 14.5V9Z"
                fill="url(#ticketGrad)"
              />

              {/* Film Sprocket Holes / Ticket Perforations */}
              <circle cx="12" cy="11.5" r="1.2" fill="#4338ca" />
              <circle cx="12" cy="17" r="1.2" fill="#4338ca" />
              <circle cx="12" cy="22.5" r="1.2" fill="#4338ca" />

              {/* Play / Cinema Arrow */}
              <path
                d="M18 13.5L24 17L18 20.5V13.5Z"
                fill="#4338ca"
              />

              {/* Golden VIP Star Accent */}
              <path
                d="M26.5 7L27.2 8.8L29 9.5L27.2 10.2L26.5 12L25.8 10.2L24 9.5L25.8 8.8L26.5 7Z"
                fill="url(#sparkGrad)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className={`font-black tracking-tight leading-none ${text}`}>
          <span className={variant === "dark" ? "text-white" : variant === "light" ? "text-slate-900" : "text-slate-900 dark:text-white"}>
            Cine
          </span>
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-500 bg-clip-text text-transparent">
            Pass
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5 align-top" />
        </div>

        {withTagline && (
          <span
            className={`font-bold tracking-[0.2em] uppercase mt-0.5 ${sub} ${
              variant === "dark" ? "text-slate-400" : variant === "light" ? "text-slate-500" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Cinematic Booking
          </span>
        )}
      </div>
    </div>
  );
}

