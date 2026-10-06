
import {
  getUsageByUserId,
  createUsage,
  incrementAIAnalysisUsage,
  incrementResumeTailoringUsage,
  incrementCoverLetterUsage,
  reserveAIAnalysisUsage,
  reserveResumeTailoringUsage,
  reserveCoverLetterUsage,
  reserveInterviewQuestionUsage,
  releaseAIAnalysisUsage,
  releaseResumeTailoringUsage,
  releaseCoverLetterUsage,
  releaseInterviewQuestionUsage,

} from "../repositories/usageRepository.js";
import AppError from "../utils/appError.js";


const FREE_AI_ANALYSIS_LIMIT = 5;
const PRO_AI_ANALYSIS_LIMIT = 100;

const FREE_RESUME_TAILORING_LIMIT = 5;
const PRO_RESUME_TAILORING_LIMIT = 50;

const FREE_COVER_LETTER_LIMIT = 5;
const PRO_COVER_LETTER_LIMIT = 50;


export const getUserUsage = async (userId) => {
  let usage = await getUsageByUserId(userId);

  if (!usage) {
    usage = await createUsage(userId);
  }

  return usage;
};

export const checkAIAnalysisLimit = async (
  userId,
  plan = "free"
) => {
  const usage = await getUserUsage(userId);

  const limit =
    plan === "pro"
      ? PRO_AI_ANALYSIS_LIMIT
      : FREE_AI_ANALYSIS_LIMIT;

  if (usage.ai_analysis_count >= limit) {
    throw new AppError(
      `AI analysis limit reached. Your ${plan} plan allows ${limit} analyses.`,
      429
    );
  }

  return {
    allowed: true,
    used: usage.ai_analysis_count,
    limit,
    remaining: limit - usage.ai_analysis_count,
  };
};

export const incrementAIAnalysisUsageCount = async (userId) =>
  incrementAIAnalysisUsage(userId);

export const checkResumeTailoringLimit = async (
  userId,
  plan = "free"
) => {
  const usage = await getUserUsage(userId);

  const limit =
    plan === "pro"
      ? PRO_RESUME_TAILORING_LIMIT
      : FREE_RESUME_TAILORING_LIMIT;

  if (usage.resume_tailoring_count >= limit) {
    throw new AppError(
      `Resume tailoring limit reached. Your ${plan} plan allows ${limit} tailorings.`,
      429
    );
  }

  return {
    allowed: true,
    used: usage.resume_tailoring_count,
    limit,
    remaining: limit - usage.resume_tailoring_count,
  };
};

export const incrementResumeTailoringUsageCount = async (userId) =>
  incrementResumeTailoringUsage(userId);


export const checkCoverLetterLimit = async(
  userId,
  plan="free"
) =>{
  const usage = await getUserUsage(userId);

  const limit =
    plan === "pro"
      ? PRO_COVER_LETTER_LIMIT
      : FREE_COVER_LETTER_LIMIT;

  if (usage.cover_letter_count >= limit) {
    throw new AppError(
      `Cover Letter limit reached. Your ${plan} plan allows ${limit} cover letters.`,
      429
    );
  }

  return {
    allowed: true,
    used: usage.cover_letter_count,
    limit,
    remaining: limit - usage.cover_letter_count,
  };

};

export const incrementCoverLetterUsageCount = async (userId) =>
  incrementCoverLetterUsage(userId);


export const reserveUserAIAnalysis = async (userId, plan = "free") => {
  const result = await reserveAIAnalysisUsage(userId, plan);

  if (!result.allowed) {
    throw new AppError(
      `AI analysis limit reached. Your ${plan} plan allows ${result.limit} analyses.`,
      429
    );
  }

  return result;
};

export const reserveUserResumeTailoring = async (
  userId,
  plan = "free"
) => {
  const result = await reserveResumeTailoringUsage(userId, plan);

  if (!result.allowed) {
    throw new AppError(
      `Resume tailoring limit reached. Your ${plan} plan allows ${result.limit} tailorings.`,
      429
    );
  }

  return result;
};

export const reserveUserCoverLetter = async (
  userId,
  plan = "free"
) => {
  const result = await reserveCoverLetterUsage(userId, plan);

  if (!result.allowed) {
    throw new AppError(
      `Cover Letter limit reached. Your ${plan} plan allows ${result.limit} cover letters.`,
      429
    );
  }

  return result;
};

export const reserveUserInterviewQuestions = async (
  userId,
  plan = "free"
) => {
  const result = await reserveInterviewQuestionUsage(
    userId,
    plan
  );

  if (!result.allowed) {
    throw new AppError(
      `Interview Question limit reached. Your ${plan} plan allows ${result.limit} interview question generations.`,
      429
    );
  }

  return result;
};

export const releaseUserAIAnalysis = async (userId) => {
  const result = await releaseAIAnalysisUsage(userId);
}
export const releaseUserResumeTailoring = async (userId) => {
  const result = await releaseResumeTailoringUsage(userId);
};

export const releaseUserCoverLetter = async (userId) => {
  const result = await releaseCoverLetterUsage(userId);
};
export const releaseUserInterviewQuestions = async (userId) => {
  const result = await releaseInterviewQuestionUsage(userId);
}