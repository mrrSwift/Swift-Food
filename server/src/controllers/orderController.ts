// apps/server/src/controllers/orderController.ts
import { Context } from 'hono';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import Restaurant from '../models/Restaurant';
import { AppError } from '../middleware/errorHandler';

// Public: Customer submits an order
export const createOrder = async (c: Context) => {
  const body = await c.req.json();
  const { restaurantId, items, customerName, tableNumber, notes } = body;

  if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('restaurantId and a non-empty items array are required', 400);
  }

  // Verify restaurant exists and is active
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive) {
    throw new AppError('Restaurant not found or inactive', 404);
  }

  // Build order items and calculate total
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const { menuItemId, quantity } = item;
    if (!menuItemId || !quantity || quantity < 1) {
      throw new AppError('Each item must have a valid menuItemId and quantity >= 1', 400);
    }

    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurant: restaurantId,
      isAvailable: true,
    });

    if (!menuItem) {
      throw new AppError(`Menu item ${menuItemId} not found or unavailable`, 404);
    }

    // Use the price from the request, or fallback to current menu price
    const price = item.price ?? menuItem.price;
    if (typeof price !== 'number' || price < 0) {
      throw new AppError('Invalid price for item', 400);
    }

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price,
      quantity,
      image: menuItem.image,
    });

    total += price * quantity;
  }

  const order = await Order.create({
    restaurant: restaurantId,
    items: orderItems,
    total: Math.round(total * 100) / 100, // ensure two decimals
    customerName: customerName?.trim() || undefined,
    tableNumber: tableNumber?.trim() || undefined,
    notes: notes?.trim() || undefined,
    status: 'pending',
  });

  return c.json({
    success: true,
    data: order,
  }, 201);
};

// Owner: Get all orders for their restaurant (with optional status filter)
export const getRestaurantOrders = async (c: Context) => {
  const user = c.get('user');
  const { restaurantId } = c.req.param();
  const { status, page = '1', limit = '20' } = c.req.query();

  // Verify the restaurant belongs to this owner
  const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: user._id });
  if (!restaurant) {
    throw new AppError('Restaurant not found or not owned by you', 404);
  }

  const filter: any = { restaurant: restaurantId };
  if (status && ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
    filter.status = status;
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  return c.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
};

// Owner: Get a single order detail
export const getOrderById = async (c: Context) => {
  const user = c.get('user');
  const { orderId } = c.req.param();

  const order = await Order.findById(orderId).populate('restaurant', 'name');
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check ownership
  const restaurant = await Restaurant.findOne({ _id: order.restaurant, owner: user._id });
  if (!restaurant) {
    throw new AppError('Not authorized to view this order', 403);
  }

  return c.json({
    success: true,
    data: order,
  });
};

// Owner: Update order status
export const updateOrderStatus = async (c: Context) => {
  const user = c.get('user');
  const { orderId } = c.req.param();
  const { status } = await c.req.json();

  const validStatuses = ['accepted', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify ownership
  const restaurant = await Restaurant.findOne({ _id: order.restaurant, owner: user._id });
  if (!restaurant) {
    throw new AppError('Not authorized to update this order', 403);
  }

  // Basic status flow validation (optional)
  const allowedTransitions: Record<string, string[]> = {
    pending: ['accepted', 'cancelled'],
    accepted: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed'],
  };

  if (allowedTransitions[order.status] && !allowedTransitions[order.status].includes(status)) {
    throw new AppError(`Cannot change status from ${order.status} to ${status}`, 400);
  }

  order.status = status;
  await order.save();

  return c.json({
    success: true,
    data: order,
  });
};