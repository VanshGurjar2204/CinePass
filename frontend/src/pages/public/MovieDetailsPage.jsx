import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Clock,
  Film,
  Play,
  Heart,
  MapPin,
  MessageSquare,
  Ticket,
} from "lucide-react";
import { movieApi } from "../../api/movieApi";
import { watchlistApi } from "../../api/watchlistApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import TrailerModal from "../../components/movie/TrailerModal";

export default function MovieDetailsPage() {
  const { idOrSlug } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [], totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Review Form state
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Available dates dynamically computed from shows & upcoming days
  const availableDates = useMemo(() => {
    const set = new Set();
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      set.add(d.toISOString().split("T")[0]);
    }
    shows.forEach((s) => {
      if (s.showDate) set.add(s.showDate);
    });

    return Array.from(set)
      .sort()
      .map((dateStr) => {
        const parts = dateStr.split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const isToday = dateStr === todayStr;
        const label = isToday
          ? "Today"
          : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        return { date: dateStr, label };
      });
  }, [shows]);

  useEffect(() => {
    if (availableDates.length > 0 && (!selectedDate || !availableDates.some((d) => d.date === selectedDate))) {
      setSelectedDate(availableDates[0].date);
    }
  }, [availableDates]);

  // Fetch movie data & check watchlist
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const res = await movieApi.getByIdOrSlug(idOrSlug);
        if (res.data.success) {
          const m = res.data.data;
          setMovie(m);

          // Fetch shows for movie
          const showsRes = await movieApi.getShows(m._id);
          if (showsRes.data.success) {
            setShows(showsRes.data.data || []);
          }

          // Fetch reviews
          const revRes = await movieApi.getReviews(m._id);
          if (revRes.data.success) {
            setReviewsData(revRes.data.data);
          }

          // Check if in watchlist
          if (isAuthenticated) {
            const wRes = await watchlistApi.check(m._id);
            if (wRes.data.success) {
              setIsWatchlisted(wRes.data.data.inWatchlist);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load movie", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [idOrSlug, isAuthenticated]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      showToast("Please sign in to save movies to your watchlist", "info");
      navigate("/login");
      return;
    }

    try {
      if (isWatchlisted) {
        await watchlistApi.remove(movie._id);
        setIsWatchlisted(false);
        showToast("Removed from watchlist", "info");
      } else {
        await watchlistApi.add(movie._id);
        setIsWatchlisted(true);
        showToast("Added to your watchlist!", "success");
      }
    } catch {
      showToast("Failed to update watchlist", "error");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast("Please sign in to write a review", "info");
      navigate("/login");
      return;
    }

    if (!userReviewText.trim()) {
      showToast("Please enter a review message", "error");
      return;
    }

    try {
      setSubmittingReview(true);
      await movieApi.addReview(movie._id, {
        rating: userRating,
        review: userReviewText,
      });

      showToast("Review submitted successfully!", "success");
      setUserReviewText("");

      // Refresh reviews & movie
      const [revRes, mRes] = await Promise.all([
        movieApi.getReviews(movie._id),
        movieApi.getByIdOrSlug(idOrSlug),
      ]);
      if (revRes.data.success) setReviewsData(revRes.data.data);
      if (mRes.data.success) setMovie(mRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading movie details..." />;
  }

  if (!movie) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Movie not found</h2>
        <Link to="/movies" className="text-indigo-600 font-semibold text-sm mt-2 inline-block">
          &larr; Back to all movies
        </Link>
      </div>
    );
  }

  // Filter shows by selected date
  const filteredShows = shows.filter((s) => s.showDate === selectedDate);

  // Group shows by Theater
  const showsByTheater = {};
  filteredShows.forEach((show) => {
    const tId = show.theater._id;
    if (!showsByTheater[tId]) {
      showsByTheater[tId] = {
        theater: show.theater,
        shows: [],
      };
    }
    showsByTheater[tId].shows.push(show);
  });

  return (
    <div className="space-y-12 text-left">
      {/* Movie Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover opacity-35 blur-[1px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="w-48 sm:w-60 shrink-0 mx-auto md:mx-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-900">
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="flex-1 text-white space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo" className="bg-indigo-600/80 text-white border-none font-bold">
                {movie.certificate || "U/A"}
              </Badge>
              {movie.genre?.map((g) => (
                <span
                  key={g}
                  className="bg-white/10 backdrop-blur-md text-slate-200 text-xs px-2.5 py-1 rounded-full font-medium border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 font-medium">
              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {movie.rating.toFixed(1)} / 5.0 ({movie.totalRatings} ratings)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </span>
              <span>•</span>
              <span className="text-indigo-400">{movie.language}</span>
              <span>•</span>
              <span className="text-slate-400">Released {new Date(movie.releaseDate).toLocaleDateString()}</span>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {movie.description}
            </p>

            {/* Cast & Director */}
            <div className="pt-2 text-xs text-slate-300 space-y-1">
              <p>
                <span className="font-bold text-white">Director:</span> {movie.director || "N/A"}
              </p>
              <p>
                <span className="font-bold text-white">Starring:</span> {movie.cast?.join(", ") || "N/A"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a href="#showtimes">
                <Button variant="primary" size="lg" className="shadow-xl shadow-indigo-600/30">
                  <Ticket className="w-5 h-5" /> Book Tickets
                </Button>
              </a>

              {movie.trailerUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setTrailerOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                >
                  <Play className="w-4 h-4 fill-white" /> Watch Trailer
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleWatchlist}
                className={
                  isWatchlisted
                    ? "bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/30"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md"
                }
              >
                <Heart className={`w-4 h-4 ${isWatchlisted ? "fill-white" : ""}`} />
                {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Theater Schedules Section */}
      <section id="showtimes" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select Showtimes</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pick a cinema and preferred show timing</p>
          </div>

          {/* Date Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {availableDates.map((item) => (
              <button
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  selectedDate === item.date
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                    : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theater Show Listings */}
        {Object.keys(showsByTheater).length === 0 ? (
          <div className="bg-white/80 dark:bg-[#0e1626]/80 rounded-2xl p-8 text-center border border-slate-200 dark:border-white/10 shadow-sm">
            <Film className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No shows scheduled for this date</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please select another date above or check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(showsByTheater).map(({ theater, shows: theaterShows }) => (
              <div
                key={theater._id}
                className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm dark:shadow-xl text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{theater.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {theater.address}, {theater.city}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {theater.facilities?.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium px-2 py-0.5 rounded"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showtimes Pills */}
                <div className="pt-4 flex flex-wrap gap-3">
                  {theaterShows.map((show) => (
                    <Link
                      key={show._id}
                      to={`/shows/${show._id}/seats`}
                      className="group flex flex-col p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 transition-all min-w-[130px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {show.startTime}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ${show.ticketPrice?.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {show.screen?.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reviews & Ratings Section */}
      <section className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-10 shadow-lg dark:shadow-xl text-left">
        <div className="flex flex-col md:flex-row gap-8 pb-8 border-b border-slate-200 dark:border-white/10">
          {/* Rating Summary Card */}
          <div className="md:w-64 shrink-0 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
            <span className="text-5xl font-black text-slate-900 dark:text-white">{reviewsData.averageRating.toFixed(1)}</span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(reviewsData.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Based on {reviewsData.totalReviews} verified reviews
            </p>
          </div>

          {/* Add Review Form */}
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Leave a Movie Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Your Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {userRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder={
                    isAuthenticated
                      ? "Share your thoughts on the acting, plot, visuals, and cinema experience..."
                      : "Please sign in to write a review"
                  }
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  disabled={!isAuthenticated || submittingReview}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-white text-sm focus:outline-none focus:bg-white dark:focus:bg-[#090d16] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!isAuthenticated || submittingReview}
                loading={submittingReview}
              >
                {isAuthenticated ? "Post Review" : "Sign In to Post Review"}
              </Button>
            </form>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="pt-8">
          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span>Audience Reviews ({reviewsData.totalReviews})</span>
          </h4>

          {reviewsData.reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5 space-y-4">
              {reviewsData.reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold uppercase">
                        {rev.user?.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-9">
                    {rev.review}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-9 mt-1">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
}

