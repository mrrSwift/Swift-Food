// src/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  icon: number;
  order: number;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  image: String,
  icon: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

categorySchema.index({ restaurant: 1, order: 1 });

export default mongoose.model<ICategory>('Category', categorySchema);