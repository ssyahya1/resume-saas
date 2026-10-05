import { z } from "zod";

export const resumeTailoringSchema = z.object({
  body: z.object({
    resumeId: z.uuid(),
    versionId: z.uuid(),
    jobId: z.uuid(),
  }),

  headers: z.object({
    "idempotency-key": z.string().trim().min(1),
  }),
});