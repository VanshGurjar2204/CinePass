import express from "express";
import {
  getMovies,
  getMovieByIdOrSlug,
  getMovieShows,
  getFeaturedMovies,
  getGenres,
} from "../controllers/movieController.js";
import { getMovieReviews, addReview } from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { reviewSchema } from "../validators/reviewValidator.js";

const router = express.Router();

router.get("/featured", getFeaturedMovies);
router.get("/genres", getGenres);
router.get("/", getMovies);
router.get("/:idOrSlug", getMovieByIdOrSlug);
router.get("/:id/shows", getMovieShows);

// Movie reviews
router.get("/:movieId/reviews", getMovieReviews);
router.post("/:movieId/reviews", authenticate, validate(reviewSchema), addReview);

export default router;

