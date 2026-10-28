import Stripe from "stripe";
import { ENV } from "../config/env.js";

class PaymentService {
  constructor() {
    this.stripe = null;
    this.isLive = false;
    this.init();
  }

  init() {
    if (
      ENV.STRIPE_SECRET_KEY &&
      !ENV.STRIPE_SECRET_KEY.includes("MockStripeSecretKey") &&
      ENV.STRIPE_SECRET_KEY.startsWith("sk_")
    ) {
      this.stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
      this.isLive = true;
    } else {
      // Mock/test mode stripe instance
      this.stripe = new Stripe(ENV.STRIPE_SECRET_KEY || "sk_test_placeholder");
      this.isLive = false;
    }
  }

  /**
   * Create a Stripe Checkout Session
   */
  async createCheckoutSession({ booking, movie, user, successUrl, cancelUrl }) {
    if (!this.isLive) {
      // Development simulated session
      const simulatedSessionId = `cs_test_mock_${Date.now()}_${booking._id}`;
      return {
        id: simulatedSessionId,
        url: `${ENV.FRONTEND_URL}/payment/success?session_id=${simulatedSessionId}&booking_id=${booking.bookingId}`,
        isSimulated: true,
      };
    }

    try {
      const movieTitle = movie?.title || "Movie Tickets";
      const posterImage = movie?.poster && movie.poster.startsWith("http") ? [movie.poster] : [];

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: user?.email,
        client_reference_id: booking._id?.toString(),
        metadata: {
          bookingId: booking.bookingId,
          userId: user?._id?.toString() || "",
          movieId: movie?._id?.toString() || "",
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${movieTitle} - ${booking.ticketCount} Ticket(s)`,
                description: `Seats: ${booking.seats?.map((s) => s.seatLabel).join(", ") || ""}`,
                ...(posterImage.length > 0 ? { images: posterImage } : {}),
              },
              unit_amount: Math.max(50, Math.round(booking.totalAmount * 100)), // Stripe requires at least 50 cents
            },
            quantity: 1,
          },
        ],
        success_url: successUrl || `${ENV.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.bookingId}`,
        cancel_url: cancelUrl || `${ENV.FRONTEND_URL}/payment/cancel?booking_id=${booking.bookingId}`,
      });

      return {
        id: session.id,
        url: session.url,
        isSimulated: false,
      };
    } catch (error) {
      console.error(`[PaymentService Error]: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a Stripe PaymentIntent for inline card forms
   */
  async createPaymentIntent({ amount, bookingId, metadata = {} }) {
    if (!this.isLive) {
      return {
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
        id: `pi_mock_${Date.now()}`,
        isSimulated: true,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: {
        bookingId,
        ...metadata,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      isSimulated: false,
    };
  }

  /**
   * Construct webhook event with signature verification
   */
  constructEvent(payload, signature) {
    if (!this.isLive) {
      // Mock event parsing in test mode
      return typeof payload === "string" ? JSON.parse(payload) : payload;
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      ENV.STRIPE_WEBHOOK_SECRET
    );
  }
}

export const paymentService = new PaymentService();

