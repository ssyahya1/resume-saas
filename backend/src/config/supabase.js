import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not configured");
}

if (!supabaseSecretKey) {
  throw new Error("SUPABASE_SECRET_KEY is not configured");
}

if (!supabasePublishableKey) {
  throw new Error(
    "SUPABASE_PUBLISHABLE_KEY is not configured"
  );
}

// Server-side privileged client.
// Used by repositories and admin operations.
// Never use this client for normal user sessions.
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Authentication client.
// Used for login, refresh, and password-reset flows.
export const supabaseAuth = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);