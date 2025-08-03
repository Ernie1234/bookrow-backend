import { z } from "zod";

// Zod schema for user registration data validation with custom messages
export const registerSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    })
    .min(3, "Username must be at least 3 characters long"),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email address"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long"),
  role: z
    .enum(["USER", "ADMIN"], {
      invalid_type_error: "Role must be 'USER' or 'ADMIN'",
    })
    .optional(),
  userImage: z
    .string({
      invalid_type_error: "User image URL must be a string",
    })
    .url("Invalid URL for user image")
    .optional(),
});

export type RegisterData = z.infer<typeof registerSchema>;
