import Notification from "../models/Notification.js";
import { emailService } from "./emailService.js";
import { smsService } from "./smsService.js";

class NotificationService {
  /**
   * Create an in-app notification
   */
  async createNotification({ userId, title, message, type = "general", data = {} }) {
    try {
      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        data,
      });
      return notification;
    } catch (error) {
      console.error(`[NotificationService Error]: ${error.message}`);
      return null;
    }
  }

  /**
   * Dispatch full suite of notifications upon booking confirmation
   */
  async notifyBookingConfirmed({ user, booking, movie, theater, screen, show }) {
    // 1. In-app notification
    const inAppTitle = `Booking Confirmed: ${movie.title}`;
    const inAppMsg = `Your tickets for ${movie.title} at ${theater.name} (${show.showDate} ${show.startTime}) are confirmed! Booking ID: ${booking.bookingId}`;
    await this.createNotification({
      userId: user._id,
      title: inAppTitle,
      message: inAppMsg,
      type: "booking_confirmation",
      data: { bookingId: booking.bookingId, showId: show._id, movieId: movie._id },
    });

    // 2. Email confirmation with ticket
    await emailService.sendBookingConfirmation(user, booking, movie, theater, screen, show);

    // 3. SMS confirmation
    if (user.phone) {
      await smsService.sendBookingConfirmation(
        user.phone,
        booking.bookingId,
        movie.title,
        `${show.showDate} ${show.startTime}`
      );
    }
  }

  /**
   * Payment receipt notification
   */
  async notifyPaymentReceipt({ user, booking, amount }) {
    await this.createNotification({
      userId: user._id,
      title: "Payment Received",
      message: `Your payment of $${amount.toFixed(2)} for booking ${booking.bookingId} was successfully processed.`,
      type: "payment_receipt",
      data: { bookingId: booking.bookingId, amount },
    });

    await emailService.sendPaymentReceipt(user, booking, amount);
  }

  /**
   * Upcoming show reminder
   */
  async notifyUpcomingShow({ user, movie, theater, showTime, bookingId }) {
    await this.createNotification({
      userId: user._id,
      title: `Reminder: ${movie.title} starts soon!`,
      message: `Your show for ${movie.title} at ${theater.name} starts in 2 hours at ${showTime}. Please arrive 15 minutes early.`,
      type: "upcoming_show",
      data: { bookingId },
    });
  }

  /**
   * Upcoming movie release notification
   */
  async notifyUpcomingMovieRelease({ user, movie }) {
    await this.createNotification({
      userId: user._id,
      title: `Now Showing: ${movie.title}!`,
      message: `A movie you were waiting for, ${movie.title}, is now showing! Tickets are now available.`,
      type: "upcoming_movie",
      data: { movieId: movie._id, slug: movie.slug },
    });
  }
}

export const notificationService = new NotificationService();

