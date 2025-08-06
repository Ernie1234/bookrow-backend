// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../configs/envConfig";
import UserModel from "../models/User";
import type { IUser } from "../models/User";
import passport from "passport";
import { generateTokens } from "@/services/tokenService";

// src/middlewares/authMiddleware.ts
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for access token
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify access token
    try {
      const decoded = jwt.verify(accessToken, env.JWT_SECRET!) as {
        userId: string;
      };
      req.user = (await UserModel.findById(decoded.userId).select(
        "-password"
      )) as IUser;
      return next();
    } catch (accessTokenError) {
      // Access token expired - try refresh token
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res
          .status(401)
          .json({ message: "Session expired, please login again" });
      }

      // Verify refresh token
      const refreshDecoded = jwt.verify(
        refreshToken,
        env.JWT_REFRESH_SECRET!
      ) as {
        userId: string;
        tokenVersion: number;
      };

      // Get user and check token version
      const user = await UserModel.findById(refreshDecoded.userId);
      if (!user || user.tokenVersion !== refreshDecoded.tokenVersion) {
        return res
          .status(401)
          .json({ message: "Invalid session, please login again" });
      }

      // Generate new tokens
      const newTokens = generateTokens(user);

      // Attach new access token to response
      res.locals.newAccessToken = newTokens.accessToken;

      // Set user in request
      req.user = user;

      // Continue to route
      next();
    }
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export const googleAuthMiddleware = passport.authenticate("google", {
  failureRedirect: "/login",
  session: false,
});
