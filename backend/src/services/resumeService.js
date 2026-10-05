import {
  createResume,
  getResumesByUserId,
  getResumeById,
  updateResume,
  deleteResume
} from "../repositories/resumeRepository.js";
import redisClient from "../config/redis.js";
import AppError from "../utils/appError.js";

const invalidateResumeListCache = async (userId) => {
  const pattern = `user:${userId}:resumes:page:*`;

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
export const createUserResume = async ({ userId, title }) => {
  if (!title || !title.trim()) {
    throw new AppError("Resume title is required", 400);
  }

  const resume = await createResume({
    userId,
    title: title.trim(),
  });

  await invalidateResumeListCache(userId);

  return resume;
};

export const getUserResumes = async (
  userId,
  { page = 1, limit = 10 } = {}
) => {
  const offset = (page - 1) * limit;

  const cacheKey = `user:${userId}:resumes:page:${page}:limit:${limit}`;

  const cachedResumes = await redisClient.get(cacheKey);

  if (cachedResumes) {
    return JSON.parse(cachedResumes);
  }

  const result = await getResumesByUserId({
    userId,
    offset,
    limit,
  });

  const response = {
    resumes: result.resumes,
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

export const getUserResumeById = async ({ resumeId, userId }) => {
  const resume = await getResumeById({
    resumeId,
    userId,
  });

  if (!resume) {
    throw new AppError("Resume not found", 404);
  }

  return resume;
};

export const updateUserResume = async ({
  resumeId,
  userId,
  title,
}) => {
  if (!title || !title.trim()) {
    throw new AppError("Resume title is required", 400);
  }

  const updatedResume = await updateResume({
    resumeId,
    userId,
    title: title.trim(),
  });

  await invalidateResumeListCache(userId);

  return updatedResume;
};

export const deleteUserResume = async ({
  resumeId,
  userId,
}) => {
  const deletedResume = await deleteResume({
    resumeId,
    userId,
  });
  if (!deletedResume) {
    throw new AppError("Resume not found", 404);
  }

  await invalidateResumeListCache(userId);

  return deletedResume;
};