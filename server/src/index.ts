// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/bun';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import restaurantRoutes from './routes/restaurant';
import customerRoutes from './routes/customer';
import adminRoutes from './routes/admin';
import orderRoutes from './routes/order';

// Connect to database
connectDB();

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({allowHeaders:["Content-Type","Authorization"]}));
app.use('/uploads/*', serveStatic({ root: './' }));
app.onError(errorHandler);

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/restaurant', restaurantRoutes);
app.route('/api/customer', customerRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/orders', orderRoutes);
// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Route not found'
  }, 404);
});

// Start server
const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch
};
