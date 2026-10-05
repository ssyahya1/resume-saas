import express from "express";

import {
  generateInterviewQuestions,
  getQuestions,
  getInterviewQuestionJob
} from "../controllers/interviewQuestionController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { interviewQuestionSchema } from "../validators/interviewQuestionsValidator.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  rateLimitMiddleware("interview"),
  validate(interviewQuestionSchema),
  generateInterviewQuestions
);
router.get("/jobs/:jobId", getInterviewQuestionJob);
router.get("/:applicationId", getQuestions);

export default router;