import express from "express";
import { generateCoverLetter,getCoverLetterJob } from "../controllers/coverLetterController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import rateLimitMiddleware from "../middleware/rateLimitMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { coverLetterSchema } from "../validators/coverLetterValidator.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  rateLimitMiddleware("cover-letter"),
  validate(coverLetterSchema),
  generateCoverLetter,
);

router.get("/jobs/:jobId", getCoverLetterJob);

export default router;