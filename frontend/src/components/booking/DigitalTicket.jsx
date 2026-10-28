import { Printer, Calendar, Clock, MapPin, ShieldCheck } from "lucide-react";
import Button from "../common/Button";
import Logo from "../common/Logo";

export default function DigitalTicket({ booking }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const movie = booking.movie;
  const theater = booking.theater;
  const screen = booking.screen;
  const show = booking.show;
  const seatLabels = booking.seats?.map((s) => s.seatLabel).join(", ") || "";

  return (
    <div className="max-w-xl mx-auto my-8 print:m-0 print:max-w-none text-left">
      {/* Boarding Pass Container */}
      <div className="relative bg-white dark:bg-[#0e1626] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-tr from-slate-900 via-[#0b1020] to-indigo-950 text-white p-6 sm:p-8 relative overflow-hidden border-b border-white/10">
          {/* Ambient Spotlight */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo size="sm" variant="dark" />
                <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                  PASS: #{booking.bookingId}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                  {booking.bookingStatus.toUpperCase()}
                </span>
                <span className="text-xs text-slate-300 font-semibold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  {movie?.certificate || "PG-13"}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {movie?.title}
              </h2>
              <p className="text-xs text-indigo-300 mt-1 font-medium">
                {movie?.language} • {movie?.genre?.join(", ")}
              </p>
            </div>

            {movie?.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-18 h-26 object-cover rounded-2xl shadow-xl border-2 border-white/20 shrink-0"
              />
            )}
          </div>
        </div>

        {/* Perforated Notches & Tear Line */}
        <div className="relative flex items-center justify-between px-3 -my-3.5 z-20">
          <div className="w-7 h-7 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-full -ml-6 shadow-inner" />
          <div className="flex-1 border-t-2 border-dashed border-slate-300 dark:border-white/20 mx-3" />
          <div className="w-7 h-7 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-full -mr-6 shadow-inner" />
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] block mb-1">
                Show Date & Showtime
              </span>
              <p className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {show?.showDate}
              </p>
              <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4" />
                {show?.startTime}
              </p>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] block mb-1">
                Cinema Auditorium
              </span>
              <p className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {theater?.name}
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-bold mt-0.5">
                {screen?.name} • {theater?.city}
              </p>
            </div>
          </div>

          {/* Reserved Seats Highlight Box */}
          <div className="bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-950/60 dark:via-violet-950/40 dark:to-indigo-950/40 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-black uppercase tracking-wider block">
                Reserved Seats ({booking.ticketCount} Tickets)
              </span>
              <p className="text-xl font-black text-indigo-950 dark:text-indigo-200 mt-0.5 tracking-wide">
                {seatLabels}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
                Total Paid
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                ${booking.totalAmount?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* QR Code & Barcode Gate Pass */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
            {/* Visual Simulated 1D Barcode */}
            <div className="h-12 w-68 bg-slate-900 dark:bg-[#070b14] border border-slate-300 dark:border-white/10 flex items-center justify-around px-3 py-1.5 rounded-lg shadow-xs">
              {[3, 2, 5, 1, 4, 6, 2, 3, 5, 2, 4, 1, 6, 3, 2, 5, 2, 4, 3, 6, 1, 4, 2, 5].map(
                (w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-white opacity-95"
                  />
                )
              )}
            </div>

            <p className="font-mono text-xs font-black text-slate-900 dark:text-white mt-2 tracking-widest uppercase">
              {booking.bookingId}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Show this digital boarding pass at the cinema turnstile for instant admission.
            </p>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 print:hidden">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Confirmation email dispatched via Gmail
          </span>
          <Button variant="primary" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print / Save Pass
          </Button>
        </div>
      </div>
    </div>
  );
}
