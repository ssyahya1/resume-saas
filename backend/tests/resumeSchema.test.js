import { describe, it, expect } from "vitest"
import { resumeSchema } from "../src/schemas/resumeSchema.js";

describe("Resume Schema", () => {
  it("should accept a valid resume", () => {
    const resume = {
      personalInfo: {
        name: "Syed Muhammad Yahya",
        email: "test@example.com",
        phone: "03001234567",
        location: "Karachi",
        links: ["https://github.com/example"],
      },

      summary: "Full Stack Developer",

      skills: ["JavaScript", "Node.js", "React"],

      experience: [
        {
          company: "ABC Software",
          position: "Software Engineer",
          startDate: "2025",
          endDate: "2026",
          description: ["Built backend APIs"],
        },
      ],

      projects: [
        {
          name: "AI Resume SaaS",
          links: ["https://github.com/example"],
          problemSolved: "Resume analysis",
          description: ["Analyzes resumes against jobs"],
          technologies: ["Node.js", "Supabase"],
        },
      ],

      education: [
        {
          institution: "Example University",
          degree: "BS Computer Science",
        },
      ],

      certifications: ["AWS Cloud Practitioner"],
    };

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(true);
  });

  it("should reject invalid skills", () => {
    const resume = {
      personalInfo: {
        name: "Test",
        email: "test@example.com",
        phone: "123",
        location: "Karachi",
        links: [],
      },

      summary: "Developer",

      skills: "JavaScript",

      experience: [],
      projects: [],
      education: [],
      certifications: [],
    };

    const result = resumeSchema.safeParse(resume);

    expect(result.success).toBe(false);
  });
});