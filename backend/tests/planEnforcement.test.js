import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  getUserPlan: vi.fn(),
  queueAIAnalysis: vi.fn(),
  queueCoverLetter: vi.fn(),
  queueResumeTailoring: vi.fn(),
  queueInterviewQuestions: vi.fn(),
}));

vi.mock("../src/config/redis.js", () => ({
  default: (() => {
    const counters = new Map();
    const expirations = new Map();

    return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    eval: vi.fn(async (_script, options) => {
      const key = options.keys[0];
      const current = (counters.get(key) || 0) + 1;
      counters.set(key, current);

      if (current === 1) {
        expirations.set(key, Number(options.arguments[0]));
      }

      return current;
    }),
    };
  })(),
}));

vi.mock("../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = { id: "e26d8013-5f81-4281-af51-5527945aaf1c" };
    next();
  },
}));

vi.mock("../src/repositories/profileRepository.js", () => ({
  getUserPlan: mocks.getUserPlan,
}));

vi.mock("../src/services/aiAnalysisService.js", () => ({
  queueAIAnalysis: mocks.queueAIAnalysis,
  getUserAIAnalyses: vi.fn(),
  getUserAIAnalysisById: vi.fn(),
  createUserAIAnalysis: vi.fn(),
}));

vi.mock("../src/services/coverLetterService.js", () => ({
  queueCoverLetter: mocks.queueCoverLetter,
  generateCoverLetter: vi.fn(),
}));

vi.mock("../src/services/resumeTailoringService.js", () => ({
  queueResumeTailoring: mocks.queueResumeTailoring,
  tailorUserResume: vi.fn(),
}));

vi.mock("../src/services/interviewQuestionService.js", () => ({
  queueInterviewQuestions: mocks.queueInterviewQuestions,
  generateInterviewQuestions: vi.fn(),
  getApplicationInterviewQuestions: vi.fn(),
}));

import app from "../src/app.js";

const userId = "e26d8013-5f81-4281-af51-5527945aaf1c";
const applicationId = "9b043bd7-f32a-44b7-856a-a57ebad6a978";
const resumeId = "3801d267-e4ee-4c17-8bf7-844aef190f10";
const versionId = "57e55a14-5ba0-491b-8825-d9e136845ec6";
const jobId = "5bcae348-12d0-49c9-a2ba-0a6bbf29df38";

const features = [
  {
    path: "/api/ai-analyses",
    body: { applicationId },
    service: mocks.queueAIAnalysis,
  },
  {
    path: "/api/cover-letters",
    body: { applicationId, resumeId },
    service: mocks.queueCoverLetter,
  },
  {
    path: "/api/resume/tailor",
    body: { resumeId, versionId, jobId },
    service: mocks.queueResumeTailoring,
  },
  {
    path: "/api/interview-questions",
    body: { applicationId, resumeId },
    service: mocks.queueInterviewQuestions,
  },
];

describe("Server-side plan enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserPlan.mockResolvedValue("free");
    for (const feature of features) {
      feature.service.mockResolvedValue({
        existing: false,
        jobId: "queued-job",
        status: "queued",
      });
    }
  });

  it.each(features)(
    "$path uses database free plan when request claims pro",
    async ({ path, body, service }) => {
      const response = await request(app)
        .post(path)
        .set("idempotency-key", `plan-free-${path}`)
        .send({ ...body, plan: "pro" });

      expect(response.status).toBe(202);
      expect(mocks.getUserPlan).toHaveBeenCalledWith(userId);
      expect(service).toHaveBeenCalledWith(
        expect.objectContaining({ userId, plan: "free" }),
      );
    },
  );

  it.each(features)(
    "$path uses database pro plan when request claims free",
    async ({ path, body, service }) => {
      mocks.getUserPlan.mockResolvedValue("pro");

      const response = await request(app)
        .post(path)
        .set("idempotency-key", `plan-pro-${path}`)
        .send({ ...body, plan: "free" });

      expect(response.status).toBe(202);
      expect(mocks.getUserPlan).toHaveBeenCalledWith(userId);
      expect(service).toHaveBeenCalledWith(
        expect.objectContaining({ userId, plan: "pro" }),
      );
    },
  );
});
