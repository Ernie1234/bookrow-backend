import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session"; // Import express-session

import env from "./configs/envConfig";
import apiRoutes from "./routes/index";
import morganMiddleware from "./middlewares/morgan-middleware";
import { errorHandler } from "./middlewares/error-handler";
import passport from "passport";
import "./configs/passport";

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

// Configure express-session middleware
app.use(
  session({
    secret: env.JWT_SECRET, // Use a secret from your environment variables
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Passport middleware should be initialized after express-session
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
app.use("/api/v1", apiRoutes);

// Enhanced Error Handling Middleware (must be the last middleware)
app.use(errorHandler);

export default app;
