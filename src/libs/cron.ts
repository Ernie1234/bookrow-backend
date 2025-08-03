import { CronJob } from "cron";
import http from "http";
import https from "https";
import { URL } from "url"; // The 'url' module is part of Node.js

import Logger from "./logger";
import env from "../configs/envConfig";

/**
 * @function startKeepAlive
 * @description Starts a cron job to send a keep-alive ping to the server every 14 minutes.
 * This prevents services like Render from putting the server to sleep.
 */
let keepAliveJob: CronJob;

export const startKeepAlive = () => {
  // Use a more robust check to ensure the URL is valid
  let apiUrl: URL;
  try {
    apiUrl = new URL(env.API_URL);
  } catch (error) {
    Logger.error(`❌ Invalid API_URL in environment variables: ${env.API_URL}`);
    return;
  }

  // Determine the correct module to use (http or https)
  const protocolModule = apiUrl.protocol === "https:" ? https : http;

  keepAliveJob = new CronJob("*/14 * * * *", () => {
    Logger.info("Running keep-alive ping...");
    protocolModule
      .get(apiUrl, (res) => {
        // Consume response data to free up memory
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            Logger.info(`✅ Keep-alive ping successful. Status: ${res.statusCode}`);
          } else {
            Logger.warn(`⚠️ Keep-alive ping failed. Status: ${res.statusCode}`);
          }
        });
      })
      .on("error", (e) => {
        Logger.error("❌ Keep-alive ping error:", e.message);
      });
  });

  keepAliveJob.start();
  Logger.info("🔄 Keep-alive job started");
};

/**
 * @function stopKeepAlive
 * @description Stops the keep-alive cron job.
 */
export const stopKeepAlive = () => {
  if (keepAliveJob) {
    keepAliveJob.stop();
    Logger.info("🛑 Keep-alive job stopped");
  }
};
