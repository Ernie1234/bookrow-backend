import express from "express";
import cors from "cors";
import helmet from "helmet";

import env from "./configs/envConfig";
import apiRoutes from "./routes/index";
import morganMiddleware from "./middlewares/morgan-middleware";
import Logger from "./libs/logger";

const app = express();

// Middleware
app.use(
  cors({
    origin: [env.MOBILE_APP_BASE_URL],
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

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    Logger.error(err.stack);
    res.status(500).json({
      error: "Internal Server Error",
      requestId: req.headers["x-request-id"],
    });
  }
);

export default app;
