import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const listUsers = () => User.find().select("-password").sort({ createdAt: -1 });

export const createUser = async (data) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new ApiError(409, "User already exists");
  return User.create(data);
};

export const updateUserRole = async (id, role) => {
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const toggleUserStatus = async (id, isActive) => {
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};
