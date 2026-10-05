import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../src/workers/aiAnalysisWorker.js", () => ({ default: {} }));
vi.mock("../src/workers/resumeTailoringWorker.js", () => ({ default: {} }));
vi.mock("../src/workers/coverLetterWorker.js", () => ({ default: {} }));
vi.mock("../src/workers/interviewQuestionWorker.js", () => ({ default: {} }));

vi.mock("../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = { id: "user-123" };

    next();
  },
}));

vi.mock("../src/services/resumeVersionService.js", () => ({
  createUserResumeVersion: vi.fn(),
  getUserResumeVersions: vi.fn(),
  getUserResumeVersionById: vi.fn(),
}));

import { app } from "../src/app.js";

import { getUserResumeVersions } from "../src/services/resumeVersionService.js";

const RESUME_ID = "3801d267-e4ee-4c17-8bf7-844aef190f10";

describe("Resume version pagination API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated versions for a valid resume", async () => {
    getUserResumeVersions.mockResolvedValue({
      versions: [{ id: "version-2" }, { id: "version-1" }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });

    const response = await request(app).get(
      `/api/resume/${RESUME_ID}/versions?page=1&limit=10`
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.versions).toEqual([
      { id: "version-2" },
      { id: "version-1" },
    ]);

    expect(response.body.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });

    expect(getUserResumeVersions).toHaveBeenCalledWith({
      resumeId: RESUME_ID,
      userId: "user-123",
      page: 1,
      limit: 10,
    });
  });

  it("applies default page and limit when omitted", async () => {
    getUserResumeVersions.mockResolvedValue({
      versions: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get(
      `/api/resume/${RESUME_ID}/versions`
    );

    expect(response.status).toBe(200);

    expect(getUserResumeVersions).toHaveBeenCalledWith({
      resumeId: RESUME_ID,
      userId: "user-123",
      page: 1,
      limit: 10,
    });
  });

  it("rejects page=0 with 400", async () => {
    const response = await request(app).get(
      `/api/resume/${RESUME_ID}/versions?page=0&limit=10`
    );

    expect(response.status).toBe(400);

    expect(getUserResumeVersions).not.toHaveBeenCalled();
  });

  it("rejects limit=101 with 400", async () => {
    const response = await request(app).get(
      `/api/resume/${RESUME_ID}/versions?page=1&limit=101`
    );

    expect(response.status).toBe(400);

    expect(getUserResumeVersions).not.toHaveBeenCalled();
  });

  it("rejects a non-uuid resumeId with 400", async () => {
    const response = await request(app).get(
      "/api/resume/not-a-uuid/versions?page=1&limit=10"
    );

    expect(response.status).toBe(400);

    expect(getUserResumeVersions).not.toHaveBeenCalled();
  });

  it("returns an empty page with pagination metadata for large pages", async () => {
    getUserResumeVersions.mockResolvedValue({
      versions: [],
      pagination: { page: 999, limit: 10, total: 1, totalPages: 1 },
    });

    const response = await request(app).get(
      `/api/resume/${RESUME_ID}/versions?page=999&limit=10`
    );

    expect(response.status).toBe(200);

    expect(response.body.versions).toEqual([]);

    expect(response.body.pagination).toEqual({
      page: 999,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });
});
