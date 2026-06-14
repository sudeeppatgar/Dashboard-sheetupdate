import { ApiError } from "../utils/ApiError.js";

const runSchema = async (source, schema) => {
  const errors = [];
  const output = { ...source };

  for (const [field, rule] of Object.entries(schema)) {
    const rawValue = source[field];
    const hasValue =
      rawValue !== undefined && rawValue !== null && rawValue !== "";

    if (!hasValue) {
      if (rule.required) {
        errors.push({
          field,
          message: rule.message || `${field} is required`,
        });
      }
      continue;
    }

    const value =
      typeof rule.transform === "function" ? rule.transform(rawValue) : rawValue;
    output[field] = value;

    if (rule.type && typeof value !== rule.type) {
      errors.push({
        field,
        message: rule.message || `${field} must be of type ${rule.type}`,
      });
      continue;
    }

    if (
      rule.type === "string" &&
      typeof value === "string" &&
      rule.trim !== false
    ) {
      output[field] = value.trim();
    }

    const normalized = output[field];
    const length = String(normalized ?? "").length;

    if (rule.minLength && length < rule.minLength) {
      errors.push({
        field,
        message:
          rule.message || `${field} must be at least ${rule.minLength} characters`,
      });
    }

    if (rule.maxLength && length > rule.maxLength) {
      errors.push({
        field,
        message:
          rule.message || `${field} must be at most ${rule.maxLength} characters`,
      });
    }

    if (rule.pattern && !rule.pattern.test(String(normalized))) {
      errors.push({
        field,
        message: rule.message || `${field} is invalid`,
      });
    }

    if (rule.enum && !rule.enum.includes(normalized)) {
      errors.push({
        field,
        message:
          rule.message ||
          `${field} must be one of: ${rule.enum.join(", ")}`,
      });
    }

    if (typeof rule.validate === "function") {
      const result = await rule.validate(normalized, source);
      if (result !== true && result !== undefined) {
        errors.push({
          field,
          message: typeof result === "string" ? result : rule.message || `${field} is invalid`,
        });
      }
    }
  }

  return { errors, output };
};

const createValidator = (schema, sourceKey = "body") => async (req, res, next) => {
  try {
    const source = req[sourceKey] ?? {};
    const { errors, output } = await runSchema(source, schema);

    if (errors.length > 0) {
      throw new ApiError(400, "Validation failed", errors);
    }

    req[sourceKey] = output;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateBody = (schema) => createValidator(schema, "body");
export const validateParams = (schema) => createValidator(schema, "params");
export const validateQuery = (schema) => createValidator(schema, "query");
