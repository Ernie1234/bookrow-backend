import { z } from "zod";
import "dotenv/config";
import Logger from "../libs/logger";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().default("3000"),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  MONGODB_URL: z.string().url(),
  API_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  Logger.error("❌ Invalid environment variables:", env.error.format());
  process.exit(1);
}

export default env.data;
