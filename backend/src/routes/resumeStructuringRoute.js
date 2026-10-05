import express from "express";
import { structureResume } from "../controllers/resumeStructuringController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { resumeStructuringSchema } from "../validators/resumeStructuringValidator.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/",
  validate(resumeStructuringSchema),
  structureResume
);

export default router;