import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../src/config/redis.js", () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock("../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = {
      id: "e26d8013-5f81-4281-af51-5527945aaf1c",
    };

    next();
  },
}));

vi.mock("../src/repositories/resumeRepository.js", () => ({
  getResumeById: vi.fn(),
}));

import app from "../src/app.js";

import { getResumeById } from "../src/repositories/resumeRepository.js";

describe("Authorization Security", () => {
  it("should not allow a user to access another user's resume", async () => {
    getResumeById.mockResolvedValue(null);

    const response = await request(app).get(
      "/api/resume/3801d267-e4ee-4c17-8bf7-844aef190f10"
    );

    expect(getResumeById).toHaveBeenCalledWith({
      resumeId:
        "3801d267-e4ee-4c17-8bf7-844aef190f10",

      userId:
        "e26d8013-5f81-4281-af51-5527945aaf1c",
    });

    expect(response.status).toBe(404);

    expect(response.body.success).toBe(false);
  });
});