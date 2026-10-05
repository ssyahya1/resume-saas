import { supabaseAdmin } from "../config/supabase.js";

export const getUserPlan = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data.plan;
};
