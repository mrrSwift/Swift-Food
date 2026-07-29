// apps/server/src/controllers/ownerRequestController.ts
import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import OwnerRequest from '../models/OwnerRequest';
import User from '../models/User';
import Restaurant from '../models/Restaurant';
import { AppError } from '../middleware/errorHandler';

// Public: submit a request
export const submitRequest = async (c: Context) => {
  const { name, email, password, description, phone, restaurantName } = await c.req.json();

  // Validate required fields
  if (!name || !email || !password || !description || !phone || !restaurantName) {
    throw new AppError('All fields are required', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Check for existing pending request with same email
  const existing = await OwnerRequest.findOne({ email, status: 'pending' });
  if (existing) {
    throw new AppError('A request with this email is already pending', 400);
  }

  // Hash password for temporary storage
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  await OwnerRequest.create({
    name,
    email,
    passwordHash,
    description,
    phone,
    restaurantName,
  });

  return c.json({ success: true, message: 'Request submitted successfully' }, 201);
};

// Admin: list all requests (with optional status filter)
export const getRequests = async (c: Context) => {
  const { status } = c.req.query();
  const filter: any = {};
  if (status && ['pending', 'accepted', 'declined'].includes(status)) {
    filter.status = status;
  }

  const requests = await OwnerRequest.find(filter).sort({ createdAt: -1 });
  return c.json({ success: true, data: requests });
};

// Admin: accept a request
export const acceptRequest = async (c: Context) => {
  const { id } = c.req.param();
  const { adminNotes } = await c.req.json();

  const request = await OwnerRequest.findById(id);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request has already been processed', 400);

  // Create user with the hashed password (bypass mongoose pre-save hook)
  const usersCollection = User.collection;
  const userResult = await usersCollection.insertOne({
    name: request.name,
    email: request.email,
    password: request.passwordHash, // already hashed
    role: 'r_owner',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const userId = userResult.insertedId;

  // Create restaurant for the new owner
  await Restaurant.create({
    owner: userId,
    name: request.restaurantName,
    description: request.description,
    phone: request.phone,
    email: request.email,
    address: 'Not provided',   // can be updated later
    cuisine: [],
    openingHours: [],
    isActive: true,
  });

  // Update request status
  request.status = 'accepted';
  request.adminNotes = adminNotes || '';
  await request.save();

  return c.json({ success: true, message: 'Owner account created successfully' });
};

// Admin: decline a request
export const declineRequest = async (c: Context) => {
  const { id } = c.req.param();
  const { adminNotes } = await c.req.json();

  const request = await OwnerRequest.findById(id);
  if (!request) throw new AppError('Request not found', 404);
  if (request.status !== 'pending') throw new AppError('Request has already been processed', 400);

  request.status = 'declined';
  request.adminNotes = adminNotes || '';
  await request.save();

  return c.json({ success: true, message: 'Request declined' });
};