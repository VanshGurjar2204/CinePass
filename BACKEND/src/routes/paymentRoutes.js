import express from "express";
import {
  createCheckoutSession,
  createPaymentIntent,
  verifyPayment,
  handleWebhook,
} from "../controllers/paymentController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Stripe Webhook needs raw body, handled in app.js or raw handler
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

// Protected payment endpoints
router.post("/create-checkout-session", authenticate, createCheckoutSession);
router.post("/create-payment-intent", authenticate, createPaymentIntent);
router.post("/verify", authenticate, verifyPayment);

export default router;

