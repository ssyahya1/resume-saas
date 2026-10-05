import express from "express";

import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

import {
  createJobSchema,
  jobIdSchema,
  updateJobSchema,
  jobListQuerySchema
} from "../validators/jobValidator.js";

const router = express.Router();

router.use(requireAuth);

router.post(
  "/",
  validate(createJobSchema),
  createJob
);

router.get("/", validate(jobListQuerySchema), getJobs);

router.get(
  "/:id",
  validate(jobIdSchema),
  getJob
);

router.patch(
  "/:id",
  validate(updateJobSchema),
  updateJob
);

router.delete(
  "/:id",
  validate(jobIdSchema),
  deleteJob
);

export default router;