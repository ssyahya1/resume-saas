import { z } from "zod";

export const tailoredResumeSchema = z.object({
  personalInfo: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    links: z.array(z.string()),
  }),

  summary: z.string(),

  skills: z.array(z.string()),

  experience: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.array(z.string()),
    })
  ),

  projects: z.array(
    z.object({
      name: z.string(),
      links: z.array(z.string()),
      problemSolved: z.string(),
      description: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional(),
    })
  ),

  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  ),

  certifications: z.array(z.string()),
});