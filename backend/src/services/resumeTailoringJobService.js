import { resumeTailoringQueue } from "../queues/resumeTailoringQueue.js";
import AppError from "../utils/appError.js";

export const getResumeTailoringJobStatus = async (jobId,userId) => {
  const job = await resumeTailoringQueue.getJob(jobId);


  if (!job) {
    throw new AppError("Resume tailoring job not found", 404);
  }
  if (job.data.userId !== userId) {
    throw new AppError("Resume tailoring job not found", 404);
  }

  const state = await job.getState();

  return {
    jobId: job.id,
    state,
    result: job.returnvalue || null,
    error: job.failedReason || null,
  };
};