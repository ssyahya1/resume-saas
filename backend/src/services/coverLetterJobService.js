import {coverLetterQueue} from "../queues/coverLetterQueue.js";
import AppError from "../utils/appError.js";

export const getCoverLetterJobStatus = async (jobId,userId) => {
  const job = await coverLetterQueue.getJob(jobId);

   if (!job) {
    throw new AppError("Cover Letter job not found", 404);
  }
  if (job.data.userId !== userId) {
    throw new AppError("Cover Letter job not found", 404);
  }

  const state = await job.getState();

  return {
    jobId: job.id,
    state,
    result: job.returnvalue || null,
    error: job.failedReason || null,
  };
};