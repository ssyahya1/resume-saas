import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
    companyName: z.string().trim().max(200).optional(),
    description: z.string().trim().min(1),
    jobUrl: z.string().trim().url().optional(),
  }),
});

export const jobIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),

  body: z.object({
    title: z.string().trim().min(1).max(200),
    companyName: z.string().trim().max(200).optional(),
    description: z.string().trim().min(1),
    jobUrl: z.string().trim().url().optional(),
  }),
});

export const jobListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
});