// validation/authValidationSchema.ts
import { z } from "zod";

const usernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(30, { message: "Username cannot exceed 30 characters" })
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores",
  });

const emailSchema = z
  .string()
  .email({ message: "Please provide a valid email address" });

const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^A-Za-z0-9]/, {
    message: "Password must contain at least one special character",
  });

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["USER", "ADMIN"]).optional().default("USER"),
  userImage: z
    .string()
    .url({ message: "Please provide a valid URL for the user image" })
    .optional(),
});

export type RegisterData = z.infer<typeof registerSchema>;
