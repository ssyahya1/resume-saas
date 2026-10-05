import { aiAnalysisQueue } from "../queues/aiAnalysisQueue.js";
import AppError from "../utils/appError.js";

export const getAIAnalysisJobStatus = async (jobId,userId) => {
  const job = await aiAnalysisQueue.getJob(jobId);

  if (!job) {
    throw new AppError("AI analysis job not found", 404);
  }
  if (job.data.userId !== userId) {
    throw new AppError("AI analysis job not found", 404);
  }

  const state = await job.getState();

  return {
    jobId: job.id,
    state,
    result: job.returnvalue || null,
    error: job.failedReason || null,
  };
};