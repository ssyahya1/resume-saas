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

vi.mock("../src/services/applicationService.js", () => ({
  createUserApplication: vi.fn(),
  getUserApplications: vi.fn(),
  getUserApplicationById: vi.fn(),
  updateUserApplication: vi.fn(),
  deleteUserApplication: vi.fn(),
}));

import { app } from "../src/app.js";

import { getUserApplications } from "../src/services/applicationService.js";

describe("Applications pagination API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated applications for valid query params", async () => {
    getUserApplications.mockResolvedValue({
      applications: [{ id: "app-1" }],
      pagination: { page: 2, limit: 5, total: 11, totalPages: 3 },
    });

    const response = await request(app).get(
      "/api/applications?page=2&limit=5&status=saved"
    );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.applications).toEqual([{ id: "app-1" }]);

    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 11,
      totalPages: 3,
    });

    expect(getUserApplications).toHaveBeenCalledWith("user-123", {
      page: 2,
      limit: 5,
      status: "saved",
    });
  });

  it("applies default page and limit when omitted", async () => {
    getUserApplications.mockResolvedValue({
      applications: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });

    const response = await request(app).get("/api/applications");

    expect(response.status).toBe(200);

    expect(getUserApplications).toHaveBeenCalledWith("user-123", {
      page: 1,
      limit: 10,
      status: undefined,
    });
  });

  it("rejects page=0 with 400", async () => {
    const response = await request(app).get(
      "/api/applications?page=0&limit=10"
    );

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(getUserApplications).not.toHaveBeenCalled();
  });

  it("rejects limit=101 with 400", async () => {
    const response = await request(app).get(
      "/api/applications?page=1&limit=101"
    );

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(getUserApplications).not.toHaveBeenCalled();
  });

  it("returns an empty page with pagination metadata for large pages", async () => {
    getUserApplications.mockResolvedValue({
      applications: [],
      pagination: { page: 999, limit: 10, total: 1, totalPages: 1 },
    });

    const response = await request(app).get(
      "/api/applications?page=999&limit=10"
    );

    expect(response.status).toBe(200);

    expect(response.body.applications).toEqual([]);

    expect(response.body.pagination).toEqual({
      page: 999,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });
});
