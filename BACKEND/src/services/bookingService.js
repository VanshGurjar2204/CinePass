import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import SeatLock from "../models/SeatLock.js";
import Seat from "../models/Seat.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import Theater from "../models/Theater.js";
import Screen from "../models/Screen.js";
import { notificationService } from "./notificationService.js";

const LOCK_DURATION_MS = 8 * 60 * 1000; // 8 minutes

class BookingService {
  /**
   * Clean expired locks for a given show (or globally)
   */
  async cleanExpiredLocks(showId = null) {
    const query = { expiresAt: { $lte: new Date() } };
    if (showId && showId !== "null" && showId !== "undefined" && mongoose.Types.ObjectId.isValid(showId)) {
      query.show = showId;
    }
    await SeatLock.deleteMany(query);
  }

  /**
   * Get all seats for a show with their live status:
   * 'available', 'selected' (if locked by req user), 'locked' (locked by someone else), 'booked', 'disabled'
   */
  async getShowSeatMap(showId, currentUserId = null) {
    await this.cleanExpiredLocks(showId);

    const show = await Show.findById(showId)
      .populate("movie")
      .populate("theater")
      .populate("screen");

    if (!show) {
      throw new Error("Show not found");
    }

    // Get all screen seats
    const allSeats = await Seat.find({ screen: show.screen._id }).sort({ row: 1, seatNumber: 1 });

    // Find confirmed bookings or recent pending bookings for this show
    const activeBookings = await Booking.find({
      show: showId,
      $or: [
        { bookingStatus: "confirmed" },
        {
          bookingStatus: "pending",
          createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
      ],
    }).select("seats bookingStatus");

    const bookedSeatIds = new Set();
    activeBookings.forEach((b) => {
      b.seats.forEach((s) => bookedSeatIds.add(s.seat.toString()));
    });

    // Find active seat locks for this show
    const activeLocks = await SeatLock.find({
      show: showId,
      expiresAt: { $gt: new Date() },
    });

    const lockedByOthers = new Set();
    const lockedByMe = new Set();

    activeLocks.forEach((lock) => {
      if (currentUserId && lock.user.toString() === currentUserId.toString()) {
        lockedByMe.add(lock.seat.toString());
      } else {
        lockedByOthers.add(lock.seat.toString());
      }
    });

    // Map each seat with computed status
    const seatsWithStatus = allSeats.map((seat) => {
      const sId = seat._id.toString();
      let status = "available";

      if (seat.status === "disabled") {
        status = "disabled";
      } else if (bookedSeatIds.has(sId)) {
        status = "booked";
      } else if (lockedByOthers.has(sId)) {
        status = "locked";
      } else if (lockedByMe.has(sId)) {
        status = "selected_by_you";
      }

      // Calculate seat price based on show base ticketPrice & multiplier
      const calculatedPrice = Number((show.ticketPrice * seat.priceMultiplier).toFixed(2));

      return {
        _id: seat._id,
        row: seat.row,
        seatNumber: seat.seatNumber,
        seatLabel: seat.seatLabel,
        seatType: seat.seatType,
        priceMultiplier: seat.priceMultiplier,
        price: calculatedPrice,
        status,
      };
    });

    return {
      show,
      seats: seatsWithStatus,
    };
  }

  /**
   * Temporarily lock seats for a user
   */
  async lockSeats({ showId, seatIds, userId }) {
    await this.cleanExpiredLocks(showId);

    const show = await Show.findById(showId);
    if (!show || show.status !== "scheduled") {
      throw new Error("Show is not available for booking");
    }

    // 1. Verify all seats exist on the show's screen
    const seats = await Seat.find({
      _id: { $in: seatIds },
      screen: show.screen,
      status: "active",
    });

    if (seats.length !== seatIds.length) {
      throw new Error("One or more selected seats are invalid or unavailable");
    }

    // 2. Check if already permanently booked in confirmed bookings
    const existingBooked = await Booking.findOne({
      show: showId,
      bookingStatus: "confirmed",
      "seats.seat": { $in: seatIds },
    });

    if (existingBooked) {
      throw new Error("One or more selected seats have already been permanently booked");
    }

    // 3. Check if locked by another user
    const existingLocks = await SeatLock.find({
      show: showId,
      seat: { $in: seatIds },
      user: { $ne: userId },
      expiresAt: { $gt: new Date() },
    });

    if (existingLocks.length > 0) {
      const conflictLabels = existingLocks.map((l) => l.seatLabel).join(", ");
      throw new Error(`Seats already selected by another customer: ${conflictLabels}`);
    }

    // 4. Release any older locks this user had for other seats on this show
    await SeatLock.deleteMany({
      show: showId,
      user: userId,
      seat: { $nin: seatIds },
    });

    // 5. Create or extend lock records with 8-minute expiry
    const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
    const lockPromises = seats.map(async (seat) => {
      return SeatLock.findOneAndUpdate(
        { show: showId, seat: seat._id },
        {
          show: showId,
          seat: seat._id,
          seatLabel: seat.seatLabel,
          user: userId,
          expiresAt,
          lockedAt: new Date(),
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    });

    await Promise.all(lockPromises);

    return {
      locked: true,
      expiresAt,
      seatCount: seats.length,
      seats: seats.map((s) => ({
        _id: s._id,
        seatLabel: s.seatLabel,
        seatType: s.seatType,
        price: Number((show.ticketPrice * s.priceMultiplier).toFixed(2)),
      })),
    };
  }

  /**
   * Release seat locks held by a user
   */
  async releaseSeats({ showId, userId }) {
    const query = { user: userId };
    if (showId) query.show = showId;
    await SeatLock.deleteMany(query);
  }

  /**
   * Initialize a booking (pending state before payment)
   */
  async createPendingBooking({ showId, seatIds, userId }) {
    await this.cleanExpiredLocks(showId);

    const show = await Show.findById(showId)
      .populate("movie")
      .populate("theater")
      .populate("screen");

    if (!show) {
      throw new Error("Show not found");
    }

    const seats = await Seat.find({
      _id: { $in: seatIds },
      screen: show.screen._id,
    });

    if (seats.length !== seatIds.length) {
      throw new Error("Selected seats could not be found");
    }

    // Verify user holds active locks for all these seats
    const userLocks = await SeatLock.find({
      show: showId,
      seat: { $in: seatIds },
      user: userId,
      expiresAt: { $gt: new Date() },
    });

    if (userLocks.length !== seatIds.length) {
      throw new Error("Your seat reservation has expired. Please select seats again.");
    }

    // Calculate subtotal and total
    const seatItems = seats.map((seat) => {
      const price = Number((show.ticketPrice * seat.priceMultiplier).toFixed(2));
      return {
        seat: seat._id,
        seatLabel: seat.seatLabel,
        seatType: seat.seatType,
        price,
      };
    });

    const subtotal = Number(seatItems.reduce((acc, curr) => acc + curr.price, 0).toFixed(2));
    const convenienceFee = 2.5;
    const taxAmount = Number((subtotal * 0.05).toFixed(2)); // 5% tax
    const totalAmount = Number((subtotal + convenienceFee + taxAmount).toFixed(2));

    const bookingId = `CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const booking = await Booking.create({
      bookingId,
      user: userId,
      movie: show.movie._id,
      theater: show.theater._id,
      screen: show.screen._id,
      show: show._id,
      seats: seatItems,
      ticketCount: seatItems.length,
      subtotal,
      convenienceFee,
      taxAmount,
      totalAmount,
      bookingStatus: "pending",
      paymentStatus: "pending",
      bookingDate: new Date(),
      qrCodeData: `CINEPASS|${bookingId}|${userId}|${totalAmount}`,
    });

    return booking;
  }

  /**
   * Confirm booking after successful payment
   * IDEMPOTENT: If already confirmed, returns without duplicate work.
   */
  async confirmBooking(bookingId, paymentDetails = {}) {
    const booking = await Booking.findOne({ bookingId })
      .populate("user")
      .populate("movie")
      .populate("theater")
      .populate("screen")
      .populate("show");

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (booking.bookingStatus === "confirmed") {
      return booking; // Idempotent check
    }

    // Update status to confirmed
    booking.bookingStatus = "confirmed";
    booking.paymentStatus = "paid";
    if (paymentDetails.paymentIntentId) {
      booking.stripePaymentIntentId = paymentDetails.paymentIntentId;
    }
    if (paymentDetails.sessionId) {
      booking.stripeCheckoutSessionId = paymentDetails.sessionId;
    }
    if (paymentDetails.paymentMethod) {
      booking.paymentMethod = paymentDetails.paymentMethod;
    }

    await booking.save();

    // Release locks so seats are now permanently held via the confirmed booking
    const seatIds = booking.seats.map((s) => s.seat);
    await SeatLock.deleteMany({
      show: booking.show._id,
      seat: { $in: seatIds },
    });

    // Send notifications (Email, SMS, In-app)
    try {
      await notificationService.notifyBookingConfirmed({
        user: booking.user,
        booking,
        movie: booking.movie,
        theater: booking.theater,
        screen: booking.screen,
        show: booking.show,
      });

      await notificationService.notifyPaymentReceipt({
        user: booking.user,
        booking,
        amount: booking.totalAmount,
      });
    } catch (notifyErr) {
      console.warn(`[BookingService] Notification delivery warning: ${notifyErr.message}`);
    }

    return booking;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, isAdmin = false) {
    const query = { bookingId };
    if (!isAdmin) {
      query.user = userId;
    }

    const booking = await Booking.findOne(query)
      .populate("user")
      .populate("movie");

    if (!booking) {
      throw new Error("Booking not found or unauthorized");
    }

    if (booking.bookingStatus === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    // Create in-app notification
    await notificationService.createNotification({
      userId: booking.user._id,
      title: "Booking Cancelled",
      message: `Your booking ${booking.bookingId} for ${booking.movie.title} has been cancelled. Refund will be processed.`,
      type: "general",
      data: { bookingId: booking.bookingId },
    });

    return booking;
  }
}

export const bookingService = new BookingService();
