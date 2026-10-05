"use client";

import api from "./api";

export const getMe = () => api("/api/auth/me");

export const login = ({ email, password }) =>
  api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = ({ email, password, fullname }) => {
  const body = { email, password };

  if (fullname && fullname.trim()) {
    body.fullname = fullname.trim();
  }

  return api("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const logout = () =>
  api("/api/auth/logout", {
    method: "POST",
  });

export const refreshSession = () =>
  api("/api/auth/refresh", {
    method: "POST",
  });

export const forgotPassword = (email) =>
  api("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
