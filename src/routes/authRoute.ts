import { Router } from "express";
import {
  googleAuth,
  googleAuthCallback,
  login,
  register,
} from "../controllers/authController";

const router = Router();

// Local registration route
router.post("/register", register);
router.post("/login", login);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
