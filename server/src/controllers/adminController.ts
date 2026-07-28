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

export const createUser = async (c: Context) => {
  const { name, email, password, role } = await c.req.json();

  // Prevent creating another admin via this route if desired (optional)
  if (role === 'admin') {
    throw new AppError('Cannot create admin users through this endpoint', 403);
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  const user = await User.create({
    name,
    email,
    password,  // the User model has a pre-save hook to hash it
    role,
  });

  return c.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }, 201);
};

export const changeUserPassword = async (c: Context) => {
  const { id } = c.req.param();
  const { password } = await c.req.json();

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Update the password (the pre-save hook will hash it)
  user.password = password;
  await user.save();

  return c.json({
    success: true,
    message: 'Password updated successfully',
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