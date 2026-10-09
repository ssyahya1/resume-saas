import { supabaseAdmin } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

export const getWorkspaceOptionsByUserId = async (userId) => {
  const queryResults = await Promise.allSettled([
    supabaseAdmin
      .from("applications")
      .select("id, job_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("jobs")
      .select("id, title, company_name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("resumes")
      .select("id, title")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const readResult = (resource, queryResult) => {
    const result = queryResult.status === "fulfilled"
      ? queryResult.value
      : { data: null, error: queryResult.reason };

    if (result.error) {
      logger.error("Workspace options query failed", {
        resource,
        errorName: result.error.name,
        errorCode: result.error.code,
      });
    }

    return result;
  };

  const applicationsResult = readResult("applications", queryResults[0]);
  const jobsResult = readResult("jobs", queryResults[1]);
  const resumesResult = readResult("resumes", queryResults[2]);

  const unavailable = [];
  for (const [resource, result] of [
    ["applications", applicationsResult],
    ["jobs", jobsResult],
    ["resumes", resumesResult],
  ]) {
    if (result.error) {
      unavailable.push(resource);
    }
  }

  return {
    applications: applicationsResult.error ? [] : applicationsResult.data,
    jobs: jobsResult.error ? [] : jobsResult.data,
    resumes: resumesResult.error ? [] : resumesResult.data,
    unavailable,
  };
};
