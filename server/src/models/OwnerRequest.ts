// apps/server/src/models/OwnerRequest.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOwnerRequest extends Document {
  name: string;
  email: string;
  passwordHash: string;        // bcrypt hashed password
  description: string;
  phone: string;
  restaurantName: string;
  status: 'pending' | 'accepted' | 'declined';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ownerRequestSchema = new Schema<IOwnerRequest>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    description: { type: String, required: true },
    phone: { type: String, required: true },
    restaurantName: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    adminNotes: String,
  },
  { timestamps: true }
);

export default mongoose.model<IOwnerRequest>('OwnerRequest', ownerRequestSchema);