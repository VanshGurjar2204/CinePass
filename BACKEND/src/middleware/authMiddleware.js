import { verifyAccessToken } from "../utils/jwt.js";
import { sendError } from "../utils/response.js";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return sendError(res, 401, "Authentication token required");
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return sendError(res, 401, "Invalid or expired authentication token");
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(res, 401, "User not found or deleted");
    }

    if (!user.isActive) {
      return sendError(res, 403, "Account has been deactivated. Contact support.");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 500, "Authentication error", [error.message]);
  }
};

