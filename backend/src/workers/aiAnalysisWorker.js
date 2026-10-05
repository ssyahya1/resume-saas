import { Worker, UnrecoverableError } from "bullmq";

import { createUserAIAnalysis } from "../services/aiAnalysisService.js";
import { sendToUser } from "../websocket/websocketManager.js";

import { updateIdempotencyKey } from "../repositories/idempotencyRepository.js";
import { isRetryableError } from "../utils/jobErrors.js";
import { releaseUserAIAnalysis } from "../services/usageService.js";
import { logger } from "../utils/logger.js";

const connection = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

const aiAnalysisWorker = new Worker(
  "ai-analysis",
  async (job) => {
    logger.info("Processing AI analysis job", { jobId: job.id });

    const { userId, applicationId, plan } = job.data;

    try {
      const result = await createUserAIAnalysis({
        userId,
        applicationId,
        plan,
      });

      return result;
    } catch (error) {
      if (!isRetryableError(error)) {
        throw new UnrecoverableError(error.message);
      }

      throw error;
    }
  },
  {
    connection,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
);

aiAnalysisWorker.on("completed", async (job) => {
  logger.info("AI analysis job completed", { jobId: job.id });

  const { userId, idempotencyRecordId } = job.data;

  if (idempotencyRecordId) {
    try {
      await updateIdempotencyKey({
        id: idempotencyRecordId,
        jobId: job.id,
        status: "completed",
      });
    } catch (error) {
      logger.error("Failed to update AI analysis idempotency record", {
        jobId: job.id,
        errorName: error?.name,
        errorCode: error?.code,
      });
    }
  }

  // Do NOT release usage on success.
  sendToUser(userId, {
    type: "ai-analysis",
    status: "completed",
    jobId: job.id,
    message: "AI analysis completed",
  });
});

aiAnalysisWorker.on("failed", async (job, error) => {
  logger.error("AI analysis job failed", {
    jobId: job?.id,
    errorName: error?.name,
    errorCode: error?.code,
  });

  if (!job) {
    return;
  }

  const { userId, idempotencyRecordId } = job.data;

  const maxAttempts = job.opts.attempts || 1;
  const retryable = isRetryableError(error);

  // Permanent error
  if (!retryable) {
    if (idempotencyRecordId) {
      try {
        await updateIdempotencyKey({
          id: idempotencyRecordId,
          jobId: job.id,
          status: "failed",
        });
      } catch (updateError) {
        logger.error("Failed to update AI analysis idempotency record", {
          jobId: job.id,
          errorName: updateError?.name,
          errorCode: updateError?.code,
        });
      }
    }

    try {
      await releaseUserAIAnalysis(userId);
    } catch (releaseError) {
      logger.error("Failed to release AI analysis usage", {
        jobId: job.id,
        userId,
        errorName: releaseError?.name,
        errorCode: releaseError?.code,
      });
    }

    sendToUser(userId, {
      type: "ai-analysis",
      status: "failed",
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts,
      message: "AI analysis failed due to a permanent error",
    });

    return;
  }

  // Retryable error with attempts remaining
  if (job.attemptsMade < maxAttempts) {
    sendToUser(userId, {
      type: "ai-analysis",
      status: "retrying",
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts,
      message: "AI analysis failed. Retrying...",
    });

    return;
  }

  // Retryable error but all attempts exhausted
  if (idempotencyRecordId) {
    try {
      await updateIdempotencyKey({
        id: idempotencyRecordId,
        jobId: job.id,
        status: "failed",
      });
    } catch (updateError) {
      logger.error("Failed to update AI analysis idempotency record", {
        jobId: job.id,
        errorName: updateError?.name,
        errorCode: updateError?.code,
      });
    }
  }

  try {
    await releaseUserAIAnalysis(userId);
  } catch (releaseError) {
    logger.error("Failed to release AI analysis usage", {
      jobId: job.id,
      userId,
      errorName: releaseError?.name,
      errorCode: releaseError?.code,
    });
  }

  sendToUser(userId, {
    type: "ai-analysis",
    status: "failed",
    jobId: job.id,
    attempt: job.attemptsMade,
    maxAttempts,
    message: "AI analysis failed after all retry attempts",
  });
});

export default aiAnalysisWorker;