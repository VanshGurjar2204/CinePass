import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Clock, Heart, Play, Ticket, Sparkles } from "lucide-react";
import { watchlistApi } from "../../api/watchlistApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function MovieCard({ movie, onWatchlistChange, initialWatchlisted = false }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isWatchlisted, setIsWatchlisted] = useState(initialWatchlisted);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  useEffect(() => {
    setIsWatchlisted(initialWatchlisted);
  }, [initialWatchlisted]);

  const handleToggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast("Please sign in to save movies to your watchlist", "info");
      navigate("/login");
      return;
    }

    try {
      setLoadingWatchlist(true);
      if (isWatchlisted) {
        await watchlistApi.remove(movie._id);
        setIsWatchlisted(false);
        showToast(`Removed "${movie.title}" from watchlist`, "info");
      } else {
        await watchlistApi.add(movie._id);
        setIsWatchlisted(true);
        showToast(`Added "${movie.title}" to watchlist!`, "success");
      }
      if (onWatchlistChange) onWatchlistChange(movie._id, !isWatchlisted);
    } catch {
      showToast("Failed to update watchlist", "error");
    } finally {
      setLoadingWatchlist(false);
    }
  };

  const formatDuration = (mins) => {
    if (!mins) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const isNowShowing = movie.status === "now_showing";

  return (
    <div className="group relative flex flex-col bg-white dark:bg-[#0e1626] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl dark:shadow-xl dark:hover:shadow-2xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 text-left hover:-translate-y-1.5">
      {/* Poster Image Container */}
      <Link
        to={`/movies/${movie.slug || movie._id}`}
        className="relative aspect-[2/3] overflow-hidden bg-slate-950 block"
      >
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient Top Shadow */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* Gradient Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <span className="text-white text-xs font-bold flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl w-fit shadow-md border border-white/20">
            <Play className="w-3.5 h-3.5 fill-white text-white" />
            <span>View Shows & Trailers</span>
          </span>
        </div>

        {/* Status Chip (Top Left) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {isNowShowing ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              Upcoming
            </span>
          )}

          {movie.certificate && (
            <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-white/15">
              {movie.certificate}
            </span>
          )}
        </div>

        {/* Watchlist Heart Button (Top Right) */}
        <button
          onClick={handleToggleWatchlist}
          disabled={loadingWatchlist}
          aria-label={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all z-10 shadow-md active:scale-90 cursor-pointer ${
            isWatchlisted
              ? "bg-rose-500 text-white shadow-rose-500/30"
              : "bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-rose-400 border border-white/15"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isWatchlisted ? "fill-white text-white" : ""
            }`}
          />
        </button>
      </Link>

      {/* Card Metadata Details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre & Rating Bar */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
              {movie.genre?.slice(0, 2).join(" • ")}
            </span>

            {movie.rating > 0 ? (
              <span className="flex items-center gap-1 text-[11px] font-black text-amber-500 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{movie.rating.toFixed(1)}</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-1.5 py-0.5 rounded">
                NEW
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/movies/${movie.slug || movie._id}`}
            className="block font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm sm:text-base leading-snug line-clamp-1 transition-colors"
          >
            {movie.title}
          </Link>

          {/* Language & Duration */}
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{movie.language || "English"}</span>
            {movie.duration > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {formatDuration(movie.duration)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Button CTA */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <Link
            to={`/movies/${movie.slug || movie._id}`}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 dark:bg-white/5 dark:hover:bg-gradient-to-r dark:hover:from-indigo-600 dark:hover:to-violet-600 dark:text-slate-200 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs border border-slate-200 dark:border-white/10 group-hover:border-transparent"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{isNowShowing ? "Book Tickets" : "View Details"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
