// src/controllers/adminController.ts
import { Context } from 'hono';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import Category from '../models/Category';
import MenuItem from '../models/MenuItem';
import { AppError } from '../middleware/errorHandler';

// User Management
export const getAllUsers = async (c: Context) => {
  const { role, page = '1', limit = '10' } = c.req.query();
  
  const query: any = {};
  if (role) query.role = role;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort('-createdAt'),
    User.countDocuments(query)
  ]);

  return c.json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
};

export const getUserById = async (c: Context) => {
  const { id } = c.req.param();
  
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return c.json({
    success: true,
    data: user
  });
};

export const updateUser = async (c: Context) => {
  const { id } = c.req.param();
  const updateData = await c.req.json();

  // Prevent password update through this route
  delete updateData.password;

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return c.json({
    success: true,
    data: user
  });
};

export const deleteUser = async (c: Context) => {
  const { id } = c.req.param();

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Delete associated restaurant if exists
  if (user.role === 'r_owner') {
    const restaurant = await Restaurant.findOne({ owner: id });
    if (restaurant) {
      // Delete all menu items and categories
      await MenuItem.deleteMany({ restaurant: restaurant._id });
      await Category.deleteMany({ restaurant: restaurant._id });
      await Restaurant.findByIdAndDelete(restaurant._id);
    }
  }

  await User.findByIdAndDelete(id);

  return c.json({
    success: true,
    message: 'User deleted successfully'
  });
};

// Restaurant Management (Admin)
export const getAllRestaurants = async (c: Context) => {
  const { isActive, page = '1', limit = '10' } = c.req.query();
  
  const query: any = {};
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query)
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limitNum)
      .sort('-createdAt'),
    Restaurant.countDocuments(query)
  ]);

  return c.json({
    success: true,
    data: {
      restaurants,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
};

export const updateRestaurantStatus = async (c: Context) => {
  const { id } = c.req.param();
  const { isActive } = await c.req.json();

  const restaurant = await Restaurant.findByIdAndUpdate(
    id,
    { isActive },
    { new: true }
  );

  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  return c.json({
    success: true,
    data: restaurant
  });
};

export const deleteRestaurant = async (c: Context) => {
  const { id } = c.req.param();

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new AppError('Restaurant not found', 404);
  }

  // Delete all related data
  await MenuItem.deleteMany({ restaurant: id });
  await Category.deleteMany({ restaurant: id });
  await Restaurant.findByIdAndDelete(id);

  return c.json({
    success: true,
    message: 'Restaurant and all related data deleted successfully'
  });
};