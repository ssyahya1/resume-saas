import {z} from "zod";

export const coverLetterSchema = z.object({
    content: z.string().min(1),
 });