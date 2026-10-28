import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { movieApi } from "../../api/movieApi";
import MovieGrid from "../../components/movie/MovieGrid";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);

  // Query state derived from searchParams
  const search = searchParams.get("search") || "";
  const genre = searchParams.get("genre") || "";
  const language = searchParams.get("language") || "";
  const status = searchParams.get("status") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Fetch metadata once
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await movieApi.getGenres();
        if (res.data.success) {
          setGenres(res.data.data.genres || []);
          setLanguages(res.data.data.languages || []);
        }
      } catch (err) {
        console.error("Error loading genres", err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch movies when params change
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await movieApi.getAll({
          search,
          genre,
          language,
          status,
          sortBy,
          page,
          limit: 12,
        });

        if (res.data.success) {
          setMovies(res.data.data.movies || []);
          setPagination(res.data.data.pagination || { page: 1, totalPages: 1 });
        }
      } catch (err) {
        console.error("Error loading movies", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, genre, language, status, sortBy, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1"); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Browse Movies</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Explore movies currently showing in theaters and upcoming blockbuster releases.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-xl space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4 overflow-x-auto">
          {[
            { label: "All Movies", value: "" },
            { label: "Now Showing", value: "now_showing" },
            { label: "Upcoming", value: "upcoming" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParam("status", tab.value)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                status === tab.value
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Select Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Input
            placeholder="Search titles, cast..."
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
            icon={Search}
          />

          <Select
            placeholder="All Genres"
            value={genre}
            onChange={(e) => updateParam("genre", e.target.value)}
            options={genres.map((g) => ({ label: g, value: g }))}
          />

          <Select
            placeholder="All Languages"
            value={language}
            onChange={(e) => updateParam("language", e.target.value)}
            options={languages.map((l) => ({ label: l, value: l }))}
          />

          <Select
            placeholder="Sort By"
            value={sortBy}
            onChange={(e) => updateParam("sortBy", e.target.value)}
            options={[
              { label: "Latest Release", value: "createdAt" },
              { label: "Top Rated", value: "rating" },
              { label: "Title (A-Z)", value: "title" },
            ]}
          />
        </div>
      </div>

      {/* Movie Grid */}
      <MovieGrid movies={movies} loading={loading} />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

