import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { config } from "../config/index.js";

export const createAuthMiddleware = ({ model, jwtSecret }) => {
  const protect = asyncHandler(async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Unauthorized access. No token provided.");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await model.findById(decoded.id);

      if (!user) {
        throw new ApiError(401, "Invalid token. User not found");
      }

      if (user.isActive === false) {
        throw new ApiError(403, "Your account is inactive. Contact support");
      }

      if (user.passwordChangedAt) {
        const passwordChangedAt = parseInt(
          user.passwordChangedAt.getTime() / 1000,
          10,
        );

        if (passwordChangedAt > decoded.iat) {
          throw new ApiError(
            401,
            "Password changed recently. Please log in again.",
          );
        }
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(401, "Invalid or expired token.");
    }
  });

  const restrictTo =
    (...roles) =>
    (req, res, next) => {
      if (!req.user) {
        throw new ApiError(401, "Unauthorized access.");
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, "Access denied. Insufficient permission");
      }
      next();
    };

  return { protect, restrictTo };
};

export const { protect, restrictTo } = createAuthMiddleware({
  model: User,
  jwtSecret: config.jwtSecret,
});
