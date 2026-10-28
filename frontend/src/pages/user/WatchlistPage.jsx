import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Ticket, Star } from "lucide-react";
import { watchlistApi } from "../../api/watchlistApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";

export default function WatchlistPage() {
  const { showToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await watchlistApi.getAll();
      if (res.data.success) {
        setMovies(res.data.data || []);
      }
    } catch {
      showToast("Failed to fetch watchlist", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (movieId) => {
    try {
      await watchlistApi.remove(movieId);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
      showToast("Movie removed from watchlist", "info");
    } catch {
      showToast("Failed to remove movie", "error");
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading your watchlist..." />;
  }

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Watchlist</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Movies you want to see. Book tickets as soon as showtimes become available.
        </p>
      </div>

      {movies.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your watchlist is empty"
          description="Save movies you're interested in by tapping the heart icon on any movie poster."
          actionLabel="Discover Movies"
          onAction={() => (window.location.href = "/movies")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="bg-white dark:bg-[#0e1626]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <div>
                <Link to={`/movies/${movie.slug || movie._id}`} className="aspect-[2/3] block overflow-hidden bg-slate-950">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                      {movie.genre?.slice(0, 2).join(", ")}
                    </span>
                    {movie.rating > 0 && (
                      <span className="flex items-center gap-1 font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {movie.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{movie.title}</h3>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2 mt-2">
                <Link to={`/movies/${movie.slug || movie._id}`} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    <Ticket className="w-3.5 h-3.5" /> Book
                  </Button>
                </Link>

                <button
                  onClick={() => handleRemove(movie._id)}
                  title="Remove from watchlist"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
