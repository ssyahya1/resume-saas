import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../src/workers/aiAnalysisWorker.js", () => ({ default: {} }));
vi.mock("../src/workers/resumeTailoringWorker.js", () => ({ default: {} }));
vi.mock("../src/workers/coverLetterWorker.js", () => ({ default: {} }));
vi.mock("../src/workers/interviewQuestionWorker.js", () => ({ default: {} }));

vi.mock("../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, _res, next) => {
    req.user = { id: "user-123" };
    next();
  },
}));

vi.mock("../src/services/workspaceOptionsService.js", () => ({
  getUserWorkspaceOptions: vi.fn(),
}));

import { app } from "../src/app.js";
import { getUserWorkspaceOptions } from "../src/services/workspaceOptionsService.js";

describe("Workspace selection options API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns compact options for the authenticated user", async () => {
    const options = {
      applications: [{ id: "application-1", job_id: "job-1" }],
      jobs: [{ id: "job-1", title: "Designer", company_name: "Applyroom" }],
      resumes: [{ id: "resume-1", title: "Product resume" }],
      unavailable: [],
    };
    getUserWorkspaceOptions.mockResolvedValue(options);

    const response = await request(app).get("/api/workspace/options");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, ...options });
    expect(getUserWorkspaceOptions).toHaveBeenCalledWith("user-123");
  });
});
