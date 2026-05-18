import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().url().default("postgresql://postgres:123456@localhost:5432/panteon_task_postgresql_db?schema=public"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  MONGODB_URL: z.string().url().default("mongodb://localhost:27017"),
  MONGODB_DB: z.string().min(1).default("panteon_task_mongo_db")
});

export const env = envSchema.parse(process.env);
