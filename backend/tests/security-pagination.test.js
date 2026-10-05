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

import app from "../src/app.js";

describe("Pagination Security", () => {
  it("should reject page 0", async () => {
    const response = await request(app)
      .get("/api/resume")
      .query({
        page: 0,
        limit: 10,
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });

  it("should reject a limit greater than 100", async () => {
    const response = await request(app)
      .get("/api/resume")
      .query({
        page: 1,
        limit: 101,
      });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);
  });
});