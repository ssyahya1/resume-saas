import express from "express";
import { getWorkspaceOptions } from "../controllers/workspaceOptionsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getWorkspaceOptions);

export default router;
