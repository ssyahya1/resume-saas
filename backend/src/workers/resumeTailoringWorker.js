import { Worker, UnrecoverableError } from "bullmq";

import {
  tailorUserResume,
} from "../services/resumeTailoringService.js";

import {
  sendToUser,
} from "../websocket/websocketManager.js";

import {
  updateIdempotencyKey,
} from "../repositories/idempotencyRepository.js";

import {
  releaseUserResumeTailoring,
} from "../services/usageService.js";

import {
  isRetryableError,
} from "../utils/jobErrors.js";
import { logger } from "../utils/logger.js";

const connection = {
  url:
    process.env.REDIS_URL ||
    "redis://localhost:6379",
};

const resumeTailoringWorker = new Worker(
  "resume-tailoring",
  async (job) => {
    logger.info("Processing resume tailoring job", { jobId: job.id });

    const {
      userId,
      resumeId,
      versionId,
      jobId,
      plan,
    } = job.data;

    try {
      const result = await tailorUserResume({
        userId,
        resumeId,
        versionId,
        jobId,
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
  }
);

resumeTailoringWorker.on(
  "completed",
  async (job) => {
    logger.info("Resume tailoring job completed", { jobId: job.id });

    const {
      userId,
      idempotencyRecordId,
    } = job.data;

    if (idempotencyRecordId) {
      try {
        await updateIdempotencyKey({
          id: idempotencyRecordId,
          jobId: job.id,
          status: "completed",
        });
      } catch (error) {
        logger.error("Failed to update resume tailoring idempotency record", {
          jobId: job.id,
          errorName: error?.name,
          errorCode: error?.code,
        });
      }
    }

    // Do NOT release usage on success.
    sendToUser(userId, {
      type: "resume-tailoring",
      status: "completed",
      jobId: job.id,
      message: "Resume tailoring completed",
    });
  }
);

resumeTailoringWorker.on(
  "failed",
  async (job, error) => {
    logger.error("Resume tailoring job failed", {
      jobId: job?.id,
      errorName: error?.name,
      errorCode: error?.code,
    });

    if (!job) {
      return;
    }

    const {
      userId,
      idempotencyRecordId,
    } = job.data;

    const maxAttempts =
      job.opts.attempts || 1;

    const retryable =
      isRetryableError(error);

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
          logger.error("Failed to update resume tailoring idempotency record", {
            jobId: job.id,
            errorName: updateError?.name,
            errorCode: updateError?.code,
          });
        }
      }

      try {
        await releaseUserResumeTailoring(userId);
      } catch (releaseError) {
        logger.error("Failed to release resume tailoring usage", {
          jobId: job.id,
          userId,
          errorName: releaseError?.name,
          errorCode: releaseError?.code,
        });
      }

      sendToUser(userId, {
        type: "resume-tailoring",
        status: "failed",
        jobId: job.id,
        attempt: job.attemptsMade,
        maxAttempts,
        message:
          "Resume tailoring failed due to a permanent error",
      });

      return;
    }

    // Retryable error with attempts remaining
    if (job.attemptsMade < maxAttempts) {
      sendToUser(userId, {
        type: "resume-tailoring",
        status: "retrying",
        jobId: job.id,
        attempt: job.attemptsMade,
        maxAttempts,
        message:
          "Resume tailoring failed. Retrying...",
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
        logger.error("Failed to update resume tailoring idempotency record", {
          jobId: job.id,
          errorName: updateError?.name,
          errorCode: updateError?.code,
        });
      }
    }

    try {
      await releaseUserResumeTailoring(userId);
    } catch (releaseError) {
      logger.error("Failed to release resume tailoring usage", {
        jobId: job.id,
        userId,
        errorName: releaseError?.name,
        errorCode: releaseError?.code,
      });
    }

    sendToUser(userId, {
      type: "resume-tailoring",
      status: "failed",
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts,
      message:
        "Resume tailoring failed after all retry attempts",
    });
  }
);

export default resumeTailoringWorker;