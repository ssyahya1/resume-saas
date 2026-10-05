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

import app from "../src/app.js";

describe("Authentication Security", () => {
  it("should reject unauthenticated access to protected resume routes", async () => {
    const response = await request(app).get(
      "/api/resume"
    );

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);
  });
});