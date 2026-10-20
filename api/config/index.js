import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});

const DEFAULT_PORT = 4000;
const DEFAULT_JWT_SECRET = "development-secret";
const DEFAULT_JWT_EXPIRES_IN = "1w";
const environment = process.env.NODE_ENV?.trim() || "development";
const isProduction = environment === "production";

const readEnv = (name) => {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : undefined;
};

const parsePort = (value) => {
  if (!value) {
    if (isProduction) {
      throw new Error("PORT is required in production");
    }

    return DEFAULT_PORT;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  const port = Number(value);

  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  return port;
};

const isValidJwtExpiresIn = (value) => {
  const match = /^(\d+(?:\.\d+)?)(?:\s*(?:milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y))?$/i.exec(
    value,
  );

  return Boolean(match) && Number.isFinite(Number(match[1])) && Number(match[1]) > 0;
};

const parseJwtExpiresIn = (value) => {
  if (!value) {
    if (isProduction) {
      throw new Error("JWT_EXPIRES_IN is required in production");
    }

    return DEFAULT_JWT_EXPIRES_IN;
  }

  if (!isValidJwtExpiresIn(value)) {
    throw new Error("JWT_EXPIRES_IN must be a valid positive duration");
  }

  return value;
};

const isValidCorsOrigin = (value) => {
  if (value === "*") {
    return false;
  }

  try {
    const origin = new URL(value);

    return (
      ["http:", "https:"].includes(origin.protocol) &&
      !origin.username &&
      !origin.password &&
      origin.pathname === "/" &&
      !origin.search &&
      !origin.hash
    );
  } catch {
    return false;
  }
};

const parseCorsOrigin = (value) => {
  if (!value) {
    if (isProduction) {
      throw new Error("CORS_ORIGIN is required in production");
    }

    return true;
  }

  const origins = value.split(",").map((origin) => origin.trim());

  if (origins.some((origin) => !isValidCorsOrigin(origin))) {
    throw new Error("CORS_ORIGIN must contain valid http(s) origins");
  }

  return origins.length === 1 ? origins[0] : origins;
};

const dbUri = readEnv("MONGODB_URI");
const jwtSecretValue = readEnv("JWT_SECRET");
const jwtExpiresInValue = readEnv("JWT_EXPIRES_IN");

if (isProduction && !dbUri) {
  throw new Error("MONGODB_URI is required in production");
}

if (isProduction && (!jwtSecretValue || jwtSecretValue === DEFAULT_JWT_SECRET)) {
  throw new Error("JWT_SECRET must be set to a non-development value in production");
}

export const config = {
  environment,
  isProduction,
  port: parsePort(readEnv("PORT")),
  dbUri,
  jwtSecret: jwtSecretValue || DEFAULT_JWT_SECRET,
  jwtExpiresIn: parseJwtExpiresIn(jwtExpiresInValue),
  corsOrigin: parseCorsOrigin(readEnv("CORS_ORIGIN")),
};
