
import { supabaseAdmin } from "../config/supabase.js";

export const getUsageByUserId = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const createUsage = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("usage_tracking")
    .insert({
      user_id: userId,
      ai_analysis_count: 0,
      resume_tailoring_count: 0,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const incrementAIAnalysisUsage = async (userId) => {
  const usage = await getUsageByUserId(userId);

  if (!usage) {
    const { data, error } = await supabaseAdmin
      .from("usage_tracking")
      .insert({
        user_id: userId,
        ai_analysis_count: 1,
        resume_tailoring_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("usage_tracking")
    .update({
      ai_analysis_count: usage.ai_analysis_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usage.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const incrementResumeTailoringUsage = async (userId) => {
  const usage = await getUsageByUserId(userId);

  if (!usage) {
    const { data, error } = await supabaseAdmin
      .from("usage_tracking")
      .insert({
        user_id: userId,
        ai_analysis_count: 0,
        resume_tailoring_count: 1,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("usage_tracking")
    .update({
      resume_tailoring_count: usage.resume_tailoring_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usage.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const incrementCoverLetterUsage = async(userId)=>{
  const usage = await getUsageByUserId(userId);

  if (!usage) {
    const { data, error } = await supabaseAdmin
      .from("usage_tracking")
      .insert({
        user_id: userId,
        ai_analysis_count: 0,
        resume_tailoring_count: 0,
        cover_letter_count:1,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from("usage_tracking")
    .update({
      cover_letter_count: usage.cover_letter_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", usage.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


export const reserveAIAnalysisUsage = async (userId, plan) => {
  const { data, error } = await supabaseAdmin.rpc(
    "reserve_ai_analysis_usage",
    {
      p_user_id: userId,
      p_plan: plan,
    }
  );

  if (error) throw error;

  return data;
};


export const reserveResumeTailoringUsage = async (userId, plan) => {
  const { data, error } = await supabaseAdmin.rpc(
    "reserve_resume_tailoring_usage",
    {
      p_user_id: userId,
      p_plan: plan,
    }
  );

  if (error) {
    throw error;
  }

  return data;
};

export const reserveCoverLetterUsage = async (userId, plan) => {
  const { data, error } = await supabaseAdmin.rpc(
    "reserve_cover_letter_usage",
    {
      p_user_id: userId,
      p_plan: plan,
    }
  );

  if (error) {
    throw error;
  }

  return data;
};

export const reserveInterviewQuestionUsage = async (
  userId,
  plan
) => {
  const { data, error } = await supabaseAdmin.rpc(
    "reserve_interview_question_usage",
    {
      p_user_id: userId,
      p_plan: plan,
    }
  );

  if (error) {
    throw error;
  }

  return data;
};
export const releaseAIAnalysisUsage = async (userId) => {
  const { error } = await supabaseAdmin.rpc(
    "release_ai_analysis_usage",
    {
      p_user_id: userId,
    }
  );

  if (error) {
    throw error;
  }
};
export const releaseResumeTailoringUsage = async (userId) => {
  const { error } = await supabaseAdmin.rpc(
    "release_resume_tailoring_usage",
    {
      p_user_id: userId,
    }
  );

  if (error) {
    throw error;
  }
};
export const releaseCoverLetterUsage = async (userId) => {
  const { error } = await supabaseAdmin.rpc(
    "release_cover_letter_usage",
    {
      p_user_id: userId,
    }
  );

  if (error) {
    throw error;
  }
};

export const releaseInterviewQuestionUsage = async (
  userId
) => {
  const { error } = await supabaseAdmin.rpc(
    "release_interview_question_usage",
    {
      p_user_id: userId,
    }
  );

  if (error) throw error;
};