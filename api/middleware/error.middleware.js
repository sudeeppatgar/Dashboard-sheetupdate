
import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware = (err, req, res, next) => {
  const statusCode =
    err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  if (err.name === "CastError") {
    message = `Invalid ${err.path}`;
    errors = [{ field: err.path, message }];
  }

  if (err.name === "ValidationError" && err.errors) {
    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    message = "Validation failed";
  }

  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
    message = `${duplicateField} already exists`;
    errors = [{ field: duplicateField, message }];
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack || err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
