import { Worker, UnrecoverableError } from "bullmq";

import {
  generateInterviewQuestions,
} from "../services/interviewQuestionService.js";

import {
  sendToUser,
} from "../websocket/websocketManager.js";

import {
  updateIdempotencyKey,
} from "../repositories/idempotencyRepository.js";

import {
  releaseUserInterviewQuestions,
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

const interviewQuestionWorker =
  new Worker(
    "interview-question",
    async (job) => {
      logger.info("Processing interview question job", { jobId: job.id });

      const {
        userId,
        resumeId,
        applicationId,
        plan,
      } = job.data;

      try {
        const result =
          await generateInterviewQuestions({
            userId,
            resumeId,
            applicationId,
            plan,
          });

        return result;
      } catch (error) {
        if (!isRetryableError(error)) {
          throw new UnrecoverableError(
            error.message
          );
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

interviewQuestionWorker.on(
  "completed",
  async (job) => {
    logger.info("Interview question job completed", { jobId: job.id });

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
        logger.error("Failed to update interview question idempotency record", {
          jobId: job.id,
          errorName: error?.name,
          errorCode: error?.code,
        });
      }
    }

    sendToUser(userId, {
      type: "interview-question",
      status: "completed",
      jobId: job.id,
      message:
        "Interview question generation completed",
    });
  }
);

interviewQuestionWorker.on(
  "failed",
  async (job, error) => {
    logger.error("Interview question job failed", {
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

    if (!retryable) {
      if (idempotencyRecordId) {
        try {
          await updateIdempotencyKey({
            id: idempotencyRecordId,
            jobId: job.id,
            status: "failed",
          });
        } catch (updateError) {
          logger.error("Failed to update interview question idempotency record", {
            jobId: job.id,
            errorName: updateError?.name,
            errorCode: updateError?.code,
          });
        }
      }

      try {
        await releaseUserInterviewQuestions(
          userId
        );
      } catch (releaseError) {
        logger.error("Failed to release interview question usage", {
          jobId: job.id,
          userId,
          errorName: releaseError?.name,
          errorCode: releaseError?.code,
        });
      }

      sendToUser(userId, {
        type: "interview-question",
        status: "failed",
        jobId: job.id,
        attempt: job.attemptsMade,
        maxAttempts,
        message:
          "Interview question generation failed due to a permanent error",
      });
      return;
    }

    if (job.attemptsMade < maxAttempts) {
      sendToUser(userId, {
        type: "interview-question",
        status: "retrying",
        jobId: job.id,
        attempt: job.attemptsMade,
        maxAttempts,
        message:
          "Interview question generation failed. Retrying...",
      });
      return;
    }

    if (idempotencyRecordId) {
      try {
        await updateIdempotencyKey({
          id: idempotencyRecordId,
          jobId: job.id,
          status: "failed",
        });
      } catch (updateError) {
        logger.error("Failed to update interview question idempotency record", {
          jobId: job.id,
          errorName: updateError?.name,
          errorCode: updateError?.code,
        });
      }
    }

    try {
      await releaseUserInterviewQuestions(
        userId
      );
    } catch (releaseError) {
      logger.error("Failed to release interview question usage", {
        jobId: job.id,
        userId,
        errorName: releaseError?.name,
        errorCode: releaseError?.code,
      });
    }

    sendToUser(userId, {
      type: "interview-question",
      status: "failed",
      jobId: job.id,
      attempt: job.attemptsMade,
      maxAttempts,
      message:
        "Interview question generation failed after all retry attempts",
    });
  }
);

export default interviewQuestionWorker;
