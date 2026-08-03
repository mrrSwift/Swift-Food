// src/controllers/customerController.ts
import { Context } from 'hono';
import Restaurant from '../models/Restaurant';
import Category from '../models/Category';
import MenuItem from '../models/MenuItem';
import { AppError } from '../middleware/errorHandler';

export const getAllRestaurants = async (c: Context) => {
  const { cuisine, search, page = '1', limit = '10' } = c.req.query();
  
  const query: any = { isActive: true };
  
  if (cuisine) {
    query.cuisine = { $in: cuisine.split(',') };
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [restaurants, total] = await Promise.all([
    Restaurant.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1, createdAt: -1 }),
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

export const getRestaurantById = async (c: Context) => {
  const { id } = c.req.param();

  const restaurant = await Restaurant.findOne({
    _id: id,
    isActive: true
  });

  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  return c.json({
    success: true,
    data: restaurant
  });
};

export const getRestaurantMenu = async (c: Context) => {
  const { id } = c.req.param();

  const restaurant = await Restaurant.findOne({
    _id: id,
    isActive: true
  });

  if (!restaurant) {
    throw new AppError(c.t('restaurant.notFound'), 404);
  }

  const categories = await Category.find({
    restaurant: id,
    isActive: true
  }).sort('order');

  const menuItems = await MenuItem.find({
    restaurant: id,
    isAvailable: true
  })
    .populate('category', 'name')
    .sort('order');

  // Group menu items by category
  const menuByCategory = categories.map(category => ({
    category: {
      id: category._id,
      name: category.name,
      description: category.description,
      icon: category.icon
    },
    items: menuItems.filter(
      item => item.category._id.toString() === category._id.toString()
    )
  }));

  return c.json({
    success: true,
    data: {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        description: restaurant.description
      },
      menu: menuByCategory
    }
  });
};

export const searchMenuItems = async (c: Context) => {
  const { q, restaurant, category, isVegetarian, isVegan, isGlutenFree } = c.req.query();
  
  const query: any = { isAvailable: true };
  
  if (q) {
    query.$text = { $search: q };
  }
  
  if (restaurant) {
    query.restaurant = restaurant;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (isVegetarian === 'true') query.isVegetarian = true;
  if (isVegan === 'true') query.isVegan = true;
  if (isGlutenFree === 'true') query.isGlutenFree = true;

  const menuItems = await MenuItem.find(query)
    .populate('restaurant', 'name')
    .populate('category', 'name')
    .sort({ rating: -1 });

  return c.json({
    success: true,
    data: menuItems
  });
};