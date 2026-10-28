import express from "express";
import { updateReview, deleteReview } from "../controllers/reviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { reviewSchema } from "../validators/reviewValidator.js";

const router = express.Router();

router.use(authenticate);

router.patch("/:id", validate(reviewSchema.partial()), updateReview);
router.delete("/:id", deleteReview);

export default router;

