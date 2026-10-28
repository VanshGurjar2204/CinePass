import Booking from "../models/Booking.js";
import { bookingService } from "../services/bookingService.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const lockSeats = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user._id;

    const lockResult = await bookingService.lockSeats({
      showId,
      seatIds,
      userId,
    });

    return sendSuccess(res, 200, "Seats reserved successfully", lockResult);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const releaseSeats = async (req, res, next) => {
  try {
    const { showId } = req.body;
    const userId = req.user._id;

    await bookingService.releaseSeats({ showId, userId });
    return sendSuccess(res, 200, "Seats released successfully");
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user._id;

    const booking = await bookingService.createPendingBooking({
      showId,
      seatIds,
      userId,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("movie")
      .populate("theater")
      .populate("screen")
      .populate("show");

    return sendSuccess(res, 201, "Booking initialized", populatedBooking);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query; // 'upcoming', 'completed', 'cancelled'

    const query = { user: userId };
    if (status && ["pending", "confirmed", "cancelled"].includes(status)) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate("movie")
      .populate("theater")
      .populate("screen")
      .populate("show")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "User bookings fetched", bookings);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    })
      .populate("user", "name email phone")
      .populate("movie")
      .populate("theater")
      .populate("screen")
      .populate("show");

    if (!booking) {
      return sendError(res, 404, "Booking not found");
    }

    // Security check: regular user cannot access someone else's booking
    if (req.user.role !== "admin" && booking.user._id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Access denied to this booking");
    }

    return sendSuccess(res, 200, "Booking fetched", booking);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === "admin";
    const cancelledBooking = await bookingService.cancelBooking(id, req.user._id, isAdmin);
    return sendSuccess(res, 200, "Booking cancelled successfully", cancelledBooking);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

