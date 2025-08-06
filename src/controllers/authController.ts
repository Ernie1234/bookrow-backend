import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import passport from "passport";
import jwt from "jsonwebtoken";

import env from "../configs/envConfig";
import { loginUser, registerUser } from "../services/authService";
import { ApiError } from "../middlewares/error-handler";
import {
  loginSchema,
  registerSchema,
} from "../validation/authValidationSchema";
import type {
  LoginData,
  RegisterData,
} from "../validation/authValidationSchema";
import Logger from "@/libs/logger";
import { generateTokens } from "@/services/tokenService";
import UserModel from "@/models/User";

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
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const tokens = generateTokens(req.user);
  res.redirect(
    `/auth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`
  );
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
        currentBook: user.currentBook,
        createAt: user.createdAt,
        updatedAt: user.updatedAt,
        readingGroups: user.readingGroups,
        readingNotifications: user.readingNotifications,
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
export const refreshToken = async (oldRefreshToken: string) => {
  // Verify token
  const decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET!) as {
    userId: string;
  };

  // Check if token exists in DB (you'll need to add this to your User model)
  const user = await UserModel.findOne({
    _id: decoded.userId,
    refreshTokens: oldRefreshToken,
  });

  if (!user) {
    throw new Error("Invalid refresh token");
  }

  // Generate new tokens
  const tokens = generateTokens(user);

  // Update user's refresh tokens
  await UserModel.findByIdAndUpdate(user._id, {
    $pull: { refreshTokens: oldRefreshToken },
    $push: { refreshTokens: tokens.refreshToken },
  });

  return tokens;
};

// In your authController.ts
export const logout = async (req: Request, res: Response) => {
  try {
    // Increment token version to invalidate all refresh tokens
    await UserModel.findByIdAndUpdate(req.user?._id, {
      $inc: { tokenVersion: 1 },
    });

    // Clear cookies if using them
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
