import app from "./app.js";
import connectDB from "./config/db.js";
import { ENV } from "./config/env.js";
import { startLockCleanupJob } from "./jobs/cleanupLocks.js";

const startServer = async () => {
  try {
    await connectDB();

    // Start seat lock background cleanup
    startLockCleanupJob();

    const server = app.listen(ENV.PORT, () => {
      console.log(`[Server] CinePass Backend running on port ${ENV.PORT} (${ENV.NODE_ENV})`);
      console.log(`[Server] Health check: http://localhost:${ENV.PORT}/api/health`);
    });

    // Graceful shutdown
    const handleShutdown = () => {
      console.log("[Server] Shutting down gracefully...");
      server.close(() => {
        console.log("[Server] Closed HTTP connections.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", handleShutdown);
    process.on("SIGINT", handleShutdown);
  } catch (error) {
    console.error(`[Server Fatal Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();
