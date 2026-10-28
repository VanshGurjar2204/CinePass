import MovieCard from "./MovieCard";
import EmptyState from "../common/EmptyState";

export default function MovieGrid({
  movies = [],
  loading = false,
  emptyMessage = "No movies found matching criteria.",
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-[#0e1626] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden p-3">
            <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-800/80 rounded-xl mb-3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  );
}

