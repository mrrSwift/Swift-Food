// src/validators/menuValidator.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  order: z.number().int().optional()
});

export const createMenuItemSchema = z.object({
  category: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  spiceLevel: z.enum(['mild', 'medium', 'hot', 'extra_hot']).optional(),
  preparationTime: z.number().int().min(0).optional(),
  order: z.number().int().optional()
});

export const updateMenuItemSchema = createMenuItemSchema.partial();