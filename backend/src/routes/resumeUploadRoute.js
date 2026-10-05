import express from "express";

import { uploadResume as uploadMiddleware } from "../middleware/uploadMiddleware.js";
import { uploadResume } from "../controllers/resumeUploadController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { resumeUploadSchema } from "../validators/resumeUploadValidator.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  uploadMiddleware.single("resume"),
  validate(resumeUploadSchema),
  uploadResume
);

export default router;