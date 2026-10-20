import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { login as loginUser } from "../services/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginUser(email, password);

  res
    .status(200)
    .json(new ApiResponse(200, data, "Logged in successfully"));
});
