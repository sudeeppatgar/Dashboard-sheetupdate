import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ApiError } from "./utils/ApiError.js";
import router from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { config } from "./config/index.js";

const app = express();
const corsOptions = {
  origin: config.corsOrigin,
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api", router);
app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});
app.use(errorMiddleware);

export default app;
