import { supabaseAdmin } from "../config/supabase.js";
import AppError from "../utils/appError.js";

export const createResume = async ({ userId, title }) => {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
export const getResumesByUserId = async ({
  userId,
  offset,
  limit,
}) => {
  const { count, error: countError } = await supabaseAdmin
    .from("resumes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  if (offset >= count && count > 0) {
    return {
      resumes: [],
      total: count,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return {
    resumes: data,
    total: count,
  };
};
export const getResumeById = async ({ resumeId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const updateResume = async ({ resumeId, userId, title }) => {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Resume not found", 404);
    }

    throw error;
  }

  return data;
};

export const deleteResume = async ({ resumeId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};