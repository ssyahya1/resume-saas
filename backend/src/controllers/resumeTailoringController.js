import {
  queueResumeTailoring,
} from "../services/resumeTailoringService.js";

import {
  getResumeTailoringJobStatus,
} from "../services/resumeTailoringJobService.js";
import { getUserPlan } from "../repositories/profileRepository.js";

export const tailorResume = async (
  req,
  res,
  next
) => {
  try {
    const {
      resumeId,
      versionId,
      jobId,
    } = req.body;
    const userId = req.user.id;
    const plan = await getUserPlan(userId);

    const idempotencyKey =
      req.headers["idempotency-key"];

    const job = await queueResumeTailoring({
      userId,
      resumeId,
      versionId,
      jobId,
      plan,
      idempotencyKey,
    });

    return res.status(202).json({
      success: true,
      message: job.existing
        ? "Existing resume tailoring job returned"
        : "Resume tailoring queued successfully",
      jobId: job.jobId,
      status: job.status,
      existing: job.existing,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeTailoringJob = async (
  req,
  res,
  next
) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const result =
      await getResumeTailoringJobStatus(jobId,userId);

    return res.status(200).json({
      success: true,
      job: result,
    });
  } catch (error) {
    next(error);
  }
};