
import { describe, it, expect } from "vitest";
import { tailoredResumeSchema } from "../src/schemas/tailoredResumeSchema.js";

describe("tailoredResumeSchema", () => {
  it("should accept a valid tailored resume", () => {
    const validResume = {
      personalInfo: {
        name: "Syed Muhammad Yahya",
        email: "syedyahya@example.com",
        phone: "+92 300 1234567",
        location: "Karachi, Pakistan",
        links: ["https://github.com/example"],
      },

      summary: "Full Stack Developer with experience in web applications.",

      skills: ["JavaScript", "Node.js", "Express.js", "React.js"],

      experience: [
        {
          company: "Example Company",
          position: "Software Engineer",
          startDate: "2025",
          endDate: "Present",
          description: [
            "Developed backend APIs using Node.js and Express.js.",
          ],
        },
      ],

      projects: [
        {
          name: "Resume SaaS",
          links: [],
          problemSolved: "Automated resume and job application workflows.",
          description: ["Built a resume analysis platform."],
          technologies: ["Node.js", "Express.js", "Supabase"],
        },
      ],

      education: [
        {
          institution: "Karachi University",
          degree: "BS Software Engineering",
          field: "Software Engineering",
          startDate: "",
          endDate: "2027",
        },
      ],

      certifications: [],
    };

    const result = tailoredResumeSchema.safeParse(validResume);

    expect(result.success).toBe(true);
  });

  it("should reject an invalid tailored resume", () => {
    const invalidResume = {
      personalInfo: {
        name: "Syed Muhammad Yahya",
        email: "syedyahya@example.com",
      },

      summary: "Developer",

      skills: "JavaScript",

      experience: [],

      projects: [],

      education: [],

      certifications: [],
    };

    const result = tailoredResumeSchema.safeParse(invalidResume);

    expect(result.success).toBe(false);
  });
});
