// src/models/Restaurant.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  owner: mongoose.Types.ObjectId;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  cuisine: string[];
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  isActive: boolean;
  rating: number;
  totalRatings: number;
}

const restaurantSchema = new Schema<IRestaurant>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  website: String,
  logo: String,
  coverImage: String,
  cuisine: [{
    type: String
  }],
  openingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String,
    close: String
  }],
  isActive: {
    type: Boolean,
    default: true
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

restaurantSchema.index({ owner: 1, name: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ isActive: 1 });

export default mongoose.model<IRestaurant>('Restaurant', restaurantSchema);