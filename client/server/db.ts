import { and, asc, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  categories,
  InsertCategory,
  InsertMenuItem,
  InsertRestaurant,
  InsertUser,
  menuItems,
  restaurants,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");
  return db;
}

export async function countRestaurantsForOwner(ownerId: number) {
  const db = await requireDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(restaurants).where(eq(restaurants.ownerId, ownerId));
  return Number(rows[0]?.count ?? 0);
}

export async function getRestaurantBySlug(slug: string) {
  const db = await requireDb();
  const rows = await db.select().from(restaurants).where(eq(restaurants.slug, slug)).limit(1);
  return rows[0];
}

export async function listRestaurantsForOwner(ownerId: number) {
  const db = await requireDb();
  return db.select().from(restaurants).where(eq(restaurants.ownerId, ownerId)).orderBy(desc(restaurants.updatedAt));
}

export async function getRestaurantForOwner(restaurantId: string, ownerId: number) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, ownerId)))
    .limit(1);
  return rows[0];
}

export async function createRestaurantForOwner(values: InsertRestaurant) {
  const db = await requireDb();
  await db.insert(restaurants).values(values);
  return getRestaurantForOwner(values.id, values.ownerId);
}

export async function updateRestaurantForOwner(
  restaurantId: string,
  ownerId: number,
  values: Partial<
    Pick<
      InsertRestaurant,
      | "name"
      | "description"
      | "bannerImageKey"
      | "bannerImageUrl"
      | "address"
      | "phone"
      | "hours"
      | "socialLinks"
      | "isPublished"
    >
  >,
) {
  const db = await requireDb();
  await db.update(restaurants).set(values).where(and(eq(restaurants.id, restaurantId), eq(restaurants.ownerId, ownerId)));
  return getRestaurantForOwner(restaurantId, ownerId);
}

export async function listCategoriesForRestaurant(restaurantId: string) {
  const db = await requireDb();
  return db.select().from(categories).where(eq(categories.restaurantId, restaurantId)).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function countCategoriesForRestaurant(restaurantId: string) {
  const db = await requireDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(categories).where(eq(categories.restaurantId, restaurantId));
  return Number(rows[0]?.count ?? 0);
}

export async function getCategoryForOwner(categoryId: string, ownerId: number) {
  const db = await requireDb();
  const rows = await db
    .select({ category: categories, restaurant: restaurants })
    .from(categories)
    .innerJoin(restaurants, eq(categories.restaurantId, restaurants.id))
    .where(and(eq(categories.id, categoryId), eq(restaurants.ownerId, ownerId)))
    .limit(1);
  return rows[0];
}

export async function createCategory(values: InsertCategory) {
  const db = await requireDb();
  await db.insert(categories).values(values);
  const rows = await db.select().from(categories).where(eq(categories.id, values.id)).limit(1);
  return rows[0];
}

export async function updateCategoryForOwner(categoryId: string, ownerId: number, values: Partial<Pick<InsertCategory, "name" | "sortOrder">>) {
  const owned = await getCategoryForOwner(categoryId, ownerId);
  if (!owned) return undefined;
  const db = await requireDb();
  await db.update(categories).set(values).where(eq(categories.id, categoryId));
  const rows = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
  return rows[0];
}

export async function removeCategoryForOwner(categoryId: string, ownerId: number) {
  const owned = await getCategoryForOwner(categoryId, ownerId);
  if (!owned) return { success: false };
  const db = await requireDb();
  await db.delete(categories).where(eq(categories.id, categoryId));
  return { success: true };
}

export async function reorderCategoriesForOwner(restaurantId: string, ownerId: number, categoryIds: string[]) {
  const restaurant = await getRestaurantForOwner(restaurantId, ownerId);
  if (!restaurant) return false;
  const existing = await listCategoriesForRestaurant(restaurantId);
  const existingIds = new Set(existing.map(category => category.id));
  if (existing.length !== categoryIds.length || categoryIds.some(id => !existingIds.has(id)) || new Set(categoryIds).size !== categoryIds.length) {
    return false;
  }
  const db = await requireDb();
  await Promise.all(categoryIds.map((id, sortOrder) => db.update(categories).set({ sortOrder }).where(eq(categories.id, id))));
  return true;
}

export async function listMenuItemsForRestaurant(restaurantId: string) {
  const db = await requireDb();
  return db.select().from(menuItems).where(eq(menuItems.restaurantId, restaurantId)).orderBy(asc(menuItems.sortOrder), asc(menuItems.title));
}

export async function countMenuItemsForRestaurant(restaurantId: string) {
  const db = await requireDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(menuItems).where(eq(menuItems.restaurantId, restaurantId));
  return Number(rows[0]?.count ?? 0);
}

export async function getMenuItemForOwner(menuItemId: string, ownerId: number) {
  const db = await requireDb();
  const rows = await db
    .select({ menuItem: menuItems, restaurant: restaurants })
    .from(menuItems)
    .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
    .where(and(eq(menuItems.id, menuItemId), eq(restaurants.ownerId, ownerId)))
    .limit(1);
  return rows[0];
}

export async function createMenuItem(values: InsertMenuItem) {
  const db = await requireDb();
  await db.insert(menuItems).values(values);
  const rows = await db.select().from(menuItems).where(eq(menuItems.id, values.id)).limit(1);
  return rows[0];
}

export async function updateMenuItemForOwner(
  menuItemId: string,
  ownerId: number,
  values: Partial<
    Pick<
      InsertMenuItem,
      | "categoryId"
      | "title"
      | "description"
      | "ingredients"
      | "price"
      | "rating"
      | "imageKey"
      | "imageUrl"
      | "isAvailable"
    >
  >,
) {
  const owned = await getMenuItemForOwner(menuItemId, ownerId);
  if (!owned) return undefined;
  const db = await requireDb();
  await db.update(menuItems).set(values).where(eq(menuItems.id, menuItemId));
  const rows = await db.select().from(menuItems).where(eq(menuItems.id, menuItemId)).limit(1);
  return rows[0];
}

export async function removeMenuItemForOwner(menuItemId: string, ownerId: number) {
  const owned = await getMenuItemForOwner(menuItemId, ownerId);
  if (!owned) return { success: false };
  const db = await requireDb();
  await db.delete(menuItems).where(eq(menuItems.id, menuItemId));
  return { success: true };
}

export async function getPublicRestaurantBySlug(slug: string) {
  const db = await requireDb();
  const restaurantRows = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.isPublished, true)))
    .limit(1);
  const restaurant = restaurantRows[0];
  if (!restaurant) return undefined;
  const [categoryRows, itemRows] = await Promise.all([
    listCategoriesForRestaurant(restaurant.id),
    db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.restaurantId, restaurant.id), eq(menuItems.isAvailable, true)))
      .orderBy(asc(menuItems.sortOrder), asc(menuItems.title)),
  ]);
  return { restaurant, categories: categoryRows, menuItems: itemRows };
}

export async function getPublicMenuItem(restaurantSlug: string, menuItemId: string) {
  const db = await requireDb();
  const rows = await db
    .select({ menuItem: menuItems, restaurant: restaurants, category: categories })
    .from(menuItems)
    .innerJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .where(
      and(
        eq(restaurants.slug, restaurantSlug),
        eq(restaurants.isPublished, true),
        eq(menuItems.id, menuItemId),
        eq(menuItems.isAvailable, true),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function getRestaurantOverview(restaurantId: string) {
  const db = await requireDb();
  const [items, categoriesCount, availableItems] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(menuItems).where(eq(menuItems.restaurantId, restaurantId)),
    db.select({ count: sql<number>`count(*)` }).from(categories).where(eq(categories.restaurantId, restaurantId)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(menuItems)
      .where(and(eq(menuItems.restaurantId, restaurantId), eq(menuItems.isAvailable, true))),
  ]);
  return {
    itemCount: Number(items[0]?.count ?? 0),
    categoryCount: Number(categoriesCount[0]?.count ?? 0),
    availableItemCount: Number(availableItems[0]?.count ?? 0),
  };
}
