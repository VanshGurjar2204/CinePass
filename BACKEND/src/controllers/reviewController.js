import Review from "../models/Review.js";
import Movie from "../models/Movie.js";
import { sendSuccess, sendError } from "../utils/response.js";

const updateMovieRatingStats = async (movieId) => {
  const reviews = await Review.find({ movie: movieId });
  const totalRatings = reviews.length;
  let averageRating = 0;

  if (totalRatings > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Number((sum / totalRatings).toFixed(1));
  }

  await Movie.findByIdAndUpdate(movieId, {
    rating: averageRating,
    totalRatings,
  });
};

export const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movie: movieId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) distribution[r.rating]++;
      sum += r.rating;
    });

    const averageRating = reviews.length > 0 ? Number((sum / reviews.length).toFixed(1)) : 0;

    return sendSuccess(res, 200, "Reviews fetched", {
      reviews,
      totalReviews: reviews.length,
      averageRating,
      distribution,
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return sendError(res, 404, "Movie not found");
    }

    // Check if user already reviewed this movie
    let reviewDoc = await Review.findOne({ movie: movieId, user: userId });
    if (reviewDoc) {
      // Update existing
      reviewDoc.rating = rating;
      reviewDoc.review = review;
      await reviewDoc.save();
    } else {
      // Create new
      reviewDoc = await Review.create({
        movie: movieId,
        user: userId,
        rating,
        review,
      });
    }

    await updateMovieRatingStats(movieId);

    const populatedReview = await Review.findById(reviewDoc._id).populate("user", "name");
    return sendSuccess(res, 201, "Review submitted successfully", populatedReview);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    const reviewDoc = await Review.findById(id);
    if (!reviewDoc) {
      return sendError(res, 404, "Review not found");
    }

    if (reviewDoc.user.toString() !== userId.toString() && req.user.role !== "admin") {
      return sendError(res, 403, "You can only edit your own review");
    }

    if (rating !== undefined) reviewDoc.rating = rating;
    if (review !== undefined) reviewDoc.review = review;
    await reviewDoc.save();

    await updateMovieRatingStats(reviewDoc.movie);

    return sendSuccess(res, 200, "Review updated successfully", reviewDoc);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviewDoc = await Review.findById(id);

    if (!reviewDoc) {
      return sendError(res, 404, "Review not found");
    }

    if (reviewDoc.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return sendError(res, 403, "You can only delete your own review");
    }

    const movieId = reviewDoc.movie;
    await Review.findByIdAndDelete(id);

    await updateMovieRatingStats(movieId);

    return sendSuccess(res, 200, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};

