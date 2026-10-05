import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.uuid(),
    resumeId: z.uuid(),
    status: z
      .enum(["saved", "applied", "interview", "rejected", "offer"])
      .optional(),
    appliedAt: z.string().datetime().optional(),
  }),
});

export const applicationIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const updateApplicationSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),

  body: z.object({
    status: z.enum([
      "saved",
      "applied",
      "interview",
      "rejected",
      "offer",
    ]),
    appliedAt: z.string().datetime().optional(),
  }),
});

export const applicationListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.string().trim().optional(),
  }),
});