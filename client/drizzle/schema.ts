import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const restaurants = mysqlTable(
  "restaurants",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    ownerId: int("ownerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description").notNull(),
    bannerImageKey: varchar("bannerImageKey", { length: 512 }),
    bannerImageUrl: varchar("bannerImageUrl", { length: 1024 }),
    address: text("address").notNull(),
    phone: varchar("phone", { length: 64 }).notNull(),
    hours: text("hours").notNull(),
    socialLinks: text("socialLinks").notNull(),
    isPublished: boolean("isPublished").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("restaurants_slug_unique").on(table.slug),
    index("restaurants_owner_idx").on(table.ownerId),
  ],
);

export const categories = mysqlTable(
  "categories",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    restaurantId: varchar("restaurantId", { length: 32 })
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("categories_restaurant_order_idx").on(table.restaurantId, table.sortOrder)],
);

export const menuItems = mysqlTable(
  "menuItems",
  {
    id: varchar("id", { length: 32 }).primaryKey(),
    restaurantId: varchar("restaurantId", { length: 32 })
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    categoryId: varchar("categoryId", { length: 32 }).references(() => categories.id, { onDelete: "set null" }),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description").notNull(),
    ingredients: text("ingredients").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    imageKey: varchar("imageKey", { length: 512 }),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    isAvailable: boolean("isAvailable").notNull().default(true),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("menu_items_restaurant_order_idx").on(table.restaurantId, table.sortOrder),
    index("menu_items_category_idx").on(table.categoryId),
  ],
);

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = typeof restaurants.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;
