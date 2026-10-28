import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movie_booking_db",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "cinepass_jwt_access_super_secret_key_2026",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "cinepass_jwt_refresh_super_secret_key_2026",
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "1d",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",

  STRIPE_SECRET_KEY: (process.env.STRIPE_SECRET_KEY || "sk_test_51MockStripeSecretKeyForDevelopmentTesting1234567890").trim(),
  STRIPE_PUBLISHABLE_KEY: (process.env.STRIPE_PUBLISHABLE_KEY || "pk_test_51MockStripePubKeyForDevelopmentTesting1234567890").trim(),
  STRIPE_WEBHOOK_SECRET: (process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_stripe_webhook_secret_for_testing").trim(),

  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 465,
  EMAIL_USER: (process.env.EMAIL_USER || "").trim(),
  EMAIL_PASS: (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "").trim(),
  EMAIL_PASSWORD: (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || "").trim(),
  EMAIL_FROM: (process.env.EMAIL_FROM || process.env.EMAIL_USER || "mayap9889@gmail.com").trim(),

  SMS_PROVIDER: (process.env.SMS_PROVIDER || "mock").trim(),
  SMS_API_KEY: (process.env.SMS_API_KEY || "mock_sms_key").trim(),
  SMS_SENDER_ID: (process.env.SMS_SENDER_ID || "CINEPASS").trim(),
  SMS_ROUTE: (process.env.SMS_ROUTE || "transactional").trim(),
  SMS_TEMPLATE_ID: process.env.SMS_TEMPLATE_ID ? Number(process.env.SMS_TEMPLATE_ID) : undefined,

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  NODE_ENV: process.env.NODE_ENV || "development",
};

