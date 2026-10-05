import { createClient } from "redis";
import { logger } from "../utils/logger.js";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (error) => {
  logger.error("Redis client error", {
    errorName: error?.name,
    errorCode: error?.code,
  });
});

export default redisClient;