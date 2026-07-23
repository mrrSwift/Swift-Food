// src/models/MenuItem.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  restaurant: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
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

const menuItemSchema = new Schema<IMenuItem>({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  image: String,
  ingredients: [String],
  allergens: [String],
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra_hot']
  },
  preparationTime: Number,
  isAvailable: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

menuItemSchema.index({ restaurant: 1, category: 1, order: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ isAvailable: 1, price: 1 });

export default mongoose.model<IMenuItem>('MenuItem', menuItemSchema);