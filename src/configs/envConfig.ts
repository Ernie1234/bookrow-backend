import { z } from "zod";
import "dotenv/config";
import Logger from "../libs/logger";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().default("3000"),
  JWT_SECRET: z.string(),
  MONGODB_URL: z.string().url(),
  API_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  Logger.error("❌ Invalid environment variables:", env.error.format());
  process.exit(1);
}

export default env.data;
