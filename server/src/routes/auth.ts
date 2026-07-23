// src/routes/auth.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const auth = new Hono();

auth.post('/register', zValidator('json', registerSchema), register);
auth.post('/login', zValidator('json', loginSchema), login);
auth.get('/me', protect, getMe);

export default auth;