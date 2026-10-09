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

describe("Validation Security", () => {
  it("should reject an invalid resume UUID", async () => {
    const response = await request(app).get(
      "/api/resume/not-a-valid-uuid"
    );

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Validation failed"
    );
  });

  it("caches allowed CORS preflight responses", async () => {
    const response = await request(app)
      .options("/api/health")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET")
      .set("Access-Control-Request-Headers", "content-type");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3000"
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-max-age"]).toBe("600");
  });

  it("continues to reject disallowed CORS origins", async () => {
    const response = await request(app)
      .options("/api/health")
      .set("Origin", "https://not-allowed.example")
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });
});