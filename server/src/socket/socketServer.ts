// apps/server/src/socket/socketServer.ts
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import { Hono } from "hono";
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../middleware/auth';


// Initialize Socket.IO with the HTTP server (Bun.serve or http.createServer)
export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const userRole = (socket as any).userRole;
    console.log(`User connected: ${userId} (${userRole})`);

    // Owner joins a room specific to their restaurant (if they have one)
    socket.on('join-restaurant', (restaurantId: string) => {
      if (userRole === 'restaurant_owner') {
        socket.join(`restaurant:${restaurantId}`);
        console.log(`Owner ${userId} joined room restaurant:${restaurantId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}

// Helper to emit new order to a restaurant room
export function notifyNewOrder(restaurantId: string, order: any) {
  if (io) {
    io.to(`restaurant:${restaurantId}`).emit('new-order', order);
  }
}