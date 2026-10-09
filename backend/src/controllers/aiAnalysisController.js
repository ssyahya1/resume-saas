import {
  queueAIAnalysis,
  getUserAIAnalyses,
  getUserAIAnalysisSummary,
  getUserAIAnalysisById,
} from "../services/aiAnalysisService.js";

import {
  getAIAnalysisJobStatus,
} from "../services/aiAnalysisJobService.js";
import { getUserPlan } from "../repositories/profileRepository.js";

export const createAIAnalysis = async (req, res, next) => {
  try {
    const { applicationId } = req.body;
    const userId = req.user.id;
    const plan = await getUserPlan(userId);

    const idempotencyKey =
      req.headers["idempotency-key"];

    const aiAnalysis = await queueAIAnalysis({
      userId,
      applicationId,
      plan,
      idempotencyKey,
    });

    return res.status(202).json({
      success: true,
      message: aiAnalysis.existing
        ? "Existing AI analysis job returned"
        : "AI Analysis Created Successfully",
      aiAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getAIAnalyses = async (req, res, next) => {
  try {
    const analyses = await getUserAIAnalyses(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      analyses,
    });
  } catch (error) {
    next(error);
  }
};

export const getAIAnalysisSummary = async (req, res, next) => {
  try {
    const summary = await getUserAIAnalysisSummary(req.user.id);

    return res.status(200).json({
      success: true,
      analyses: summary.analyses,
      pagination: {
        total: summary.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAIAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;

    const aiAnalysis = await getUserAIAnalysisById({
      analysisId: id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      aiAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getAIAnalysisJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    const result = await getAIAnalysisJobStatus(jobId,userId);

    return res.status(200).json({
      success: true,
      job: result,
    });
  } catch (error) {
    next(error);
  }
};