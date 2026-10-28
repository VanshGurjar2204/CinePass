import { useState, useEffect } from "react";
import { Ticket, Clock, ShieldCheck } from "lucide-react";
import Button from "../common/Button";

export default function BookingSummary({
  show,
  selectedSeats = [],
  lockExpiry,
  onProceed,
  loading = false,
}) {
  const [timeLeft, setTimeLeft] = useState(null);

  // Countdown timer for seat locks
  useEffect(() => {
    if (!lockExpiry) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const remainingMs = new Date(lockExpiry).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("00:00");
      } else {
        const totalSecs = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeft(
          `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockExpiry]);

  const subtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? 2.5 : 0;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + convenienceFee + tax).toFixed(2));

  return (
    <div className="bg-white/95 dark:bg-[#0e1626]/95 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xl dark:shadow-2xl text-left sticky top-24">
      <h3 className="text-base font-black text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <span>Booking Summary</span>
        <Ticket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </h3>

      {/* Show Details */}
      <div className="mt-4 space-y-1">
        <h4 className="font-black text-slate-900 dark:text-white text-sm">{show?.movie?.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">{show?.theater?.name} • {show?.screen?.name}</p>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
          {show?.showDate} at {show?.startTime}
        </p>
      </div>

      {/* Seat Badges */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>Selected Seats ({selectedSeats.length})</span>
          {timeLeft && (
            <span className="flex items-center gap-1 font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-md">
              <Clock className="w-3.5 h-3.5" /> {timeLeft}
            </span>
          )}
        </div>

        {selectedSeats.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No seats selected yet</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedSeats.map((seat) => (
              <span
                key={seat._id}
                className="bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-lg font-bold"
              >
                {seat.seatLabel} (${seat.price.toFixed(2)})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 space-y-2 text-xs">
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Tickets Subtotal</span>
          <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Convenience Fee</span>
          <span className="font-semibold text-slate-900 dark:text-white">${convenienceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-500 dark:text-slate-400">
          <span>Estimated Taxes (5%)</span>
          <span className="font-semibold text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
          <span>Total Payable</span>
          <span className="text-indigo-600 dark:text-indigo-400 text-base font-black">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-6">
        <Button
          onClick={onProceed}
          disabled={selectedSeats.length === 0 || loading || timeLeft === "00:00"}
          loading={loading}
          variant="primary"
          size="lg"
          className="w-full shadow-lg shadow-indigo-600/30"
        >
          {selectedSeats.length === 0 ? "Select Seats to Continue" : "Confirm & Proceed to Pay"}
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
        <span>Secure 256-bit encrypted checkout</span>
      </div>
    </div>
  );
}

