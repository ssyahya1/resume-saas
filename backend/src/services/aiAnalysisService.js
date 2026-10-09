import crypto from "crypto";

import {
  createAIAnalysis,
  getAIAnalysesByUserId,
  getAIAnalysisSummaryByUserId,
  getAIAnalysisById,
} from "../repositories/aiAnalysisRepository.js";

import redisClient from "../config/redis.js";
import { getLatestResumeVersion } from "../repositories/resumeVersionRepository.js";
import { aiAnalysisQueue } from "../queues/aiAnalysisQueue.js";

import { getApplicationById } from "../repositories/applicationRepository.js";
import { getResumeById } from "../repositories/resumeRepository.js";
import { getJobById } from "../repositories/jobRepository.js";

import {
  reserveUserAIAnalysis,
  releaseUserAIAnalysis,
} from "./usageService.js";

import { analyzeResumeWithAI } from "./aiService.js";

import {
  getIdempotencyKey,
  recoverStalePendingIdempotencyKey,
  createIdempotencyKey,
  updateIdempotencyKey,
} from "../repositories/idempotencyRepository.js";
import AppError from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const createUserAIAnalysis = async ({
  userId,
  applicationId,
  plan = "free",
}) => {
  if (!applicationId) {
    throw new AppError("Application is required", 400);
  }

  const application = await getApplicationById({
    applicationId,
    userId,
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  if (!application.resume_id) {
    throw new AppError("Application does not have a resume", 400);
  }

  if (!application.job_id) {
    throw new AppError("Application does not have a job", 400);
  }

  const resume = await getResumeById({
    resumeId: application.resume_id,
    userId,
  });

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  const resumeVersion = await getLatestResumeVersion({
    resumeId: resume.id,
  });

  if (!resumeVersion) {
    throw new AppError("Resume version not found", 404);
  }

  const job = await getJobById({
    jobId: application.job_id,
    userId,
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const cacheKey = `ai-analysis:${userId}:${applicationId}:${resumeVersion.id}`;

  const cachedAnalysis = await redisClient.get(cacheKey);

  if (cachedAnalysis) {
    return JSON.parse(cachedAnalysis);
  }

  const aiResult = await analyzeResumeWithAI({
    resumeContent: resumeVersion.content,
    jobDescription: job.description,
  });

  const aiAnalysis = await createAIAnalysis({
    userId,
    applicationId: application.id,
    resumeId: resume.id,
    jobId: job.id,
    matchScore: aiResult.matchScore,
    analysis: aiResult,
  });

  await redisClient.set(
    cacheKey,
    JSON.stringify(aiAnalysis),
    {
      EX: 3600,
    }
  );

  return aiAnalysis;
};

export const getUserAIAnalyses = async (userId) => {
  return getAIAnalysesByUserId(userId);
};

export const getUserAIAnalysisSummary = async (userId) => {
  return getAIAnalysisSummaryByUserId(userId);
};

export const getUserAIAnalysisById = async ({
  analysisId,
  userId,
}) => {
  return getAIAnalysisById({
    analysisId,
    userId,
  });
};

export const queueAIAnalysis = async ({
  userId,
  applicationId,
  plan = "free",
  idempotencyKey,
}) => {
  if (!applicationId) {
    throw new AppError("Application is required", 400);
  }

  if (!idempotencyKey) {
    throw new AppError("Idempotency-Key header is required", 400);
  }

  const requestHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        applicationId,
      })
    )
    .digest("hex");

  let idempotencyRecord;
  const existingRequest = await getIdempotencyKey({
    userId,
    idempotencyKey,
  });

  if (existingRequest) {
    if (existingRequest.request_hash !== requestHash) {
      throw new AppError(
        "Idempotency key was already used for a different request",
        409
      );
    }

    if (existingRequest.status === "pending") {
      idempotencyRecord = await recoverStalePendingIdempotencyKey({
        id: existingRequest.id,
        updatedAt: existingRequest.updated_at,
      });
    }

    if (!idempotencyRecord) {
      const currentRequest = await getIdempotencyKey({
        userId,
        idempotencyKey,
      });

      if (currentRequest) {
        return {
          existing: true,
          jobId: currentRequest.job_id,
          status: currentRequest.status,
        };
      }
    }
  }

  if (!idempotencyRecord) {
    try {
      idempotencyRecord = await createIdempotencyKey({
        userId,
        idempotencyKey,
        requestHash,
      });
    } catch (error) {
      if (error.code === "23505") {
        const existing = await getIdempotencyKey({
          userId,
          idempotencyKey,
        });

        if (!existing) {
          throw error;
        }

        if (existing.request_hash !== requestHash) {
          throw new AppError(
            "Idempotency key was already used for a different request",
            409
          );
        }

        return {
          existing: true,
          jobId: existing.job_id,
          status: existing.status,
        };
      }

      throw error;
    }
  }

  let usageReserved = false;

  try {
    await reserveUserAIAnalysis(userId, plan);

    usageReserved = true;

    const job = await aiAnalysisQueue.add(
      "analyze-resume",
      {
        userId,
        applicationId,
        plan,
        idempotencyRecordId: idempotencyRecord.id,
      },
      {
        jobId: `ai-analysis-${idempotencyRecord.id}`,
      }
    );

    await updateIdempotencyKey({
      id: idempotencyRecord.id,
      jobId: job.id,
      status: "queued",
    });

    return {
      existing: false,
      jobId: job.id,
      status: "queued",
    };
  } catch (error) {
    if (usageReserved) {
      try {
        await releaseUserAIAnalysis(userId);
      } catch (releaseError) {
        logger.error("Failed to release AI analysis usage", {
          userId,
          errorName: releaseError?.name,
          errorCode: releaseError?.code,
        });
      }
    }

    try {
      await updateIdempotencyKey({
        id: idempotencyRecord.id,
        jobId: null,
        status: "failed",
      });
    } catch (idempotencyError) {
      logger.error("Failed to update AI analysis idempotency record", {
        idempotencyRecordId: idempotencyRecord?.id,
        errorName: idempotencyError?.name,
        errorCode: idempotencyError?.code,
      });
    }

    throw error;
  }
};