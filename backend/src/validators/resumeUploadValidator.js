import { z } from "zod";

export const resumeUploadSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200),
  }),
});