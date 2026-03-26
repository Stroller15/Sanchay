import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1),

  // Redis (Upstash)
  REDIS_URL: z.string().url(),

  // CORS — comma-separated list of allowed origins
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
