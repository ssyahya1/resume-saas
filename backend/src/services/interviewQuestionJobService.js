import {interviewQuestionQueue} from "../queues/interviewQuestionQueue.js";
import AppError from "../utils/appError.js";

export const getInterviewQuestionJobStatus = async (jobId,userId) => {
  const job = await interviewQuestionQueue.getJob(jobId);

   if (!job) {
    throw new AppError("Interview Question job not found", 404);
  }

  if (job.data.userId !== userId) {
    throw new AppError("Interview Question job not found", 404);
  }

  const state = await job.getState();

  return {
    jobId: job.id,
    state,
    result: job.returnvalue || null,
    error: job.failedReason || null,
  };
};