import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import passport from "passport";
import jwt from "jsonwebtoken";

import env from "../configs/envConfig";
import { loginUser, registerUser } from "../services/authService";
import { ApiError } from "../middlewares/error-handler";
import {
  LoginData,
  loginSchema,
  RegisterData,
  registerSchema,
} from "../validation/authValidationSchema";

/**
 * @function register
 * @description Controller to handle local user registration.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedBody: RegisterData = registerSchema.parse(req.body);
    const { user, tokens } = await registerUser(validatedBody);

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        userImage: user.userImage,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Pass Zod validation errors to the error handler
      return next(error);
    }
    // Pass other errors to the error handler with a custom status code
    next(new ApiError(400, "Registration failed", error));
  }
};

/**
 * @function googleAuth
 * @description Initiates the Google OAuth 2.0 authentication flow.
 */
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

/**
 * @function googleAuthCallback
 * @description Handles the callback from Google OAuth 2.0.
 */
export const googleAuthCallback = (req: Request, res: Response) => {
  // Authentication successful, redirect or send a token
  res.redirect("/api/v1/profile");
};

/**
 * @function getUserProfile
 * @description A protected route to get the user's profile.
 */
export const getUserProfile = (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.status(200).json({
    message: "User profile fetched successfully",
    user: req.user,
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedBody: LoginData = loginSchema.parse(req.body);
    const { user, tokens } = await loginUser(validatedBody);

    res.status(200).json({
      message: "Login successful",
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        userImage: user.userImage,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(error);
    }
    next(new ApiError(401, "Login failed", error));
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ valid: false });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, env.JWT_SECRET!);
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
};

// controllers/authController.ts
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET!) as {
      userId: string;
    };

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
