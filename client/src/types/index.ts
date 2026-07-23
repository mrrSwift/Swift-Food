// src/types/index.ts
export interface Restaurant {
  _id: string;
  owner: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  cuisine: string[];
  openingHours: OpeningHour[];
  isActive: boolean;
  rating: number;
  totalRatings: number;
  brandColor?: string;
  accentColor?: string;
}

export interface OpeningHour {
  day: string;
  open: string;
  close: string;
}

export interface Category {
  _id: string;
  restaurant: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: string;
  restaurant: string;
  category: Category;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image?: string;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra_hot';
  preparationTime?: number;
  isAvailable: boolean;
  order: number;
  rating: number;
  totalRatings: number;
}

export interface NotebookItem {
  item: MenuItem;
  quantity: number;
  addedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'restaurant_owner' | 'customer';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}