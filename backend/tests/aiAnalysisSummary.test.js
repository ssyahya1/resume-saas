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

vi.mock("../src/services/aiAnalysisService.js", () => ({
  queueAIAnalysis: vi.fn(),
  getUserAIAnalyses: vi.fn(),
  getUserAIAnalysisSummary: vi.fn(),
  getUserAIAnalysisById: vi.fn(),
}));

import { app } from "../src/app.js";
import { getUserAIAnalysisSummary } from "../src/services/aiAnalysisService.js";

describe("AI analysis dashboard summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns summary rows and the full total for the authenticated user", async () => {
    const analyses = [
      { id: "analysis-1", match_score: 82, created_at: "2026-10-08T00:00:00Z" },
    ];
    getUserAIAnalysisSummary.mockResolvedValue({ analyses, total: 14 });

    const response = await request(app).get("/api/ai-analyses/summary");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      analyses,
      pagination: { total: 14 },
    });
    expect(getUserAIAnalysisSummary).toHaveBeenCalledWith("user-123");
  });
});
