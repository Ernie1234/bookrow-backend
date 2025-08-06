// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../configs/envConfig";
import UserModel from "../models/User";
import type { IUser } from "../models/User";
import passport from "passport";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

      // Get user from the token and attach it to the request object
      req.user = (await UserModel.findById(decoded.userId).select(
        "-password"
      )) as IUser;

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const googleAuthMiddleware = passport.authenticate("google", {
  failureRedirect: "/login",
  session: false,
});
