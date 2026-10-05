import express from "express";

import {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

import {
  createApplicationSchema,
  applicationIdSchema,
  updateApplicationSchema,
  applicationListQuerySchema,
} from "../validators/applicationValidator.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  validate(createApplicationSchema),
  createApplication
);

router.get(
  "/",
  validate(applicationListQuerySchema),
  getApplications
);

router.get(
  "/:id",
  validate(applicationIdSchema),
  getApplication
);

router.patch(
  "/:id",
  validate(updateApplicationSchema),
  updateApplication
);

router.delete(
  "/:id",
  validate(applicationIdSchema),
  deleteApplication
);

export default router;