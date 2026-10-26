import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { login as loginUser, registerAdmin as registerAdminUser } from "../services/auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginUser(email, password);

  res
    .status(200)
    .json(new ApiResponse(200, data, "Logged in successfully"));
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const data = await registerAdminUser(req.body);
  res.status(201).json(new ApiResponse(201, data, "Workspace registered successfully"));
});
