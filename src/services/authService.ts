import { z } from "zod";
import bcrypt from "bcryptjs";

import UserModel from "../models/User";
import type { IUser } from "../models/User";
import Logger from "../libs/logger";
import {
  loginSchema,
  registerSchema,
} from "../validation/authValidationSchema";
import type { LoginData } from "../validation/authValidationSchema";
import { generateTokens } from "./tokenService";

type RegisterData = z.infer<typeof registerSchema>;

/**
 * Registers a new user with a hashed password.
 * @param userData - The user registration data.
 * @returns A promise that resolves to the new user document.
 */
// services/authService.ts
export const registerUser = async (
  userData: RegisterData
): Promise<{
  user: IUser;
  tokens: { accessToken: string; refreshToken: string };
}> => {
  try {
    const validatedData = registerSchema.parse(userData);

    const existingUser = await UserModel.findOne({
      email: validatedData.email,
    });
    if (existingUser) {
      throw new Error("User with that email already exists.");
    }

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${validatedData.username}`;

    // Add the generated avatar URL to the validated data before creating the user
    const userWithAvatarData = {
      ...validatedData,
      userImage: avatarUrl,
    };

    const user = new UserModel(userWithAvatarData);
    await user.save(); // Save first to get the _id

    const tokens = generateTokens(user); // Generate tokens after saving

    Logger.info(`New user registered: ${user.email}`);
    return { user, tokens };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Validation failed during registration.");
    }
    throw error;
  }
};

/**
 * Finds a user by their email.
 * @param email - The user's email.
 * @returns A promise that resolves to the user document or null.
 */
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return UserModel.findOne({ email });
};

/**
 * Defines a custom type for the Google profile to be more flexible
 * with Passport's output.
 */
type GoogleProfile = {
  id: string;
  displayName: string;
  emails?: { value: string; verified?: boolean }[];
  photos?: { value: string }[];
};

/**
 * Finds or creates a user based on their Google profile.
 * @param profile - The Google user profile.
 * @returns A promise that resolves to the user document.
 */
export const findOrCreateGoogleUser = async (
  profile: GoogleProfile
): Promise<IUser> => {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new Error("Google profile does not contain an email address.");
  }

  let user = await UserModel.findOne({ googleId: profile.id });

  if (!user) {
    Logger.info(`Creating new user with Google ID: ${profile.id}`);
    user = new UserModel({
      username: profile.displayName,
      email,
      googleId: profile.id,
      userImage: profile.photos?.[0]?.value,
    });
    await user.save();
  }

  Logger.info(`User authenticated via Google: ${user.email}`);
  return user;
};

export const loginUser = async (
  loginData: LoginData
): Promise<{
  user: IUser;
  tokens: { accessToken: string; refreshToken: string };
}> => {
  try {
    const validatedData = loginSchema.parse(loginData);
    const user = await UserModel.findOne({ email: validatedData.email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password as string
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const tokens = generateTokens(user);
    Logger.info(`User logged in: ${user.email}`);

    return { user, tokens };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error("Validation failed during login");
    }
    throw error;
  }
};
