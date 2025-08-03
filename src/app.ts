import express from "express";
import cors from "cors";
import helmet from "helmet";

import env from "./configs/envConfig";
import apiRoutes from "./routes/index";
import morganMiddleware from "./middlewares/morgan-middleware";
import { errorHandler } from "./middlewares/error-handler";

const app = express();

// Middleware
app.use(
  cors({
    origin: [env.API_URL],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
app.use("/api/v1", apiRoutes);

// Enhanced Error Handling Middleware (must be the last middleware)
app.use(errorHandler);

export default app;
