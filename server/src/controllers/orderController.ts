// apps/server/src/controllers/orderController.ts
import { Context } from "hono";
import Order from "../models/Order";
import MenuItem from "../models/MenuItem";
import Restaurant from "../models/Restaurant";
import { AppError } from "../middleware/errorHandler";
import { io } from "../index";

// Public: Customer submits an order
export const createOrder = async (c: Context) => {
  const body = await c.req.json();
  const {
    restaurantId,
    items,
    customerName,
    tableNumber,
    notes,
    phone,
    orderType = "dine_in",
    deliveryAddress,
  } = body;

  if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
    throw new AppError(c.t("order.invalidRequest"), 400);
  }

  // Verify restaurant exists and is active
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || !restaurant.isActive) {
    throw new AppError(c.t("order.itemUnavailable"), 404);
  }

  // Build order items and calculate total
  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const { menuItemId, quantity, price } = item;
    if (!menuItemId || !quantity || quantity < 1 || quantity > 30) {
      throw new AppError(c.t("order.invalidItem"), 400);
    }

    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurant: restaurantId,
      isAvailable: true,
    });

    if (!menuItem) {
      throw new AppError(c.t("order.itemUnavailable"), 404);
    }

    const finalPrice = price ?? menuItem.price;
    if (typeof finalPrice !== "number" || finalPrice < 0) {
      throw new AppError(c.t("order.invalidPrice"), 400);
    }

    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: finalPrice,
      quantity,
      image: menuItem.image,
    });

    total += finalPrice * quantity;
  }

  const order = await Order.create({
    restaurant: restaurantId,
    items: orderItems,
    total: Math.round(total * 100) / 100,
    customerName: customerName?.trim() || undefined,
    tableNumber: tableNumber?.trim() || undefined,
    notes: notes?.trim() || undefined,
    status: "pending",
    orderType,
    phone,
    deliveryAddress:
      orderType === "delivery" ? deliveryAddress?.trim() : undefined,
    paymentStatus: orderType === "delivery" ? "pending" : "paid", // dine‑in considered paid
    paymentGateway: orderType === "delivery" ? "none" : "none", // will be set on payment init
  });

  return c.json({ success: true, data: order }, 201);
};

// Owner: Get all orders for their restaurant (with optional status filter)
export const getRestaurantOrders = async (c: Context) => {
  const user = c.get("user");
  const { restaurantId } = c.req.param();
  const { status, page = "1", limit = "20" } = c.req.query();

  // Verify the restaurant belongs to this owner
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: user._id,
  });
  if (!restaurant) {
    throw new AppError(c.t("order.unauthorized"), 404);
  }

  const filter: any = { restaurant: restaurantId };
  if (
    status &&
    [
      "pending",
      "accepted",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ].includes(status)
  ) {
    filter.status = status;
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
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
  const user = c.get("user");
  const { orderId } = c.req.param();

  const order = await Order.findById(orderId).populate("restaurant", "name");
  if (!order) {
    throw new AppError(c.t("order.notFound"), 404);
  }

  // Check ownership
  const restaurant = await Restaurant.findOne({
    _id: order.restaurant,
    owner: user._id,
  });
  if (!restaurant) {
    throw new AppError(c.t("order.unauthorized"), 403);
  }

  return c.json({
    success: true,
    data: order,
  });
};

// Owner: Update order status
export const updateOrderStatus = async (c: Context) => {
  const user = c.get("user");
  const { orderId } = c.req.param();
  const { status } = await c.req.json();

  const validStatuses = [
    "accepted",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      `Status must be one of: ${validStatuses.join(", ")}`,
      400,
    );
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(c.t("order.notFound"), 404);
  }

  // Verify ownership
  const restaurant = await Restaurant.findOne({
    _id: order.restaurant,
    owner: user._id,
  });
  if (!restaurant) {
    throw new AppError(c.t("order.unauthorized"), 403);
  }

  // Basic status flow validation (optional)
  const allowedTransitions: Record<string, string[]> = {
    pending: ["accepted", "cancelled"],
    accepted: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["completed"],
  };

  if (
    allowedTransitions[order.status] &&
    !allowedTransitions[order.status].includes(status)
  ) {
    throw new AppError(
      c.t("order.statusTransition", { from: order.status, to: status }),
      400,
    );
  }

  order.status = status;
  await order.save();

  io.to(`restaurant-${order.restaurant}`).emit("orderStatusUpdate", {
    orderId: order._id,
    status: order.status,
  });

  return c.json({
    success: true,
    data: order,
  });
};
