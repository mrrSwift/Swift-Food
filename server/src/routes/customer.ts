// src/routes/customer.ts
import { Hono } from 'hono';
import * as customerController from '../controllers/customerController';

const customer = new Hono();

// Public routes - no authentication required
customer.get('/restaurants', customerController.getAllRestaurants);
customer.get('/restaurants/:id', customerController.getRestaurantById);
customer.get('/restaurants/:id/menu', customerController.getRestaurantMenu);
customer.get('/menu-items/search', customerController.searchMenuItems);

export default customer;