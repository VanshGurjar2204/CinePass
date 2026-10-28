import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import { paymentService } from "../services/paymentService.js";
import { bookingService } from "../services/bookingService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { ENV } from "../config/env.js";

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ bookingId }).populate("movie");

    if (!booking) {
      return sendError(res, 404, "Booking not found");
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return sendError(res, 403, "Unauthorized access to this booking");
    }

    if (booking.bookingStatus === "confirmed") {
      return sendError(res, 400, "Booking is already paid and confirmed");
    }

    const session = await paymentService.createCheckoutSession({
      booking,
      movie: booking.movie,
      user: req.user,
      successUrl: `${ENV.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.bookingId}`,
      cancelUrl: `${ENV.FRONTEND_URL}/payment/cancel?booking_id=${booking.bookingId}`,
    });

    booking.stripeCheckoutSessionId = session.id;
    await booking.save();

    return sendSuccess(res, 200, "Checkout session created", session);
  } catch (error) {
    next(error);
  }
};

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return sendError(res, 404, "Booking not found");
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return sendError(res, 403, "Unauthorized access to this booking");
    }

    if (booking.bookingStatus === "confirmed") {
      return sendError(res, 400, "Booking is already paid and confirmed");
    }

    const intent = await paymentService.createPaymentIntent({
      amount: booking.totalAmount,
      bookingId: booking.bookingId,
      metadata: { userId: req.user._id.toString() },
    });

    booking.stripePaymentIntentId = intent.id;
    await booking.save();

    return sendSuccess(res, 200, "Payment intent created", intent);
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { bookingId, sessionId, paymentIntentId } = req.body;

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return sendError(res, 404, "Booking not found");
    }

    // Confirm booking idempotently
    const confirmedBooking = await bookingService.confirmBooking(bookingId, {
      sessionId,
      paymentIntentId,
      paymentMethod: "card",
    });

    return sendSuccess(res, 200, "Payment verified and booking confirmed", confirmedBooking);
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = paymentService.constructEvent(req.body, sig);
  } catch (err) {
    console.error(`[Stripe Webhook Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        try {
          await bookingService.confirmBooking(bookingId, {
            sessionId: session.id,
            paymentIntentId: session.payment_intent,
            paymentMethod: "card",
          });
          console.log(`[Stripe Webhook] Confirmed booking: ${bookingId}`);
        } catch (confirmErr) {
          console.error(`[Stripe Webhook Error on Confirm]: ${confirmErr.message}`);
        }
      }
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata?.bookingId;
      if (bookingId) {
        try {
          await bookingService.confirmBooking(bookingId, {
            paymentIntentId: paymentIntent.id,
            paymentMethod: "card",
          });
        } catch (confirmErr) {
          console.error(`[Stripe Webhook Intent Confirm Error]: ${confirmErr.message}`);
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const failedIntent = event.data.object;
      const bookingId = failedIntent.metadata?.bookingId;
      if (bookingId) {
        await Booking.findOneAndUpdate(
          { bookingId },
          { paymentStatus: "failed", bookingStatus: "pending" }
        );
      }
      break;
    }
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
};

