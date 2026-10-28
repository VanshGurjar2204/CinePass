import { sendError } from "../utils/response.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return sendError(res, 403, "Access denied. Admin privileges required.");
  }
  next();
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, "Access denied. Insufficient permissions.");
    }
    next();
  };
};

