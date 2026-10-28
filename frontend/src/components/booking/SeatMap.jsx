import { useMemo } from "react";
import { Lock, Armchair } from "lucide-react";

export default function SeatMap({
  seats = [],
  selectedSeatIds = [],
  onSeatToggle,
  baseTicketPrice = 12.0,
}) {
  // Group seats by row
  const rows = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      if (!map[seat.row]) {
        map[seat.row] = [];
      }
      map[seat.row].push(seat);
    });

    // Sort seat numbers within each row
    Object.keys(map).forEach((r) => {
      map[r].sort((a, b) => a.seatNumber - b.seatNumber);
    });

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  return (
    <div className="flex flex-col items-center select-none py-6 text-center">
      {/* 1. Curved Cinema Screen Visual with Projector Light Effect */}
      <div className="w-full max-w-xl mb-12">
        <div className="relative h-6 w-full cinema-screen flex items-center justify-center">
          <div className="absolute -top-3 px-4 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-[0.25em] uppercase shadow-md flex items-center gap-1.5 border border-indigo-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Curved Silver Screen
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-3">
          All eyes facing the screen
        </p>
      </div>

      {/* 2. Auditorium Seats Layout */}
      <div className="space-y-3.5 w-full max-w-3xl overflow-x-auto pb-6 px-2">
        {rows.map(([rowLabel, rowSeats]) => {
          const isReclinerRow = rowSeats.some((s) => s.seatType === "recliner");
          const isPremiumRow = rowSeats.some((s) => s.seatType === "premium");

          return (
            <div key={rowLabel} className="flex items-center justify-center gap-2 sm:gap-3 min-w-max">
              {/* Left Row Indicator */}
              <span
                className={`w-6 text-center text-xs font-black rounded-md py-1 ${
                  isReclinerRow
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : isPremiumRow
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-slate-400"
                }`}
              >
                {rowLabel}
              </span>

              {/* Seats in this Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat._id);
                  const isBooked = seat.status === "booked";
                  const isLocked = seat.status === "locked";
                  const isDisabled = seat.status === "disabled";

                  let buttonClass =
                    "bg-slate-100 hover:bg-indigo-50 text-slate-700 border-slate-300 hover:border-indigo-400 dark:bg-slate-800/90 dark:hover:bg-indigo-600/30 dark:text-slate-200 dark:border-white/15 dark:hover:border-indigo-400 shadow-xs hover:scale-110";

                  if (isSelected) {
                    buttonClass =
                      "bg-gradient-to-tr from-indigo-500 to-violet-600 text-white border-indigo-300 shadow-lg shadow-indigo-500/50 scale-110 font-black ring-2 ring-indigo-400 ring-offset-2 ring-offset-white dark:ring-offset-[#070b14]";
                  } else if (isBooked) {
                    buttonClass =
                      "bg-slate-200 text-slate-400 border-slate-200 dark:bg-slate-900/60 dark:text-slate-600 dark:border-white/5 cursor-not-allowed opacity-50";
                  } else if (isLocked) {
                    buttonClass =
                      "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 cursor-not-allowed animate-pulse";
                  } else if (isDisabled) {
                    buttonClass =
                      "bg-transparent text-transparent border-transparent cursor-not-allowed pointer-events-none opacity-0";
                  } else if (seat.seatType === "recliner") {
                    buttonClass =
                      "bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 dark:text-purple-200 dark:border-purple-500/30 shadow-xs";
                  } else if (seat.seatType === "premium") {
                    buttonClass =
                      "bg-sky-100 hover:bg-sky-200 text-sky-700 border-sky-300 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 dark:text-sky-200 dark:border-sky-500/30 shadow-xs";
                  }

                  const seatWidth = isReclinerRow ? "w-9 sm:w-10" : "w-8 sm:w-9";

                  return (
                    <button
                      key={seat._id}
                      type="button"
                      disabled={isBooked || isLocked || isDisabled}
                      onClick={() => onSeatToggle(seat)}
                      title={`${seat.seatLabel} • ${seat.seatType.toUpperCase()} ($${(seat.price || baseTicketPrice * (seat.priceMultiplier || 1)).toFixed(2)})`}
                      className={`relative h-8 sm:h-9 rounded-lg border text-xs flex items-center justify-center transition-all duration-150 cursor-pointer ${seatWidth} ${buttonClass}`}
                    >
                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      ) : isReclinerRow && !isSelected ? (
                        <span className="font-bold text-[11px]">{seat.seatNumber}</span>
                      ) : (
                        <span className="font-bold">{seat.seatNumber}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Row Indicator */}
              <span
                className={`w-6 text-center text-xs font-black rounded-md py-1 ${
                  isReclinerRow
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : isPremiumRow
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "text-slate-400"
                }`}
              >
                {rowLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. States & Seat Type Legend */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 w-full max-w-2xl bg-white dark:bg-white/5 p-4 sm:p-5 rounded-2xl shadow-sm dark:shadow-xl border border-slate-200 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-slate-800 shadow-xs" />
            <span>Available</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md">
              <span className="text-[10px] font-black">✓</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 opacity-50" />
            <span className="text-slate-400 dark:text-slate-500">Booked</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-300" />
            </div>
            <span className="text-amber-600 dark:text-amber-300">Locked (Holding)</span>
          </div>
        </div>

        {/* Tier Badges with Pricing Info */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 pt-3 border-t border-slate-200 dark:border-white/10 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-bold">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Regular Seats (${baseTicketPrice.toFixed(2)})
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Premium Prime (${(baseTicketPrice * 1.3).toFixed(2)})
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-500/30">
            <Armchair className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
            VIP Recliner Suite (${(baseTicketPrice * 1.6).toFixed(2)})
          </span>
        </div>
      </div>
    </div>
  );
}
