// src/validators/restaurantValidator.ts
import { z } from 'zod';

export const createRestaurantSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10),
  address: z.string().min(5),
  phone: z.string().min(10),
  email: z.string().email(),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  cuisine: z.array(z.string()).min(1),
  openingHours: z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    open: z.string(),
    close: z.string()
  }))
});

export const updateRestaurantSchema = createRestaurantSchema.partial();
