import {
  registerUser,
  loginUser,
  refreshUserSession,
  forgotPassword,
} from "../services/authService.js";

import {
  setAuthCookies,
  clearAuthCookies,
} from "../config/authCookies.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, fullname } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const user = await registerUser({
      email,
      password,
      fullname,
    });

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const data = await loginUser({
      email,
      password,
    });

    const { session, user } = data;

    setAuthCookies(res, session);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const forgotPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgotPassword(email);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
};

export const logout = async (req, res) => {
  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.sb_refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const data = await refreshUserSession(refreshToken);

    if (!data.session) {
      return res.status(401).json({
        success: false,
        message: "Unable to refresh session",
      });
    }

    setAuthCookies(res, data.session);

    res.status(200).json({
      success: true,
      message: "Session refreshed",
    });
  } catch (error) {
    next(error);
  }
};
