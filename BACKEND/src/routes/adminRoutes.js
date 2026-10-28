import express from "express";
import {
  getDashboardStats,
  createMovie,
  updateMovie,
  deleteMovie,
  createTheater,
  updateTheater,
  deleteTheater,
  createScreen,
  updateScreen,
  deleteScreen,
  generateSeatLayout,
  updateSeat,
  createShow,
  updateShow,
  deleteShow,
  getUsers,
  toggleUserStatus,
  getAllBookings,
  getAllReviews,
  deleteReviewAdmin,
  getReports,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createMovieSchema, updateMovieSchema } from "../validators/movieValidator.js";
import { createTheaterSchema, updateTheaterSchema } from "../validators/theaterValidator.js";
import { createScreenSchema, updateScreenSchema } from "../validators/screenValidator.js";
import { createShowSchema, updateShowSchema } from "../validators/showValidator.js";

const router = express.Router();

// Require both authentication and admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get("/stats", getDashboardStats);
router.get("/reports", getReports);

// Movies
router.post("/movies", validate(createMovieSchema), createMovie);
router.patch("/movies/:id", validate(updateMovieSchema), updateMovie);
router.delete("/movies/:id", deleteMovie);

// Theaters
router.post("/theaters", validate(createTheaterSchema), createTheater);
router.patch("/theaters/:id", validate(updateTheaterSchema), updateTheater);
router.delete("/theaters/:id", deleteTheater);

// Screens
router.post("/screens", validate(createScreenSchema), createScreen);
router.patch("/screens/:id", validate(updateScreenSchema), updateScreen);
router.delete("/screens/:id", deleteScreen);

// Seats
router.post("/seats/generate", generateSeatLayout);
router.patch("/seats/:id", updateSeat);

// Shows
router.post("/shows", validate(createShowSchema), createShow);
router.patch("/shows/:id", validate(updateShowSchema), updateShow);
router.delete("/shows/:id", deleteShow);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);

// Bookings
router.get("/bookings", getAllBookings);

// Reviews
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReviewAdmin);

export default router;

