import { z } from "zod";

export const resumeStructuringSchema = z.object({
  params: z.object({
    resumeId: z.uuid(),
    versionId: z.uuid(),
  }),
});