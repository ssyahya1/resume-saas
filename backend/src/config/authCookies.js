const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const accessCookieOptions = {
  ...authCookieOptions,
};

const refreshCookieOptions = {
  ...authCookieOptions,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const setAuthCookies = (res, session) => {
  res.cookie("sb_access_token", session.access_token, {
    ...accessCookieOptions,
    maxAge: Number(session.expires_in || 3600) * 1000,
  });

  res.cookie("sb_refresh_token", session.refresh_token, {
    ...refreshCookieOptions,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie("sb_access_token", accessCookieOptions);
  res.clearCookie("sb_refresh_token", authCookieOptions);
};