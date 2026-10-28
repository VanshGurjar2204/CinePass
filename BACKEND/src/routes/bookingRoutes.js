import express from "express";
import {
  lockSeats,
  releaseSeats,
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/bookingController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { lockSeatsSchema, createBookingSchema } from "../validators/bookingValidator.js";

const router = express.Router();

router.use(authenticate);

router.post("/lock-seats", validate(lockSeatsSchema), lockSeats);
router.post("/release-seats", releaseSeats);
router.post("/", validate(createBookingSchema), createBooking);
router.get("/my", getMyBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

export default router;

