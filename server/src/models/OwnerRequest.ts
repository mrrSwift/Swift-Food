// apps/server/src/models/OwnerRequest.ts
import bcrypt from 'bcryptjs';
import mongoose, { Schema, Document } from 'mongoose';

export interface IOwnerRequest extends Document {
  name: string;
  email: string;
  password: string;        // bcrypt ed password
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
    password: { type: String, required: true },
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

ownerRequestSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

ownerRequestSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IOwnerRequest>('OwnerRequest', ownerRequestSchema);