// src/routes/admin.ts
import { Hono } from 'hono';
import { protect, authorize } from '../middleware/auth';
import * as adminController from '../controllers/adminController';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from '../validators/adminValidator';

const admin = new Hono();

// All routes require authentication and admin role
admin.use('*', protect, authorize('admin'));

// User Management
admin.get('/users', adminController.getAllUsers);
admin.get('/users/:id', adminController.getUserById);
admin.put('/users/:id', adminController.updateUser);
admin.delete('/users/:id', adminController.deleteUser);

// 🆕 Create new user (owner or customer)
admin.post('/users', zValidator('json', createUserSchema), adminController.createUser);
admin.patch('/users/:id/password', adminController.changeUserPassword);

// Restaurant Management
admin.get('/restaurants', adminController.getAllRestaurants);
admin.put('/restaurants/:id/status', adminController.updateRestaurantStatus);
admin.delete('/restaurants/:id', adminController.deleteRestaurant);

export default admin;