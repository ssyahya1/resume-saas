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

vi.mock("../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = {
      id: "e26d8013-5f81-4281-af51-5527945aaf1c",
    };

    next();
  },
}));

import app from "../src/app.js";

describe("Idempotency Security", () => {
  it("should reject an AI request without an idempotency key", async () => {
    const response = await request(app)
      .post("/api/resume/tailor")
      .send({
        resumeId:
          "3801d267-e4ee-4c17-8bf7-844aef190f10",

        versionId:
          "57e55a14-5ba0-491b-8825-d9e136845ec6",

        jobId:
          "5bcae348-12d0-49c9-a2ba-0a6bbf29df38",

        plan: "free",
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });
});