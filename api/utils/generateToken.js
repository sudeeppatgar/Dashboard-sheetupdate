import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const generateToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || "1w",
  });

export default generateToken;
