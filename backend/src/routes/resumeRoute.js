import express from "express";

import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume
} from "../controllers/resumeController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

import {
  createResumeSchema,
  resumeIdSchema,
  updateResumeSchema,
  resumeListQuerySchema
} from "../validators/resumeValidator.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  validate(createResumeSchema),
  createResume
);

router.get("/", validate(resumeListQuerySchema),
  getResumes);

router.get(
  "/:id",
  validate(resumeIdSchema),
  getResume
);

router.patch(
  "/:id",
  validate(updateResumeSchema),
  updateResume
);

router.delete(
  "/:id",
  validate(resumeIdSchema),
  deleteResume
);

export default router;