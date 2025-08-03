// src/server.ts
import app from "./app";
import env from "./configs/envConfig";
import { connectDB, disconnectDB } from "./configs/db";
import { startKeepAlive, stopKeepAlive } from "./libs/cron";
import Logger from "./libs/logger";

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    Logger.info("✅ Database connected successfully");

    // Start the keep-alive job
    startKeepAlive();

    // 2. Start Express Server
    const server = app.listen(env.PORT, () => {
      Logger.info(`🚀 Server running on port:  http://localhost:${env.PORT}`);
      Logger.info(`🌐 Environment: ${env.NODE_ENV}`);
    });

    // 3. Handle graceful shutdown
    const shutdown = async () => {
      Logger.info("🛑 Shutting down server...");

      // Stop the keep-alive job
      stopKeepAlive();

      server.close(async () => {
        await disconnectDB();
        Logger.info("🔌 Database connection closed");
        process.exit(0);
      });

      // Force close if hanging
      setTimeout(() => {
        Logger.error("⚠️ Forcing shutdown...");
        process.exit(1);
      }, 5000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    Logger.error("❌ Failed to start server:", err);
    await disconnectDB();
    process.exit(1);
  }
};

startServer();
