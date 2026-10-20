import { ApiError } from "../utils/ApiError.js";
import Category from "../models/category.model.js";

export const createCategory = (data) => Category.create(data);

export const getCategories = () => Category.find().sort({ createdAt: -1 });

export const getCategoryById = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};
