import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/generateToken.js";
import User from "../models/user.model.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

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

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: userData, token }, "Logged in successfully"),
    );
});
