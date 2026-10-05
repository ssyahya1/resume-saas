import express from "express";

import {
  tailorResume,
  getResumeTailoringJob,
} from "../controllers/resumeTailoringController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

import rateLimitMiddleware from "../middleware/rateLimitMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { resumeTailoringSchema } from "../validators/resumeTailoringValidator.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  rateLimitMiddleware("resume-tailoring"),
  validate(resumeTailoringSchema),
  tailorResume
);

router.get("/jobs/:jobId", getResumeTailoringJob);

export default router;