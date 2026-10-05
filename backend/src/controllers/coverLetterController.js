import { queueCoverLetter } from "../services/coverLetterService.js";
import { getCoverLetterJobStatus } from "../services/coverLetterJobService.js";
import { getUserPlan } from "../repositories/profileRepository.js";

export const generateCoverLetter = async (req, res, next) => {
  try {
    const { applicationId, resumeId } = req.body;
    const userId = req.user.id;
    const plan = await getUserPlan(userId);

    const idempotencyKey =
      req.headers["idempotency-key"];

    const job = await queueCoverLetter({
      userId,
      applicationId,
      resumeId,
      plan,
      idempotencyKey,
    });

    return res.status(202).json({
      success: true,
      message: job.existing
        ? "Existing cover letter job returned"
        : "Cover letter generation queued successfully",
      jobId: job.jobId,
      status: job.status,
      existing: job.existing,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoverLetterJob = async (
  req,
  res,
  next
) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const result =
      await getCoverLetterJobStatus(jobId,userId);

    return res.status(200).json({
      success: true,
      job: result,
    });
  } catch (error) {
    next(error);
  }
};