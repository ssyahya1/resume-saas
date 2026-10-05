import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../src/middleware/authMiddleware.js", () => ({
  requireAuth: (req, res, next) => {
    req.user = {
      id: "user-123",
    };

    next();
  },
}));

vi.mock("../src/services/resumeStructuringService.js", () => ({
  structureUserResume: vi.fn(),
}));

import app from "../src/app.js";

import { structureUserResume } from "../src/services/resumeStructuringService.js";

describe("Resume Structuring API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should structure a resume successfully", async () => {
    structureUserResume.mockResolvedValue({
      id: "57e55a14-5ba0-491b-8825-d9e136845ec6",
      resume_id: "3801d267-e4ee-4c17-8bf7-844aef190f10",
      content: {
        structuredData: {
          personalInfo: {
            name: "John Doe",
            email: "john@example.com",
            phone: "123456789",
            location: "Karachi",
            links: [],
          },
          summary: "Software Engineer",
          skills: ["JavaScript"],
          experience: [],
          projects: [],
          education: [],
          certifications: [],
        },
      },
    });

    const response = await request(app)
      .post(
        "/api/resume/3801d267-e4ee-4c17-8bf7-844aef190f10/versions/57e55a14-5ba0-491b-8825-d9e136845ec6/structure"
      );

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "Resume Structured Successfully"
    );

    expect(response.body.version).toBeDefined();

    expect(structureUserResume).toHaveBeenCalledWith({
      resumeId: "3801d267-e4ee-4c17-8bf7-844aef190f10",
      versionId: "57e55a14-5ba0-491b-8825-d9e136845ec6",
      userId: "user-123",
    });
  });

  it("should return 500 when the service fails", async () => {
    structureUserResume.mockRejectedValue(
      new Error("Resume not found")
    );

    const response = await request(app)
      .post(
        "/api/resume/3801d267-e4ee-4c17-8bf7-844aef190f10/versions/57e55a14-5ba0-491b-8825-d9e136845ec6/structure"
      );

    expect(response.status).toBe(500);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Resume not found");
  });
});
