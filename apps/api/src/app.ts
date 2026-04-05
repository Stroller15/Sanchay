import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import * as Sentry from "@sentry/node";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { router } from "./routes";
import { env } from "./lib/env";

Sentry.init({
  ...(env.SENTRY_DSN && { dsn: env.SENTRY_DSN }),
  environment: env.NODE_ENV,
  tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1.0,
});

export function createApp() {
  const app = express();

  // Security
  app.use(helmet());
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, extension background workers)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use("/api/v1", router);

  // 404
  app.use(notFoundHandler);

  // Central error handler (must be last)
  app.use(errorHandler);

  return app;
}
