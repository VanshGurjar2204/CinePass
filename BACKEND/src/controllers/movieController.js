import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getMovies = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      language,
      status,
      minRating,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (genre) {
      query.genre = { $in: [new RegExp(genre, "i")] };
    }

    if (language) {
      query.language = new RegExp(`^${language}$`, "i");
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { cast: { $regex: search, $options: "i" } },
        { director: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    if (sortBy === "rating") sortOptions.rating = order === "asc" ? 1 : -1;
    else if (sortBy === "releaseDate") sortOptions.releaseDate = order === "asc" ? 1 : -1;
    else if (sortBy === "title") sortOptions.title = order === "asc" ? 1 : -1;
    else sortOptions.createdAt = order === "asc" ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sortOptions).skip(skip).limit(Number(limit)),
      Movie.countDocuments(query),
    ]);

    return sendSuccess(res, 200, "Movies fetched successfully", {
      movies,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMovieByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let movie = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      movie = await Movie.findById(idOrSlug);
    }
    if (!movie) {
      movie = await Movie.findOne({ slug: idOrSlug });
    }

    if (!movie) {
      return sendError(res, 404, "Movie not found");
    }

    return sendSuccess(res, 200, "Movie fetched", movie);
  } catch (error) {
    next(error);
  }
};

export const getMovieShows = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // optional YYYY-MM-DD filter

    const query = {
      movie: id,
      status: "scheduled",
    };

    if (date) {
      query.showDate = date;
    } else {
      // Default to today and upcoming shows
      const todayStr = new Date().toISOString().split("T")[0];
      query.showDate = { $gte: todayStr };
    }

    const shows = await Show.find(query)
      .populate("theater")
      .populate("screen")
      .sort({ showDate: 1, startTime: 1 });

    return sendSuccess(res, 200, "Movie shows fetched", shows);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedMovies = async (req, res, next) => {
  try {
    const featured = await Movie.find({ featured: true, status: "now_showing" }).limit(5);
    const nowShowing = await Movie.find({ status: "now_showing" }).sort({ rating: -1 }).limit(10);
    const upcoming = await Movie.find({ status: "upcoming" }).sort({ releaseDate: 1 }).limit(10);

    return sendSuccess(res, 200, "Featured collections fetched", {
      featured,
      nowShowing,
      upcoming,
    });
  } catch (error) {
    next(error);
  }
};

export const getGenres = async (req, res, next) => {
  try {
    const genres = await Movie.distinct("genre");
    const languages = await Movie.distinct("language");
    return sendSuccess(res, 200, "Metadata fetched", { genres, languages });
  } catch (error) {
    next(error);
  }
};

