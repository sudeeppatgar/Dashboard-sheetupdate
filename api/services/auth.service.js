import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/generateToken.js";
import User from "../models/user.model.js";

export const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user._id);
  const userData = user.toObject();
  delete userData.password;

  return { user: userData, token };
};

export const authenticateRequest = async ({ token, model, jwtSecret }) => {
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

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Invalid or expired token.");
  }
};
