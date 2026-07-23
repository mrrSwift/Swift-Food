// src/routes/restaurant.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { protect, authorize } from '../middleware/auth';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators/restaurantValidator';
import { createCategorySchema } from '../validators/menuValidator';
import { createMenuItemSchema, updateMenuItemSchema } from '../validators/menuValidator';
import * as restaurantController from '../controllers/restaurantController';

const restaurant = new Hono();

// All routes require authentication and r_owner role
restaurant.use('*', protect, authorize('r_owner'));

// Restaurant Profile
restaurant.post('/', zValidator('json', createRestaurantSchema), restaurantController.createRestaurant);
restaurant.get('/', restaurantController.getMyRestaurant);
restaurant.put('/', zValidator('json', updateRestaurantSchema), restaurantController.updateMyRestaurant);
restaurant.get('/all', restaurantController.getMyRestaurants);
restaurant.get('/:restaurantId/overview', restaurantController.getRestaurantOverview);
// Categories
restaurant.post('/categories', zValidator('json', createCategorySchema), restaurantController.createCategory);
restaurant.get('/categories', restaurantController.getMyCategories);
restaurant.put('/categories/:id', zValidator('json', createCategorySchema.partial()), restaurantController.updateCategory);
restaurant.delete('/categories/:id', restaurantController.deleteCategory);

// Menu Items
restaurant.post('/menu-items', zValidator('json', createMenuItemSchema), restaurantController.createMenuItem);
restaurant.get('/menu-items', restaurantController.getMyMenuItems);
restaurant.put('/menu-items/:id', zValidator('json', updateMenuItemSchema), restaurantController.updateMenuItem);
restaurant.delete('/menu-items/:id', restaurantController.deleteMenuItem);
restaurant.put('/menu-items/:id/toggle-availability', restaurantController.toggleMenuItemAvailability);



export default restaurant;