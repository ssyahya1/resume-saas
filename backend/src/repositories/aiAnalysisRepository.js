import { supabaseAdmin } from "../config/supabase.js";
import AppError from "../utils/appError.js";

export const createAIAnalysis = async ({
  userId,
  applicationId,
  resumeId,
  jobId,
  matchScore,
  analysis,
}) => {
  const { data, error } = await supabaseAdmin
    .from("ai_analyses")
    .insert({
      user_id: userId,
      application_id: applicationId,
      resume_id: resumeId,
      job_id: jobId,
      match_score: matchScore,
      analysis: analysis,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getAIAnalysesByUserId = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("ai_analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getAIAnalysisSummaryByUserId = async (userId) => {
  const { data, count, error } = await supabaseAdmin
    .from("ai_analyses")
    .select("id, match_score, created_at", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  if (count === null) {
    throw new Error("Could not determine the AI analysis total");
  }

  return {
    analyses: data,
    total: count,
  };
};

export const getAIAnalysisById = async ({
  analysisId,
  userId,
}) => {
  const { data, error } = await supabaseAdmin
    .from("ai_analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("AI analysis not found", 404);
    }

    throw error;
  }

  return data;
};