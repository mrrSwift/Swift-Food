// src/validators/authValidator.ts
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(50),
  role: z.enum(['admin', 'r_owner', 'customer']).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;