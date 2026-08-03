// apps/server/src/validators/adminValidator.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'r_owner', 'customer']).default('r_owner'),
});