import express from "express";

import {
  register,
  login,
  forgotPasswordRequest,
  me,
  logout,
  refresh,
} from "../controllers/authController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import authRateLimitMiddleware from "../middleware/authRateLimitMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from "../validators/authValidator.js";

const router = express.Router();

router.post(
  "/register",
  authRateLimitMiddleware,
  validate(registerSchema),
  register
);

router.post(
  "/login",
  authRateLimitMiddleware,
  validate(loginSchema),
  login
);

router.post(
  "/forgot-password",
  authRateLimitMiddleware,
  validate(forgotPasswordSchema),
  forgotPasswordRequest
);

router.get("/me", requireAuth, me);

router.post("/logout", logout);

router.post("/refresh", refresh);

export default router;
