import { Router } from "express";
import {
  googleAuth,
  googleAuthCallback,
  register,
} from "../controllers/authController";

const router = Router();

// Local registration route
router.post("/register", register);

// Google OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);

export default router;
