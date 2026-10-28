import express from "express";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
} from "../controllers/watchlistController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getWatchlist);
router.get("/check/:movieId", checkWatchlist);
router.post("/:movieId", addToWatchlist);
router.delete("/:movieId", removeFromWatchlist);

export default router;

