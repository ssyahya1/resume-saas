import { describe, it, expect, vi } from "vitest";
import request from "supertest";

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
vi.mock("../src/queues/resumeTailoringQueue.js", () => ({
  resumeTailoringQueue: {
    add: vi.fn().mockResolvedValue({
      id: "test-resume-tailoring-job",
    }),
  },
}));
vi.mock("../src/repositories/idempotencyRepository.js", () => ({
  getIdempotencyKey: vi.fn().mockResolvedValue(null),

  createIdempotencyKey: vi.fn().mockResolvedValue({
    id: "test-idempotency-record",
  }),

  updateIdempotencyKey: vi.fn().mockResolvedValue({
    id: "test-idempotency-record",
  }),
}));

vi.mock("../src/services/usageService.js", () => ({
  reserveUserResumeTailoring: vi.fn().mockResolvedValue(undefined),
  releaseUserResumeTailoring: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../src/repositories/profileRepository.js", () => ({
  getUserPlan: vi.fn().mockResolvedValue("free"),
}));

vi.mock("../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = {
      id: "e26d8013-5f81-4281-af51-5527945aaf1c",
    };

    next();
  },
}));

import app from "../src/app.js";
import { resumeTailoringQueue } from "../src/queues/resumeTailoringQueue.js";
import { reserveUserResumeTailoring } from "../src/services/usageService.js";
import { getUserPlan } from "../src/repositories/profileRepository.js";

describe("Resume Tailoring Queue Route", () => {
  it("uses the database free plan even when the request claims pro", async () => {
    const userId = "e26d8013-5f81-4281-af51-5527945aaf1c";
    const response = await request(app)
      .post("/api/resume/tailor")
      .set("idempotency-key", `test-tailoring-${Date.now()}`)
      .send({
        resumeId: "3801d267-e4ee-4c17-8bf7-844aef190f10",

        versionId: "57e55a14-5ba0-491b-8825-d9e136845ec6",

        jobId: "5bcae348-12d0-49c9-a2ba-0a6bbf29df38",

        plan: "pro",
      });

    expect(response.status).toBe(202);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: "Resume tailoring queued successfully",
        status: "queued",
        existing: false,
      }),
    );

    expect(response.body.jobId).toBeTruthy();

    expect(typeof response.body.jobId).toBe("string");
    expect(getUserPlan).toHaveBeenCalledWith(userId);
    expect(reserveUserResumeTailoring).toHaveBeenCalledWith(userId, "free");
    expect(resumeTailoringQueue.add).toHaveBeenCalledWith(
      "tailor-resume",
      expect.objectContaining({ userId, plan: "free" }),
      expect.any(Object),
    );
  });

  it("uses the database pro plan even when the request claims free", async () => {
    const userId = "e26d8013-5f81-4281-af51-5527945aaf1c";
    getUserPlan.mockResolvedValueOnce("pro");

    const response = await request(app)
      .post("/api/resume/tailor")
      .set("idempotency-key", `test-tailoring-pro-${Date.now()}`)
      .send({
        resumeId: "3801d267-e4ee-4c17-8bf7-844aef190f10",
        versionId: "57e55a14-5ba0-491b-8825-d9e136845ec6",
        jobId: "5bcae348-12d0-49c9-a2ba-0a6bbf29df38",
        plan: "free",
      });

    expect(response.status).toBe(202);
    expect(getUserPlan).toHaveBeenCalledWith(userId);
    expect(reserveUserResumeTailoring).toHaveBeenLastCalledWith(userId, "pro");
    expect(resumeTailoringQueue.add).toHaveBeenLastCalledWith(
      "tailor-resume",
      expect.objectContaining({ userId, plan: "pro" }),
      expect.any(Object),
    );
  });
});
