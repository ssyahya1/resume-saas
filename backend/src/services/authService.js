import { supabaseAdmin, supabaseAuth} from "../config/supabase.js";

export const registerUser = async ({ email, password, fullName }) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error) {
    throw error;
  }

  return data.user;
};

export const loginUser = async ({ email, password }) => {
  const { data, error } =
    await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  return data;
};

export const refreshUserSession = async (refreshToken) => {
  const { data, error } =
    await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

  if (error) {
    throw error;
  }

  return data;
};

export const forgotPassword = async (email) => {
  const { error } =
    await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

  if (error) {
    throw error;
  }
};