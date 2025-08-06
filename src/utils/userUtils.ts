// src/utils/userUtils.ts
import type { IUser } from "../models/User";

export const sanitizeUser = (user: IUser) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  userImage: user.userImage,
  currentBook: user.currentBook,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  readingGroups: user.readingGroups,
  readingNotifications: user.readingNotifications,
});
