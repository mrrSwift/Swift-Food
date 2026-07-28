// apps/server/src/routes/order.ts
import { Hono } from 'hono';
import { protect, authorize } from '../middleware/auth';
import * as orderController from '../controllers/orderController';

const order = new Hono();

// Public route: customer creates an order
order.post('/', orderController.createOrder);

// Protected owner routes
order.get('/restaurant/:restaurantId', protect, authorize('r_owner'), orderController.getRestaurantOrders);
order.get('/:orderId', protect, authorize('r_owner'), orderController.getOrderById);
order.patch('/:orderId/status', protect, authorize('r_owner'), orderController.updateOrderStatus);

export default order;