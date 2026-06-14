import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ApiError } from "./utils/ApiError.js";
import router from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || true;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.options(/.*/, cors({ origin: corsOrigin, credentials: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use("/api", router);
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});
app.use(errorMiddleware);

export default app;
