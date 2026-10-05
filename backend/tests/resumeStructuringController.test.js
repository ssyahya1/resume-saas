import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/services/resumeStructuringService.js", () => ({
  structureUserResume: vi.fn(),
}));

import { structureUserResume } from "../src/services/resumeStructuringService.js";
import { structureResume } from "../src/controllers/resumeStructuringController.js";

describe("Resume Structuring Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should structure the resume successfully", async () => {
    structureUserResume.mockResolvedValue({
      id: "version-123",
      resume_id: "resume-123",
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
          skills: ["JavaScript", "Node.js"],
          experience: [],
          projects: [],
          education: [],
          certifications: [],
        },
      },
    });

    const req = {
      params: {
        resumeId: "resume-123",
        versionId: "version-123",
      },
      user: {
        id: "user-123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    await structureResume(req, res, next);

    expect(structureUserResume).toHaveBeenCalledTimes(1);

    expect(structureUserResume).toHaveBeenCalledWith({
      resumeId: "resume-123",
      versionId: "version-123",
      userId: "user-123",
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Resume Structured Successfully",
      version: expect.any(Object),
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should pass service errors to next", async () => {
    const error = new Error("Resume not found");

    structureUserResume.mockRejectedValue(error);

    const req = {
      params: {
        resumeId: "resume-123",
        versionId: "version-123",
      },
      user: {
        id: "user-123",
      },
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const next = vi.fn();

    await structureResume(req, res, next);

    expect(next).toHaveBeenCalledWith(error);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});