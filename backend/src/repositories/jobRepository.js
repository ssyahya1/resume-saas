import { supabaseAdmin } from "../config/supabase.js";
import AppError from "../utils/appError.js";

export const createJob = async ({
  userId,
  title,
  companyName,
  description,
  jobUrl,
}) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert({
      user_id: userId,
      title,
      company_name: companyName || null,
      description,
      job_url: jobUrl || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
export const getJobsByUserId = async ({
  userId,
  offset,
  limit,

}) => {
  let countQuery = supabaseAdmin
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);


  const { count, error: countError } = await countQuery;

  if (countError) {
    throw countError;
  }

  if (offset >= count && count > 0) {
    return {
      jobs: [],
      total: count,
    };
  }

  let query = supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("user_id", userId);


  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return {
    jobs: data,
    total: count,
  };
};
export const getJobById = async ({ jobId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Job not found", 404);
    }

    throw error;
  }

  return data;
};

export const updateJob = async ({
  jobId,
  userId,
  title,
  companyName,
  description,
  jobUrl,
}) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update({
      title,
      company_name: companyName || null,
      description,
      job_url: jobUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Job not found", 404);
    }

    throw error;
  }

  return data;
};

export const deleteJob = async ({ jobId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new AppError("Job not found", 404);
    }

    throw error;
  }

  return data;
};