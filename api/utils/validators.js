export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const isEmail = (value) =>
  typeof value === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

export const isMongoId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

export const trimValue = (value) =>
  typeof value === "string" ? value.trim() : value;
