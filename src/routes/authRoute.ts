import { Router } from "express";
import {
  googleAuth,
  googleAuthCallback,
  login,
  refreshToken,
  register,
  verifyToken,
} from "../controllers/authController";

const router = Router();

// Local registration route
router.post("/register", register);
router.post("/login", login);
router.get("/verify", verifyToken);
router.post("/refresh", refreshToken);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
