import { Worker, UnrecoverableError } from "bullmq";

import {
  generateCoverLetter,
} from "../services/coverLetterService.js";

import {
  sendToUser,
} from "../websocket/websocketManager.js";

import {
  updateIdempotencyKey,
} from "../repositories/idempotencyRepository.js";

import {
  releaseUserCoverLetter,
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

const coverLetterWorker = new Worker(
  "cover-letter",
  async (job) => {
    logger.info("Processing cover letter job", { jobId: job.id });

    const {
      userId,
      resumeId,
      applicationId,
      plan,
    } = job.data;

    try {
      const result = await generateCoverLetter({
        userId,
        resumeId,
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
  }
);

coverLetterWorker.on(
  "completed",
  async (job) => {
    logger.info("Cover letter job completed", { jobId: job.id });

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
        logger.error("Failed to update cover letter idempotency record", {
          jobId: job.id,
          errorName: error?.name,
          errorCode: error?.code,
        });
      }
    }

    // Do NOT release usage on success.
    sendToUser(userId, {
      type: "cover-letter",
      status: "completed",
      jobId: job.id,
      message:
        "Cover letter generation completed",
    });
  }
);

coverLetterWorker.on(
  "failed",
  async (job, error) => {
    logger.error("Cover letter job failed", {
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
          logger.error("Failed to update cover letter idempotency record", {
            jobId: job.id,
            errorName: updateError?.name,
            errorCode: updateError?.code,
          });
        }
      }

      try {
        await releaseUserCoverLetter(userId);
      } catch (releaseError) {
        logger.error("Failed to release cover letter usage", {
          jobId: job.id,
          userId,
          errorName: releaseError?.name,
          errorCode: releaseError?.code,
        });
      }

      sendToUser(userId, {
        type: "cover-letter",
        status: "failed",
        jobId: job.id,
        attempt: job.attemptsMade,
        maxAttempts,
        message:
          "Cover letter generation failed due to a permanent error",
      });

      return;
    }

    // Retryable error with attempts remaining
    if (job.attemptsMade < maxAttempts) {
      sendToUser(userId, {
        type: "cover-letter",
        status: "retrying",
        jobId: job.id,
        attempt: job.attemptsMade,
        maxAttempts,
        message:
          "Cover letter generation failed. Retrying...",
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
        logger.error("Failed to update cover letter idempotency record", {
          jobId: job.id,
          errorName: updateError?.name,
          errorCode: updateError?.code,
        });
      }
    }

    try {
      await releaseUserCoverLetter(userId);
    } catch (releaseError) {
      logger.error("Failed to release cover letter usage", {
        jobId: job.id,
        userId,
        errorName: releaseError?.name,
        errorCode: releaseError?.code,
      });
    }

    sendToUser(userId, {
      type: "cover-letter",
      status: "failed",
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts,
      message:
        "Cover letter generation failed after all retry attempts",
    });
  }
);

export default coverLetterWorker;