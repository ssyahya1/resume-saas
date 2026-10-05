import {
  createJob,
  getJobsByUserId,
  getJobById,
  updateJob,
  deleteJob,

} from "../repositories/jobRepository.js";

import redisClient from "../config/redis.js";
import AppError from "../utils/appError.js";

const invalidateJobListCache = async (userId) => {
  const pattern = `user:${userId}:jobs:page:*`;

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

export const createUserJob = async ({
  userId,
  title,
  companyName,
  description,
  jobUrl,
}) => {
  if (!title || !title.trim()) {
    throw new AppError("Job title is required", 400);
  }

  if (!description || !description.trim()) {
    throw new AppError("Job description is required", 400);
  }

  const job = await createJob({
    userId,
    title: title.trim(),
    companyName: companyName?.trim() || null,
    description: description.trim(),
    jobUrl: jobUrl?.trim() || null,
  });



await invalidateJobListCache(userId);

return job;
};
export const getUserJobs = async (
  userId,
  { page = 1, limit = 10, } = {}
) => {
  const offset = (page - 1) * limit;

  const cacheKey =
    `user:${userId}:jobs:page:${page}:limit:${limit}}`;

  const cachedJobs = await redisClient.get(cacheKey);

  if (cachedJobs) {
    return JSON.parse(cachedJobs);
  }

  const result = await getJobsByUserId({
    userId,
    offset,
    limit,
  });

  const response = {
    jobs: result.jobs,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };

  await redisClient.set(
    cacheKey,
    JSON.stringify(response),
    {
      EX: 60,
    }
  );

  return response;
};
export const getUserJobById = async ({
  jobId,
  userId,
}) => {
  const job = await getJobById({
    jobId,
    userId,
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const updateUserJob = async ({
  jobId,
  userId,
  title,
  companyName,
  description,
  jobUrl,
}) => {
  if (!title || !title.trim()) {
    throw new AppError("Job title is required", 400);
  }

  if (!description || !description.trim()) {
    throw new AppError("Job description is required", 400);
  }

  const update = await updateJob({
    jobId,
    userId,
    title: title.trim(),
    companyName: companyName?.trim() || null,
    description: description.trim(),
    jobUrl: jobUrl?.trim() || null,
  });
  await invalidateJobListCache(userId);

  return update;
};

export const deleteUserJob = async ({
  jobId,
  userId,
}) => {
  const deletedJob = await deleteJob({
    jobId,
    userId,
  });

  await invalidateJobListCache(userId);

  return deletedJob;
};