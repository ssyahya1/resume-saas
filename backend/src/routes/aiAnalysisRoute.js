import express from "express";

import {
  createAIAnalysis,
  getAIAnalyses,
  getAIAnalysis,
} from "../controllers/aiAnalysisController.js";
import { getAIAnalysisJob } from "../controllers/aiAnalysisController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createAIAnalysisSchema } from "../validators/aiAnalysisValidation.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  rateLimitMiddleware("ai-analysis"),
  validate(createAIAnalysisSchema),
  createAIAnalysis
);

router.get("/", getAIAnalyses);
router.get("/jobs/:jobId", getAIAnalysisJob);
router.get("/:id", getAIAnalysis);



export default router;