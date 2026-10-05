import { supabaseAdmin } from "../config/supabase.js";

export const createInterviewQuestion = async ({
  userId,
  applicationId,
  question,
  answerGuidance,
  category,
}) => {
  const { data, error } = await supabaseAdmin
    .from("interview_questions")
    .insert({
      user_id: userId,
      application_id: applicationId,
      question,
      answer_guidance: answerGuidance,
      category,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const getInterviewQuestionsByApplication = async ({
  applicationId,
  userId,
}) => {
  const { data, error } = await supabaseAdmin
    .from("interview_questions")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
};