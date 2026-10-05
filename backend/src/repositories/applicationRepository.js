import { supabaseAdmin } from "../config/supabase.js";
import AppError from "../utils/appError.js";

export const createApplication = async({
    userId,
    jobId,
    resumeId,
    status,
    appliedAt


}) => {
    const{data,error} = await supabaseAdmin
    .from("applications")
    .insert({
        user_id:userId,
        job_id:jobId,
        resume_id:resumeId,
        status: status,
        applied_at:appliedAt
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};


export const getApplicationsByUserId = async ({
  userId,
  offset,
  limit,
  status,
}) => {
  let countQuery = supabaseAdmin
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (status) {
    countQuery = countQuery.eq("status", status);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw countError;
  }

  if (offset >= count && count > 0) {
    return {
      applications: [],
      total: count,
    };
  }

  let query = supabaseAdmin
    .from("applications")
    .select("*")
    .eq("user_id", userId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return {
    applications: data,
    total: count,
  };
};

export const getApplicationById = async ({ applicationId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Application not found", 404);
    }

    throw error;
  }

  return data;
};


export const updateApplication = async ({
  applicationId,
  userId,
  status,
  appliedAt
}) => {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .update({
      status:status,
      applied_at:appliedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Application not found", 404);
    }

    throw error;
  }

  return data;
};


export const deleteApplication = async ({ applicationId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Application not found", 404);
    }

    throw error;
  }

  return data;
};