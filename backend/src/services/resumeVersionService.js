import {
  createResumeVersion,
  getResumeVersions,
  getResumeVersionById,
  getLatestResumeVersion,
} from "../repositories/resumeVersionRepository.js";

import { getResumeById } from "../repositories/resumeRepository.js";

import redisClient from "../config/redis.js";
import AppError from "../utils/appError.js";

const invalidateResumeVersionListCache = async ({ userId, resumeId }) => {
  const pattern = `user:${userId}:resume:${resumeId}:versions:page:*`;

  for await (const keys of redisClient.scanIterator({
    MATCH: pattern,
    COUNT: 100,
  })) {
    if (!keys || keys.length === 0) {
      continue;
    }

    await redisClient.del(keys);
  }
};

const ensureResumeOwnership = async ({ resumeId, userId }) => {
  const resume = await getResumeById({
    resumeId,
    userId,
  });

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  return resume;
};

export const createUserResumeVersion = async ({
  resumeId,
  userId,
  content,
}) => {
  await ensureResumeOwnership({
    resumeId,
    userId,
  });

  if (!content || typeof content !== "object") {
    throw new AppError("Resume content must be an object", 400);
  }

  const latestVersion = await getLatestResumeVersion({
    resumeId,
  });

  const nextVersionNumber =
    latestVersion && latestVersion.version_number
      ? latestVersion.version_number + 1
      : 1;

  const version = await createResumeVersion({
    resumeId,
    versionNumber: nextVersionNumber,
    content,
  });

  await invalidateResumeVersionListCache({ userId, resumeId });

  return version;
};

export const getUserResumeVersions = async ({
  resumeId,
  userId,
  page = 1,
  limit = 10,
}) => {
  const offset = (page - 1) * limit;

  const cacheKey =
    `user:${userId}:resume:${resumeId}:versions:page:${page}:limit:${limit}`;

  const cachedVersions = await redisClient.get(cacheKey);

  if (cachedVersions) {
    return JSON.parse(cachedVersions);
  }

  await ensureResumeOwnership({
    resumeId,
    userId,
  });

  const result = await getResumeVersions({
    resumeId,
    userId,
    offset,
    limit,
  });

  const response = {
    versions: result.versions,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };

  await redisClient.set(cacheKey, JSON.stringify(response), {
    EX: 60,
  });

  return response;
};

export const getUserResumeVersionById = async ({
  resumeId,
  versionId,
  userId,
}) => {
  await ensureResumeOwnership({
    resumeId,
    userId,
  });

  const version = await getResumeVersionById(versionId);

  if (!version) {
    throw new AppError("Resume version not found", 404);
  }

  if (version.resume_id !== resumeId) {
    throw new AppError("Resume version does not belong to this resume", 400);
  }

  return version;
};