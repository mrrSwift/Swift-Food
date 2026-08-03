// apps/server/src/controllers/ownerRequestController.ts
import { Context } from 'hono';
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
    throw new AppError(c.t('request.passwordShort'), 400);
  }

  // Check for existing pending request with same email
  const existing = await OwnerRequest.findOne({ email, status: 'pending' });
  if (existing) {
    throw new AppError(c.t('request.alreadyPending'), 400);
  }


  await OwnerRequest.create({
    name,
    email,
    password,
    description,
    phone,
    restaurantName,
  });

  return c.json({ success: true, message: c.t('request.submitted') }, 201);
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
  if (!request) throw new AppError(c.t('request.notFound'), 404);
  if (request.status !== 'pending') throw new AppError(c.t('request.alreadyProcessed'), 400);

  // Create user with the hashed password (bypass mongoose pre-save hook)
  const usersCollection = User.collection;
  const userResult = await usersCollection.insertOne({
    name: request.name,
    email: request.email,
    password: request.password, // already hashed
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

  return c.json({ success: true, message: c.t('request.accepted') });
};

// Admin: decline a request
export const declineRequest = async (c: Context) => {
  const { id } = c.req.param();
  const { adminNotes } = await c.req.json();

  const request = await OwnerRequest.findById(id);
  if (!request) throw new AppError(c.t('request.notFound'), 404);
  if (request.status !== 'pending') throw new AppError(c.t('request.alreadyProcessed'), 400);

  request.status = 'declined';
  request.adminNotes = adminNotes || '';
  await request.save();

  return c.json({ success: true, message: c.t('request.declined') });
};