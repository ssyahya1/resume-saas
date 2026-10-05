import express from "express";

import {
  createVersion,
  getVersions,
  getVersion,
} from "../controllers/resumeVersionController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

import {
  createResumeVersionSchema,
  resumeVersionParamsSchema,
  versionListQuerySchema,
} from "../validators/resumeVersionValidator.js";

const router = express.Router({
  mergeParams: true,
});

router.use(requireAuth);

router.post(
  "/",
  validate(createResumeVersionSchema),
  createVersion
);

router.get(
  "/",
  validate(versionListQuerySchema),
  getVersions
);

router.get(
  "/:versionId",
  validate(resumeVersionParamsSchema),
  getVersion
);

export default router;