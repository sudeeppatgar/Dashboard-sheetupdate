import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { config } from "../config/index.js";
import { authenticateRequest } from "../services/auth.service.js";

export const createAuthMiddleware = ({ model, jwtSecret }) => {
  const protect = asyncHandler(async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    const user = await authenticateRequest({ token, model, jwtSecret });
    req.user = user;
    next();
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
