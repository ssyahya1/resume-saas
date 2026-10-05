import dotenv from "dotenv";
dotenv.config();
import { createSupabaseAuthClient } from "../config/supabaseAuth.js";
import { logger } from "../utils/logger.js";

const parseCookies = (cookieHeader) => {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  const parts = cookieHeader.split(";");

  for (const part of parts) {
    const [name, ...valueParts] = part.trim().split("=");

    if (!name) {
      continue;
    }

    const value = valueParts.join("=");

    cookies[name] = decodeURIComponent(value);
  }

  return cookies;
};
export const authenticateWebSocket = async (request) => {
  try {
    const origin = request.headers.origin;

    const allowedOrigin =
      process.env.FRONTEND_URL || "http://localhost:3000";

    if (origin && origin !== allowedOrigin) {
      logger.warn("WebSocket connection rejected", {
        reason: "origin_not_allowed",
      });

      return null;
    }

    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = parseCookies(cookieHeader);

    const accessToken = cookies.sb_access_token;

    if (!accessToken) {
      return null;
    }

    const supabaseAuth =
      createSupabaseAuthClient(accessToken);

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return {
      user,
      accessToken,
    };
  } catch (error) {
    logger.warn("WebSocket authentication failed", {
      errorName: error?.name,
      errorCode: error?.code,
    });

    return null;
  }
};