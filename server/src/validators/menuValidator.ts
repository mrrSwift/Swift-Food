// src/validators/menuValidator.ts
import { z } from 'zod';

export const createCategorySchema = z.object({

  description: z.string(),
  image: z.string(),
  icon: z.string().optional(),
  order: z.number().int().optional()
});

export const createMenuItemSchema = z.object({
  category: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  image: z.string().optional(),
  ingredients: z.string().min(2).max(100).optional(),
  allergens: z.string().min(2).max(100).optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  spiceLevel: z.enum(['mild', 'medium', 'hot', 'extra_hot']).optional(),
  preparationTime: z.number().int().min(0).optional(),
  order: z.number().int().optional()
});

export const updateMenuItemSchema = createMenuItemSchema.partial();
