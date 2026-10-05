import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import redisClient from "../config/redis.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

const sendLiveness = (_req, res) => {
  res.status(200).json({
    success: true,
    status: "alive",
  });
};

router.get("/", sendLiveness);
router.get("/live", sendLiveness);

router.get("/ready", async (req, res) => {
  const checks = {
    database: "unknown",
    redis: "unknown",
  };

  try {
    const { error: databaseError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .limit(1);

    if (databaseError) {
      throw databaseError;
    }

    checks.database = "ok";
  } catch (error) {
    logger.error("Readiness database check failed", {
      requestId: req.requestId,
      errorName: error?.name,
      errorCode: error?.code,
    });

    checks.database = "failed";
  }

  try {
    if (!redisClient.isReady) {
      checks.redis = "failed";
    } else {
      await redisClient.ping();
      checks.redis = "ok";
    }
  } catch (error) {
    logger.error("Readiness Redis check failed", {
      requestId: req.requestId,
      errorName: error?.name,
      errorCode: error?.code,
    });

    checks.redis = "failed";
  }

  const ready =
    checks.database === "ok" &&
    checks.redis === "ok";

  return res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? "ready" : "not_ready",
    checks,
  });
});

router.get("/database", async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message:
        "Supabase database connection is working",
    });
  } catch (error) {
    logger.error("Database connection error", {
      requestId: req.requestId,
      errorName: error?.name,
      errorCode: error?.code,
    });

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default router;