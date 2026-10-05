import { z } from "zod";

export const interviewQuestionSchema = z.object({
  body: z.object({
    applicationId: z.uuid(),
    resumeId: z.uuid(),
  }),

  headers: z.object({
    "idempotency-key": z.string().trim().min(1),
  }),
});