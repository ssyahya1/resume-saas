import { createSupabaseAuthClient } from "../config/supabaseAuth.js";
import { logger } from "../utils/logger.js";

export const requireAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies.sb_access_token;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const supabaseAuth = createSupabaseAuthClient(accessToken);

    const {
      data: { user },
      error,
    } = await supabaseAuth.auth.getUser(accessToken);

    if (error || !user) {
      logger.warn("Authentication rejected", {
        requestId: req.requestId,
        errorCode: error?.code,
        status: error?.status,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};