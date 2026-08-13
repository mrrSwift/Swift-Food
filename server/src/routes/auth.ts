// src/routes/auth.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { register, login, getMe, changePassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const auth = new Hono();

//auth.post('/register', zValidator('json', registerSchema), register);
auth.post('/login', zValidator('json', loginSchema), login);
auth.get('/me', protect, getMe);
auth.post('/change-password', protect, changePassword);

export default auth;