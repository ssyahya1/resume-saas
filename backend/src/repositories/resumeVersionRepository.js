import { supabaseAdmin } from "../config/supabase.js";
import AppError from "../utils/appError.js";

export const createResumeVersion = async ({
  resumeId,
  versionNumber,
  content,
}) => {
  const { data, error } = await supabaseAdmin
    .from("resume_versions")
    .insert({
      resume_id: resumeId,
      version_number: versionNumber,
      content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getResumeVersions = async ({
  resumeId,
  userId,
  offset,
  limit,
}) => {
  const { count, error: countError } = await supabaseAdmin
    .from("resume_versions")
    .select("*, resumes!inner(user_id)", {
      count: "exact",
      head: true,
    })
    .eq("resume_id", resumeId)
    .eq("resumes.user_id", userId);

  if (countError) {
    throw countError;
  }

  if (offset >= count && count > 0) {
    return {
      versions: [],
      total: count,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("resume_versions")
    .select("*, resumes!inner(user_id)")
    .eq("resume_id", resumeId)
    .eq("resumes.user_id", userId)
    .order("version_number", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  const versions = (data || []).map(({ resumes, ...version }) => version);

  return {
    versions,
    total: count,
  };
};

export const getResumeVersionById = async (versionId) => {
  const { data, error } = await supabaseAdmin
    .from("resume_versions")
    .select("*")
    .eq("id", versionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Resume version not found", 404);
    }

    throw error;
  }

  return data;
};

export const getLatestResumeVersion = async ({
  resumeId,

}) => {
  const { data, error } = await supabaseAdmin
    .from("resume_versions")
    .select("*")
    .eq("resume_id", resumeId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const updateResumeVersionContent = async ({
  versionId,
  content,
}) => {
  const { data, error } = await supabaseAdmin
    .from("resume_versions")
    .update({
      content,
    })
    .eq("id", versionId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Resume version not found", 404);
    }

    throw error;
  }

  return data;
};