import express from "express";
import { getShows, getShowById, getShowSeats } from "../controllers/showController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getShows);
router.get("/:id", getShowById);

// Optional auth so if user is logged in, their own locked seats show as selected
router.get("/:showId/seats", (req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, getShowSeats);

export default router;

