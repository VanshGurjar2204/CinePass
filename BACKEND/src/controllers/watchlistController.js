import Watchlist from "../models/Watchlist.js";
import Movie from "../models/Movie.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const items = await Watchlist.find({ user: userId })
      .populate("movie")
      .sort({ createdAt: -1 });

    const movies = items.map((i) => i.movie).filter(Boolean);
    return sendSuccess(res, 200, "Watchlist fetched", movies);
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return sendError(res, 404, "Movie not found");
    }

    const item = await Watchlist.findOneAndUpdate(
      { user: userId, movie: movieId },
      { user: userId, movie: movieId },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    return sendSuccess(res, 201, "Movie added to watchlist", item);
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movieId } = req.params;

    await Watchlist.findOneAndDelete({ user: userId, movie: movieId });
    return sendSuccess(res, 200, "Movie removed from watchlist");
  } catch (error) {
    next(error);
  }
};

export const checkWatchlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movieId } = req.params;

    const exists = await Watchlist.findOne({ user: userId, movie: movieId });
    return sendSuccess(res, 200, "Watchlist status checked", { inWatchlist: !!exists });
  } catch (error) {
    next(error);
  }
};

