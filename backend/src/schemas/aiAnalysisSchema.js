import { z } from "zod";

export const aiAnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
  summary: z.string(),
});
