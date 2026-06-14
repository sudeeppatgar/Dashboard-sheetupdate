export const strongPasswordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const isEmail = (value) =>
  typeof value === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

export const isPhoneNumber = (value) =>
  typeof value === "string" &&
  /^\+?[0-9]{7,15}$/.test(value.replace(/\s+/g, ""));

export const isMongoId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

export const trimValue = (value) =>
  typeof value === "string" ? value.trim() : value;
