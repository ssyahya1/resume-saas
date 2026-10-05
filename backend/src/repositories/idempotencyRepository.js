import { supabaseAdmin } from "../config/supabase.js";

const PENDING_IDEMPOTENCY_STALE_MS = 15 * 60 * 1000;

export const getIdempotencyKey = async ({
  userId,
  idempotencyKey,
}) => {
  const { data, error } = await supabaseAdmin
    .from("idempotency_keys")
    .select("*")
    .eq("user_id", userId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const recoverStalePendingIdempotencyKey = async ({
  id,
  updatedAt,
}) => {
  const staleBefore = new Date(
    Date.now() - PENDING_IDEMPOTENCY_STALE_MS
  ).toISOString();

  if (Date.parse(updatedAt) >= Date.parse(staleBefore)) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("idempotency_keys")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .eq("updated_at", updatedAt)
    .lt("updated_at", staleBefore)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const createIdempotencyKey = async ({
  userId,
  idempotencyKey,
  requestHash,
}) => {
  const { data, error } = await supabaseAdmin
    .from("idempotency_keys")
    .insert({
      user_id: userId,
      idempotency_key: idempotencyKey,
      request_hash: requestHash,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateIdempotencyKey = async ({
  id,
  jobId,
  status,
}) => {
  const { data, error } = await supabaseAdmin
    .from("idempotency_keys")
    .update({
      job_id: jobId,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};