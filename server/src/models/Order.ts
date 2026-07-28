// apps/server/src/models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;  // reference to original MenuItem
  name: string;
  price: number;                     // snapshot price at order time
  quantity: number;
  image?: string;
}

export interface IOrder extends Document {
  restaurant: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  customerName?: string;
  tableNumber?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  menuItem: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Order must have at least one item'],
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  customerName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  tableNumber: {
    type: String,
    trim: true,
    maxlength: 20,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: true,
});

orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);