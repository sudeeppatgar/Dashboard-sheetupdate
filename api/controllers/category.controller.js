import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createCategory as createCategoryRecord,
  getCategories as getCategoryRecords,
  getCategoryById,
  updateCategory as updateCategoryRecord,
  deleteCategory as deleteCategoryRecord,
} from "../services/categories.service.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await createCategoryRecord(req.body);

  res.status(201).json(new ApiResponse(201, category, "Category created"));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await getCategoryRecords();

  res.json(new ApiResponse(200, categories, "Categories fetched"));
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);

  res.json(new ApiResponse(200, category, "Category fetched"));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await updateCategoryRecord(req.params.id, req.body);

  res.json(new ApiResponse(200, category, "Category updated"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await deleteCategoryRecord(req.params.id);

  res.json(new ApiResponse(200, null, "Category deleted"));
});
