import { z } from "zod";

export const interviewQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(1),
      answerGuidance: z.string().min(1),
      category: z.string().min(1),
    })
  ).min(1),
});