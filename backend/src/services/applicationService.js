import {
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getApplicationsByUserId,
} from "../repositories/applicationRepository.js";
import redisClient from "../config/redis.js";
import AppError from "../utils/appError.js";

const invalidateApplicationListCache = async (userId) => {
  const pattern = `user:${userId}:applications:page:*`;

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

export const createUserApplication= async({
    userId,
    jobId,
    resumeId,
    status,
    appliedAt
}) =>{
    if (!jobId){
        throw new AppError("Job is required", 400);
    }
    if(!resumeId){
        throw new AppError("Resume is required", 400);
    }

    const application = await createApplication({
        userId,
        jobId,
        resumeId,
        status: status || "saved",
        appliedAt,
    })
    await invalidateApplicationListCache(userId);
    return application;
};

export const getUserApplications = async (
  userId,
  { page = 1, limit = 10, status } = {}
) => {
  const offset = (page - 1) * limit;

  const cacheKey =
    `user:${userId}:applications:page:${page}:limit:${limit}:status:${status || "all"}`;

  const cachedApplications = await redisClient.get(cacheKey);

  if (cachedApplications) {
    return JSON.parse(cachedApplications);
  }

  const result = await getApplicationsByUserId({
    userId,
    offset,
    limit,
    status,
  });

  const response = {
    applications: result.applications,
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

export const getUserApplicationById = async ({
  applicationId,
  userId,
}) => {
  const application = await getApplicationById({
    applicationId,
    userId,
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  return application;
};

export const updateUserApplication = async({
    applicationId,
    userId,
    status,
    appliedAt,
})=>{
    if(!status){
        throw new AppError("Status is required", 400);
    }

    const UpdateApplication = await updateApplication({
        applicationId,
        userId,
        status,
        appliedAt
    })
    await invalidateApplicationListCache(userId);
    return UpdateApplication;

};


export const deleteUserApplication = async ({
  applicationId,
  userId,
}) => {
  const deletedApplication = await deleteApplication({
    applicationId,
    userId,
  });
  await invalidateApplicationListCache(userId);
  return deletedApplication;
};