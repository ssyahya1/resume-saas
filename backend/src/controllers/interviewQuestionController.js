import {
  queueInterviewQuestions,
  getApplicationInterviewQuestions,
} from "../services/interviewQuestionService.js";

import { getInterviewQuestionJobStatus } from "../services/interviewQuestionJobService.js";
import { getUserPlan } from "../repositories/profileRepository.js";

export const generateInterviewQuestions = async (req, res, next) => {
  try {
    const { applicationId, resumeId } = req.body;
    const userId = req.user.id;
    const plan = await getUserPlan(userId);

    const idempotencyKey =
      req.headers["idempotency-key"];

    const job = await queueInterviewQuestions({
      userId,
      applicationId,
      resumeId,
      plan,
      idempotencyKey,
    });

    return res.status(202).json({
      success: true,
      message: job.existing
        ? "Existing interview question job returned"
        : "Interview questions generation queued successfully",
      jobId: job.jobId,
      status: job.status,
      existing: job.existing,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestions = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const result = await getApplicationInterviewQuestions({
      userId: req.user.id,
      applicationId,
    });

    return res.status(200).json({
      success: true,
      questions: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewQuestionJob = async (
  req,
  res,
  next
) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const result =
      await getInterviewQuestionJobStatus(jobId,userId);

    return res.status(200).json({
      success: true,
      job: result,
    });
  } catch (error) {
    next(error);
  }
};