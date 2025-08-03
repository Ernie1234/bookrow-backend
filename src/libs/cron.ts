// @libs/cron.ts
import cron from "node-cron";
import https from "https";

import Logger from "./logger";
import env from "../configs/envConfig";

const keepAliveJob = cron.schedule("*/14 * * * *", () => {
  Logger.info("Running keep-alive ping...");
  https
    .get(env.API_URL, (res) => {
      if (res.statusCode === 200) {
        Logger.info("✅ Keep-alive ping successful");
      } else {
        Logger.info("⚠️ Keep-alive ping failed", res.statusCode);
      }
    })
    .on("error", (e) => {
      Logger.error("❌ Keep-alive ping error:", e.message);
    });
});

// Export both the job and a function to start/stop it
export const startKeepAlive = () => {
  keepAliveJob.start();
  Logger.info("🔄 Keep-alive job started");
};

export const stopKeepAlive = () => {
  keepAliveJob.stop();
  Logger.info("🛑 Keep-alive job stopped");
};

export default keepAliveJob;
