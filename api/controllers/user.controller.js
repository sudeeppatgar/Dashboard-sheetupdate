import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { listUsers, createUser, updateUserRole, toggleUserStatus } from "../services/users.service.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await listUsers();
  res.json(new ApiResponse(200, users, "Users fetched"));
});

export const createUserHandler = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json(new ApiResponse(201, user, "User created"));
});

export const changeRole = asyncHandler(async (req, res) => {
  const user = await updateUserRole(req.params.id, req.body.role);
  res.json(new ApiResponse(200, user, "Role updated"));
});

export const toggleStatus = asyncHandler(async (req, res) => {
  const user = await toggleUserStatus(req.params.id, req.body.isActive);
  res.json(new ApiResponse(200, user, "Status updated"));
});
