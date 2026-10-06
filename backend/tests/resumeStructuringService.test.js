import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/services/aiService.js", () => ({
  generateStructuredContentWithAI: vi.fn(),
}));

vi.mock("../src/repositories/resumeRepository.js", () => ({
  getResumeById: vi.fn(),
}));

vi.mock("../src/repositories/resumeVersionRepository.js", () => ({
  getResumeVersionById: vi.fn(),
  updateResumeVersionContent: vi.fn(),
}));

import { generateStructuredContentWithAI } from "../src/services/aiService.js";

import { getResumeById } from "../src/repositories/resumeRepository.js";

import {
  getResumeVersionById,
  updateResumeVersionContent,
} from "../src/repositories/resumeVersionRepository.js";

import { structureUserResume } from "../src/services/resumeStructuringService.js";

describe("Resume Structuring Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when resume does not belong to the user", async () => {
    getResumeById.mockResolvedValue(null);

    await expect(
      structureUserResume({
        resumeId: "resume-123",
        versionId: "version-123",
        userId: "user-123",
      }),
    ).rejects.toThrow("Resume not found");

    expect(generateStructuredContentWithAI).not.toHaveBeenCalled();
  });

  it("should reject when resume raw text is missing", async () => {
    getResumeById.mockResolvedValue({
      id: "resume-123",
      user_id: "user-123",
    });

    getResumeVersionById.mockResolvedValue({
      id: "version-123",
      resume_id: "resume-123",
      content: {},
    });

    await expect(
      structureUserResume({
        resumeId: "resume-123",
        versionId: "version-123",
        userId: "user-123",
      }),
    ).rejects.toThrow("Resume raw text is missing");

    expect(generateStructuredContentWithAI).not.toHaveBeenCalled();
  });

  it("should structure a valid resume", async () => {
    getResumeById.mockResolvedValue({
      id: "resume-123",
      user_id: "user-123",
    });

    getResumeVersionById.mockResolvedValue({
      id: "version-123",
      resume_id: "resume-123",
      content: {
        RawText: "John Doe\nSoftware Engineer",
      },
    });

    generateStructuredContentWithAI.mockResolvedValue({
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
    });

    updateResumeVersionContent.mockResolvedValue({
      id: "version-123",
      resume_id: "resume-123",
      content: {
        rawText: "John Doe\nSoftware Engineer",
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

    let result;

    try {
      result = await structureUserResume({
        resumeId: "resume-123",
        versionId: "version-123",
        userId: "user-123",
      });
    } catch (error) {
      console.log("SERVICE TEST ERROR:", error);
      throw error;
    }

    expect(generateStructuredContentWithAI).toHaveBeenCalledTimes(1);

    expect(updateResumeVersionContent).toHaveBeenCalledTimes(1);

    expect(result).toBeDefined();
  });
});