import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Star,
  Calendar,
  Shield,
  Sparkles,
  ArrowRight,
  Ticket,
  Search,
  Clapperboard,
  Tv,
  Flame,
  Award,
} from "lucide-react";
import { movieApi } from "../../api/movieApi";
import MovieCard from "../../components/movie/MovieCard";
import TrailerModal from "../../components/movie/TrailerModal";
import Loader from "../../components/common/Loader";

export default function HomePage() {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, url: "", title: "" });
  const [homeSearch, setHomeSearch] = useState("");
  const [selectedQuickMovie, setSelectedQuickMovie] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, metaRes] = await Promise.all([
          movieApi.getFeatured(),
          movieApi.getGenres(),
        ]);

        if (collectionsRes.data.success) {
          setFeaturedMovies(collectionsRes.data.data.featured || []);
          setNowShowing(collectionsRes.data.data.nowShowing || []);
          setUpcoming(collectionsRes.data.data.upcoming || []);
          if (collectionsRes.data.data.nowShowing?.length > 0) {
            setSelectedQuickMovie(collectionsRes.data.data.nowShowing[0]._id);
          }
        }

        if (metaRes.data.success) {
          setGenres(metaRes.data.data.genres || []);
        }
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Automatic hero slider rotate every 6 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const handleQuickBook = (e) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate(`/movies?search=${encodeURIComponent(homeSearch.trim())}`);
    } else if (selectedQuickMovie) {
      navigate(`/movies/${selectedQuickMovie}`);
    } else {
      navigate("/movies");
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading CinePass Experience..." />;
  }

  const heroMovie = featuredMovies[activeHeroIdx] || nowShowing[0];

  return (
    <div className="space-y-16 lg:space-y-20">
      {/* 1. Cinematic Hero Showcase Banner */}
      {heroMovie && (
        <section className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl text-left">
          {/* Backdrop Image with Multi-Gradient Overlay */}
          <div className="absolute inset-0">
            <img
              src={heroMovie.backdrop || heroMovie.poster}
              alt={heroMovie.title}
              className="w-full h-full object-cover opacity-45 scale-105 filter blur-[0.5px] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Movie Info */}
            <div className="max-w-2xl text-left">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Premiere Showcase
                </span>
                <span className="text-xs text-slate-200 font-bold bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  {heroMovie.certificate || "PG-13"}
                </span>
                <span className="text-xs text-amber-300 font-bold bg-amber-500/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {heroMovie.rating.toFixed(1)} IMDb Rating
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                {heroMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-slate-300 font-semibold">
                <span className="text-indigo-400">{heroMovie.language}</span>
                <span>•</span>
                <span>{Math.floor(heroMovie.duration / 60)}h {heroMovie.duration % 60}m</span>
                <span>•</span>
                <span>{heroMovie.genre?.join(", ")}</span>
                <span>•</span>
                <span className="text-slate-400">{heroMovie.director ? `Dir. ${heroMovie.director}` : "Dolby Atmos / 4K Laser"}</span>
              </div>

              <p className="mt-4 text-xs sm:text-sm lg:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
                {heroMovie.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to={`/movies/${heroMovie.slug || heroMovie._id}`}>
                  <button className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-xl shadow-indigo-500/30 transition-all flex items-center gap-2 transform active:scale-95 cursor-pointer">
                    <Ticket className="w-4 h-4" />
                    <span>Book Tickets Now</span>
                  </button>
                </Link>

                {heroMovie.trailerUrl && (
                  <button
                    onClick={() =>
                      setTrailerModal({
                        isOpen: true,
                        url: heroMovie.trailerUrl,
                        title: heroMovie.title,
                      })
                    }
                    className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Interactive Hero Thumbnail Switcher */}
            {featuredMovies.length > 1 && (
              <div className="hidden lg:flex flex-col gap-3 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Featured Movies ({activeHeroIdx + 1}/{featuredMovies.length})
                </span>
                <div className="flex flex-col gap-2.5">
                  {featuredMovies.slice(0, 4).map((movie, idx) => (
                    <button
                      key={movie._id}
                      onClick={() => setActiveHeroIdx(idx)}
                      className={`flex items-center gap-3 p-2 rounded-2xl transition-all border text-left ${
                        idx === activeHeroIdx
                          ? "bg-white/15 border-indigo-400 shadow-lg shadow-indigo-500/20 translate-x-1"
                          : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700"
                      }`}
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-xl shadow-xs"
                      />
                      <div className="max-w-[140px]">
                        <p className="text-xs font-bold text-white truncate">{movie.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{movie.genre?.[0]}</p>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Fast-Track Booking Strip */}
      <section className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl text-left relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleQuickBook} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center relative z-10">
          <div className="sm:col-span-5 relative">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Select Movie
            </label>
            <div className="relative">
              <Clapperboard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={selectedQuickMovie}
                onChange={(e) => setSelectedQuickMovie(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#090d16] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                {nowShowing.map((m) => (
                  <option key={m._id} value={m._id} className="bg-white dark:bg-[#0e1626] text-slate-900 dark:text-white">
                    {m.title} ({m.language})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Search by Title or Actor
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Christopher Nolan, Sci-Fi..."
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/15 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#090d16] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div className="sm:col-span-3 sm:pt-6">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer border border-indigo-400/20"
            >
              <Ticket className="w-4 h-4" />
              <span>Find Shows</span>
            </button>
          </div>
        </form>

        {/* Popular Genres Filter Chips */}
        {genres.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs relative z-10">
            <span className="font-bold text-slate-500 dark:text-slate-400 shrink-0 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              Trending Genres:
            </span>
            {genres.map((genre) => (
              <Link
                key={genre}
                to={`/movies?genre=${encodeURIComponent(genre)}`}
                className="bg-slate-100 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:bg-white/5 dark:hover:bg-indigo-600/20 dark:hover:text-indigo-300 dark:hover:border-indigo-500/40 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3.5 py-1 rounded-full font-bold transition-all shrink-0 text-xs shadow-xs"
              >
                {genre}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Now Showing Section */}
      <section className="text-left">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                In Theaters Today
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Now Showing
            </h2>
          </div>
          <Link
            to="/movies?status=now_showing"
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>View All Shows</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {nowShowing.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 4. Upcoming Movies Section */}
      <section className="text-left">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Anticipated Releases
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Coming Soon
            </h2>
          </div>
          <Link
            to="/movies?status=upcoming"
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>Explore Upcoming</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {upcoming.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </section>

      {/* 5. Cinema Experience Value Pillars */}
      <section className="bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-[#0b1220] dark:via-[#0f172a] dark:to-[#120e26] rounded-3xl border border-slate-200 dark:border-white/10 p-8 sm:p-12 text-left shadow-xl dark:shadow-2xl relative overflow-hidden">
        <div className="max-w-xl mb-8">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1.5">
            <Award className="w-4 h-4" /> Engineered for Cinema Lovers
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Why Book with CinePass?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Experience next-generation cinema ticketing with zero hassle and instant digital access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-4 shadow-md">
              <Tv className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-base mb-1.5">Interactive Live Seat Maps</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose your exact seat view. Our real-time 8-minute locking engine ensures your selection is held without double bookings.
            </p>
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold mb-4 shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-base mb-1.5">Bank-Grade Stripe Checkout</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Pay securely via Stripe Checkout with instant webhook verification, card encryption, and automatic refunds on show cancellations.
            </p>
          </div>

          <div className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold mb-4 shadow-md">
              <Ticket className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-base mb-1.5">Digital Boarding Passes</h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive your confirmed ticket with verifiable QR reference, instant Gmail confirmation, and SMS alerts delivered right to your phone.
            </p>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, url: "", title: "" })}
        trailerUrl={trailerModal.url}
        movieTitle={trailerModal.title}
      />
    </div>
  );
}
