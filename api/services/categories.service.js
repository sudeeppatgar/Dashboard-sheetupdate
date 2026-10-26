import { ApiError } from "../utils/ApiError.js";
import Category from "../models/category.model.js";
import Record from "../models/record.model.js";

export const createCategory = (data, workspaceOwnerId) => Category.create({ name: data.name, workspaceOwnerId });

export const getCategories = (workspaceOwnerId) => Category.find({ workspaceOwnerId }).sort({ createdAt: -1 });

export const updateCategory = async (id, data, workspaceOwnerId) => {
  const current = await Category.findOne({ _id: id, workspaceOwnerId });
  if (!current) {
    throw new ApiError(404, "Category not found");
  }
  const category = await Category.findOneAndUpdate({ _id: id, workspaceOwnerId }, { name: data.name ?? current.name }, {
    new: true,
    runValidators: true,
  });

  return category;
};

export const deleteCategory = async (id, workspaceOwnerId) => {
  const category = await Category.findOne({ _id: id, workspaceOwnerId });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (await Record.exists({ categoryId: id, workspaceOwnerId })) {
    throw new ApiError(
      409,
      "Cannot delete category because it is referenced by one or more records",
    );
  }

  await Category.deleteOne({ _id: id, workspaceOwnerId });

  return category;
};
