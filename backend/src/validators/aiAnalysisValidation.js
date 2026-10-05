import { z } from "zod";

export const createAIAnalysisSchema = z.object({
  body: z.object({
    applicationId: z.uuid(),
  }),

  headers: z.object({
    "idempotency-key": z.string().trim().min(1),
  }),
});