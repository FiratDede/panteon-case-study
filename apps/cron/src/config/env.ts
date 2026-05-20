import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  MONGODB_URL: z.string().url(),
  MONGODB_DB: z.string().min(1)
});

export const env = envSchema.parse(process.env);
