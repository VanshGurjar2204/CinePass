import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, Phone, Heart, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim() && emailInput.includes("@")) {
      setSubscribed(true);
      setEmailInput("");
    }
  };

  return (
    <footer className="bg-white dark:bg-[#060a14] border-t border-slate-200/80 dark:border-white/10 mt-24 text-left text-slate-600 dark:text-slate-300 relative transition-colors">
      {/* Newsletter Accent Banner */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-slate-50 to-violet-50/60 border-b border-indigo-100/60 dark:from-indigo-950/50 dark:via-slate-900/70 dark:to-violet-950/40 dark:border-white/10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 dark:text-indigo-400 dark:bg-indigo-500/15 border border-indigo-200/60 dark:border-indigo-500/30 px-3 py-1 rounded-full mb-2.5">
              <Sparkles className="w-3.5 h-3.5" /> CinePass Premiere Club
            </span>
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Get notified for movie premieres & early bird tickets
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Join 50,000+ moviegoers receiving weekly showtime schedules & promotional offers.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-5 py-3 rounded-2xl font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>You&apos;re on the list! Check your inbox for exclusive perks.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="lg" withTagline={true} />
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              CinePass is a state-of-the-art cinema ticketing platform engineered with real-time seat locking, instant digital boarding passes, and secure payment processing.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>PCI-DSS Stripe Verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>24/7 Live Availability</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Explore Cinema
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <Link to="/movies?status=now_showing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/movies?status=upcoming" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Coming Soon Premières
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  All Movie Directory
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Saved Watchlist
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  My Booked Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Experience Specs */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Screen Formats
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>IMAX with Laser 4K</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                <span>Dolby Atmos 128-Channel</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                <span>VIP Electric Recliner Suites</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                <span>RealD 3D & HFR 48fps</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Support & Helpdesk
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate">support@cinepass.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>1-800-CINE-PASS</span>
              </li>
              <li className="pt-2">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Instant cancellation and automated refunds processed up to 2 hours before showtime.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>&copy; {new Date().getFullYear()} CinePass Movie Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for cinema lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
