import "./lib/env"; // Validate env vars at startup
import { createApp } from "./app";
import { env } from "./lib/env";
import { startWorkers } from "./lib/queue";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.info(`🚀 API running on port ${env.PORT} [${env.NODE_ENV}]`);
});

// Start background workers
startWorkers();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.info("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.info("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.info("SIGINT received, shutting down gracefully...");
  server.close(() => {
    process.exit(0);
  });
});
