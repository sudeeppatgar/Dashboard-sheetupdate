export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";
