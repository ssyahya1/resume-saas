import { z } from "zod";

export const createResumeVersionSchema = z.object({
  params: z.object({
    resumeId: z.uuid(),
  }),

  body: z.object({
    content: z.record(z.string(), z.unknown()),
  }),
});

export const resumeVersionParamsSchema = z.object({
  params: z.object({
    resumeId: z.uuid(),
    versionId: z.uuid(),
  }),
});

export const versionListQuerySchema = z.object({
  params: z.object({
    resumeId: z.uuid(),
  }),

  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});