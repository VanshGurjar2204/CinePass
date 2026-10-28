import { sendError } from "../utils/response.js";
import { ENV } from "../config/env.js";

export const notFoundHandler = (req, res) => {
  return sendError(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, _next) => {
  console.error(`[Error]: ${err.stack || err.message}`);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return sendError(res, 400, `Resource not found with invalid id: ${err.value}`);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return sendError(res, 409, `A record with this ${field} already exists`);
  }

  // Mongoose ValidationError
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 400, "Validation error", errors);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token has expired");
  }

  // Stripe Errors
  if (err.type && err.type.startsWith("Stripe")) {
    return sendError(res, 402, `Payment gateway error: ${err.message}`);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return sendError(
    res,
    statusCode,
    message,
    ENV.NODE_ENV === "development" ? [err.stack] : []
  );
};

