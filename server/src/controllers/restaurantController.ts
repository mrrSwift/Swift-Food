// src/controllers/restaurantController.ts
import { Context } from "hono";
import Restaurant from "../models/Restaurant";
import Category from "../models/Category";
import MenuItem from "../models/MenuItem";
import { AppError } from "../middleware/errorHandler";
import Order from "../models/Order";

// Restaurant Management
export const createRestaurant = async (c: Context) => {
  const user = c.get("user");
  const restaurantData = await c.req.json();

  const restaurantCount = await Restaurant.countDocuments({ owner: user._id });
  if (restaurantCount >= 2) {
    throw new AppError(c.t('restaurant.maxReached'), 400);
  }

  const restaurant = await Restaurant.create({
    ...restaurantData,
    owner: user._id,
  });

  return c.json(
    {
      success: true,
      data: restaurant,
    },
    201,
  );
};

export const getMyRestaurant = async (c: Context) => {
  const user = c.get("user");
  const restaurantId = c.req.query("restaurantId");

  const restaurant = await Restaurant.findOne({ owner: user._id, id: restaurantId });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  return c.json({
    success: true,
    data: restaurant,
  });
};

export const updateMyRestaurant = async (c: Context) => {
  const user = c.get("user");
  const updateData =  c.req.json();
  const restaurantId = c.req.query("restaurantId");

 console.log(restaurantId);

  const restaurant = await Restaurant.findOneAndUpdate(
    { owner: user._id, id: restaurantId },
    updateData,
    { new: true, runValidators: true },
  );

  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  return c.json({
    success: true,
    data: restaurant,
  });
};

// Category Management
export const createCategory = async (c: Context) => {
  const user = c.get("user");
  const categoryData = await c.req.json();
  console.log(categoryData);

  const restaurantId = c.req.query("restaurantId");
  const restaurant = await Restaurant.findOne({
    owner: user._id,
    ...(restaurantId ? { _id: restaurantId } : {}),
  });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  const category = await Category.create({
    ...categoryData,
    restaurant: restaurant._id,
  });

  return c.json(
    {
      success: true,
      data: category,
    },
    201,
  );
};

export const getMyCategories = async (c: Context) => {
  const user = c.get("user");

  const restaurantId = c.req.query("restaurantId");
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner != user.id) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  const categories = await Category.find({ restaurant: restaurantId }).sort(
    "order",
  );

  return c.json({
    success: true,
    data: categories,
  });
};

export const updateCategory = async (c: Context) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const updateData = await c.req.json();

  const restaurantId = c.req.query("restaurantId");
  const restaurant = await Restaurant.findOne({
    owner: user._id,
    ...(restaurantId ? { _id: restaurantId } : {}),
  });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  const category = await Category.findOneAndUpdate(
    { _id: id, restaurant: restaurant._id },
    updateData,
    { new: true, runValidators: true },
  );

  if (!category) {
    throw new AppError(c.t('restaurant.categoryNotFound'), 404);
  }

  return c.json({
    success: true,
    data: category,
  });
};

export const deleteCategory = async (c: Context) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const restaurantId = c.req.query("restaurantId");
  const restaurant = await Restaurant.findOne({
    owner: user._id,
    ...(restaurantId ? { _id: restaurantId } : {}),
  });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  // Check if category has menu items
  const menuItemsCount = await MenuItem.countDocuments({ category: id });
  if (menuItemsCount > 0) {
    throw new AppError(c.t('restaurant.categoryDeleteForbidden'), 400);
  }

  const category = await Category.findOneAndDelete({
    _id: id,
    restaurant: restaurant._id,
  });

  if (!category) {
    throw new AppError(c.t('restaurant.categoryNotFound'), 404);
  }

  return c.json({
    success: true,
    message: c.t('success.categoryDeleted'),
  });
};

// Menu Item Management
export const createMenuItem = async (c: Context) => {
  const user = c.get("user");
  const menuData = await c.req.json();

  const restaurantId = c.req.query("restaurantId");
  const restaurant = await Restaurant.findOne({
    owner: user._id,
    ...(restaurantId ? { _id: restaurantId } : {}),
  });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  // Verify category belongs to restaurant
  const category = await Category.findOne({
    _id: menuData.category,
    restaurant: restaurant._id,
  });

  if (!category) {
    throw new AppError(c.t('restaurant.categoryNotFound'), 404);
  }

  const menuItem = await MenuItem.create({
    ...menuData,
    restaurant: restaurant._id,
  });

  return c.json(
    {
      success: true,
      data: menuItem,
    },
    201,
  );
};

export const getMenuItemById = async (c: Context) => {
  const { id } = c.req.param();

  const menuItem = await MenuItem.findById(id)
    .populate("restaurant", "name address phone")
    .populate("category", "name");

  if (!menuItem || !menuItem.isAvailable) {
    throw new AppError(c.t('restaurant.menuItemNotFound'), 404);
  }

  return c.json({
    success: true,
    data: menuItem,
  });
};

export const getMyMenuItems = async (c: Context) => {
  const user = c.get("user");
  const { categoryId, restaurantId } = c.req.query();

  const restaurant = await Restaurant.findOne({
    owner: user._id,
    ...(restaurantId ? { _id: restaurantId } : {}),
  });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  const query: any = { restaurant: restaurant._id };
  if (categoryId) {
    query.category = categoryId;
  }

  const menuItems = await MenuItem.find(query)
    .populate("category", "name")
    .sort("order");

  return c.json({
    success: true,
    data: menuItems,
  });
};

export const updateMenuItem = async (c: Context) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const updateData = await c.req.json();

  const restaurantId = c.req.query("restaurantId");
  const restaurant = await Restaurant.findOne({
    owner: user._id,
    ...(restaurantId ? { _id: restaurantId } : {}),
  });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  const menuItem = await MenuItem.findOneAndUpdate(
    { _id: id, restaurant: restaurant._id },
    updateData,
    { new: true, runValidators: true },
  );

  if (!menuItem) {
    throw new AppError(c.t('restaurant.menuItemNotFound'), 404);
  }

  return c.json({
    success: true,
    data: menuItem,
  });
};

export const deleteMenuItem = async (c: Context) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const restaurantId = c.req.query("restaurantId");
  const restaurant = await Restaurant.findOne({
    owner: user._id,
    ...(restaurantId ? { _id: restaurantId } : {}),
  });
  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  const menuItem = await MenuItem.findOneAndDelete({
    _id: id,
    restaurant: restaurant._id,
  });

  if (!menuItem) {
    throw new AppError(c.t('restaurant.menuItemNotFound'), 404);
  }

  return c.json({
    success: true,
    message: c.t('success.menuItemDeleted'),
  });
};

// Owner's Restaurant List
export const getMyRestaurants = async (c: Context) => {
  const user = c.get("user");

  const restaurants = await Restaurant.find({ owner: user._id }).select(
    "name logo cuisine isActive rating",
  );

  return c.json({
    success: true,
    data: {
      restaurants,
      maxRestaurants: 2,
      remaining: 2 - restaurants.length,
    },
  });
};

export const getRestaurantOverview = async (c: Context) => {
  const user = c.get("user");
  const { restaurantId } = c.req.param();

  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: user._id,
  });

  if (!restaurant) {
    throw new AppError(c.t('restaurant.notOwned'), 404);
  }

  const [
    categoriesCount,
    menuItemsCount,
    availableItemsCount,
    ordersCount, // 🆕 total orders
    pendingOrdersCount, // 🆕 pending orders
  ] = await Promise.all([
    Category.countDocuments({ restaurant: restaurantId }),
    MenuItem.countDocuments({ restaurant: restaurantId }),
    MenuItem.countDocuments({ restaurant: restaurantId, isAvailable: true }),
    Order.countDocuments({ restaurant: restaurantId }),
    Order.countDocuments({ restaurant: restaurantId, status: "pending" }),
  ]);

  return c.json({
    success: true,
    data: {
      categories: categoriesCount,
      totalItems: menuItemsCount,
      availableItems: availableItemsCount,
      unavailableItems: menuItemsCount - availableItemsCount,
      rating: restaurant.rating,
      totalRatings: restaurant.totalRatings,
      totalOrders: ordersCount, // 🆕
      pendingOrders: pendingOrdersCount, // 🆕
    },
  });
};

export const toggleMenuItemAvailability = async (c: Context) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const menuItem = await MenuItem.findById(id);
  if (!menuItem) {
    throw new AppError(c.t('restaurant.menuItemNotFound'), 404);
  }

  const restaurant = await Restaurant.findOne({
    _id: menuItem.restaurant,
    owner: user._id,
  });

  if (!restaurant) {
    throw new AppError("Not authorized", 403);
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  return c.json({
    success: true,
    data: menuItem,
  });
};

export const getRestaurantById = async (c: Context) => {
  const user = c.get("user");
  const { restaurantId } = c.req.param();
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner != user.id)
    throw new AppError(c.t('restaurant.notFound'), 404);
  return c.json({ success: true, data: restaurant });
};

export const updateRestaurantById = async (c: Context) => {
  const user = c.get("user");
  const { restaurantId } = c.req.param();
  const updateData = await c.req.json()
  
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: restaurantId, owner: user._id },
    updateData,
    { new: true, runValidators: true },
  );
  if (!restaurant) throw new AppError(c.t('restaurant.notFound'), 404);
  return c.json({ success: true, data: restaurant });
};
