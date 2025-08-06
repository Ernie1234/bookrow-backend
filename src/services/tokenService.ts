// services/tokenService.ts
import jwt from "jsonwebtoken";

import env from "../configs/envConfig";
import type { IUser } from "@/models/User";

export const generateTokens = (user: IUser) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      username: user.username,
      email: user.email,
      userImage: user.userImage,
    },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, username: user.username, email: user.email },
    env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  return { accessToken, refreshToken };
};
