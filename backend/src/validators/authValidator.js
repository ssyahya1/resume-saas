import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
    fullname: z.string().trim().min(1).max(100).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
  }),
});