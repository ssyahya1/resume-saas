import { z } from "zod";

export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
  }),
});

export const resumeIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const updateResumeSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),

  body: z.object({
    title: z.string().trim().min(1).max(200),
  }),
});

export const resumeListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});