// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import connectDB from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import restaurantRoutes from "./routes/restaurant";
import customerRoutes from "./routes/customer";
import adminRoutes from "./routes/admin";
import orderRoutes from "./routes/order";
import ownerRequestRoutes from "./routes/ownerRequest";
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import paymentRoutes from "./routes/payment";
import { languageMiddleware } from "./middleware/language";

// Connect to database
connectDB();

// ---------- Socket.IO setup ----------
const io = new Server({
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  },
});

const engine = new Engine();
io.bind(engine);

io.on("connection", (socket) => {
  // Owner joins a restaurant room

  socket.on("join-restaurant", ({ restaurantId }) => {
    socket.join(`restaurant-${restaurantId}`);
  });

  // Optional: leave room
  socket.on("leave-restaurant", ({ restaurantId }) => {
    socket.leave(`restaurant-${restaurantId}`);
  });
});

// Make io accessible to controllers
export { io };

// ---------- Hono app ----------

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({ allowHeaders: ["Content-Type", "Authorization"] }));
app.use("/uploads/*", serveStatic({ root: "./" }));
app.use("*", languageMiddleware);
app.onError(errorHandler);
// Routes
app.route("/api/auth", authRoutes);
app.route("/api/restaurant", restaurantRoutes);
app.route("/api/customer", customerRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/owner-requests", ownerRequestRoutes);
app.route("/api/payment", paymentRoutes);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: "Route not found",
    },
    404,
  );
});

// Start server
const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);
const { websocket } = engine.handler();
export default {
  port: Number(port) || 3000,
  idleTimeout: 30, // must be > engine pingInterval (default 25)

  fetch(req: Request, server: any) {
    const url = new URL(req.url);

    // Let Socket.IO handle its own path
    if (url.pathname.startsWith("/socket/")) {
      return engine.handleRequest(req, server);
    }

    // Otherwise, pass to Hono
    return app.fetch(req, server);
  },

  // WebSocket handler required by Bun
  websocket,
};
