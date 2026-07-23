import { describe, expect, it, beforeEach, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

const dbMocks = vi.hoisted(() => ({
  countCategoriesForRestaurant: vi.fn(),
  countMenuItemsForRestaurant: vi.fn(),
  countRestaurantsForOwner: vi.fn(),
  createCategory: vi.fn(),
  createMenuItem: vi.fn(),
  createRestaurantForOwner: vi.fn(),
  getCategoryForOwner: vi.fn(),
  getMenuItemForOwner: vi.fn(),
  getPublicMenuItem: vi.fn(),
  getPublicRestaurantBySlug: vi.fn(),
  getRestaurantBySlug: vi.fn(),
  getRestaurantForOwner: vi.fn(),
  getRestaurantOverview: vi.fn(),
  listCategoriesForRestaurant: vi.fn(),
  listMenuItemsForRestaurant: vi.fn(),
  listRestaurantsForOwner: vi.fn(),
  removeCategoryForOwner: vi.fn(),
  removeMenuItemForOwner: vi.fn(),
  reorderCategoriesForOwner: vi.fn(),
  updateCategoryForOwner: vi.fn(),
  updateMenuItemForOwner: vi.fn(),
  updateRestaurantForOwner: vi.fn(),
}));

vi.mock("../db", () => dbMocks);
vi.mock("../storage", () => ({ storagePut: vi.fn() }));

import { restaurantRouter } from "./restaurant";

const ownedRestaurant = {
  id: "restaurant-a",
  ownerId: 1,
  slug: "luma-table-abc123",
  name: "Luma Table",
  description: "A neighborhood table",
  bannerImageKey: null,
  bannerImageUrl: null,
  address: "14 Garden Lane",
  phone: "+1 555 018 2018",
  hours: "Tue–Sun",
  socialLinks: "{}",
  isPublished: false,
};

const ownedCategory = {
  category: { id: "category-a", restaurantId: "restaurant-a", name: "Mains", sortOrder: 0 },
  restaurant: ownedRestaurant,
};

const ownedItem = {
  menuItem: {
    id: "item-a",
    restaurantId: "restaurant-a",
    categoryId: "category-a",
    title: "Citrus market fish",
    description: "Seasonal fish",
    ingredients: "Fish, citrus",
    price: "26.00",
    rating: null,
    imageKey: null,
    imageUrl: null,
    isAvailable: true,
    sortOrder: 0,
  },
  restaurant: ownedRestaurant,
};

function ownerContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "owner-1",
      name: "Owner",
      email: "owner@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("owner restaurant procedures", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dbMocks.getRestaurantForOwner.mockResolvedValue(ownedRestaurant);
    dbMocks.getCategoryForOwner.mockResolvedValue(ownedCategory);
    dbMocks.getMenuItemForOwner.mockResolvedValue(ownedItem);
    dbMocks.countCategoriesForRestaurant.mockResolvedValue(0);
    dbMocks.countMenuItemsForRestaurant.mockResolvedValue(0);
    dbMocks.reorderCategoriesForOwner.mockResolvedValue(true);
  });

  it("creates a restaurant for the signed-in owner when below the two-restaurant limit", async () => {
    dbMocks.countRestaurantsForOwner.mockResolvedValue(0);
    dbMocks.getRestaurantBySlug.mockResolvedValue(undefined);
    dbMocks.createRestaurantForOwner.mockResolvedValue({ id: "new-restaurant" });

    const result = await restaurantRouter.createCaller(ownerContext()).owner.restaurants.create({
      name: "Luma Table",
      description: "Seasonal plates",
      isPublished: false,
    });

    expect(result).toEqual({ id: "new-restaurant" });
    expect(dbMocks.createRestaurantForOwner).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: 1, name: "Luma Table", description: "Seasonal plates", isPublished: false }),
    );
  });

  it("requires an authenticated Manus OAuth session for owner operations", async () => {
    const anonymousContext = { ...ownerContext(), user: null };

    await expect(
      restaurantRouter.createCaller(anonymousContext).owner.restaurants.list(),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects restaurant creation when the owner already has two restaurants", async () => {
    dbMocks.countRestaurantsForOwner.mockResolvedValue(2);

    await expect(
      restaurantRouter.createCaller(ownerContext()).owner.restaurants.create({ name: "Third Table" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps unowned restaurant data inaccessible to owner procedures", async () => {
    dbMocks.getRestaurantForOwner.mockResolvedValue(undefined);

    await expect(
      restaurantRouter.createCaller(ownerContext()).owner.categories.list({ restaurantId: "another-owner-restaurant" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("performs category creation, editing, reordering, and deletion only through owned data", async () => {
    const caller = restaurantRouter.createCaller(ownerContext());
    dbMocks.createCategory.mockResolvedValue({ id: "category-b", restaurantId: "restaurant-a", name: "Small plates" });
    dbMocks.updateCategoryForOwner.mockResolvedValue({ success: true });
    dbMocks.removeCategoryForOwner.mockResolvedValue({ success: true });

    await caller.owner.categories.create({ restaurantId: "restaurant-a", data: { name: "Small plates" } });
    await caller.owner.categories.update({ categoryId: "category-a", data: { name: "Plates" } });
    await caller.owner.categories.reorder({ restaurantId: "restaurant-a", categoryIds: ["category-a"] });
    await caller.owner.categories.remove({ categoryId: "category-a" });

    expect(dbMocks.createCategory).toHaveBeenCalledWith(expect.objectContaining({ restaurantId: "restaurant-a", sortOrder: 0 }));
    expect(dbMocks.updateCategoryForOwner).toHaveBeenCalledWith("category-a", 1, { name: "Plates" });
    expect(dbMocks.reorderCategoriesForOwner).toHaveBeenCalledWith("restaurant-a", 1, ["category-a"]);
    expect(dbMocks.removeCategoryForOwner).toHaveBeenCalledWith("category-a", 1);
  });

  it("performs menu item creation, update, and removal against the owner’s restaurant", async () => {
    const caller = restaurantRouter.createCaller(ownerContext());
    dbMocks.createMenuItem.mockResolvedValue({ id: "item-b" });
    dbMocks.updateMenuItemForOwner.mockResolvedValue({ id: "item-a" });
    dbMocks.removeMenuItemForOwner.mockResolvedValue({ success: true });

    await caller.owner.menuItems.create({
      restaurantId: "restaurant-a",
      data: { categoryId: "category-a", title: "Garden saffron rice", price: 31, ingredients: "Rice, saffron" },
    });
    await caller.owner.menuItems.update({ menuItemId: "item-a", data: { price: 28, isAvailable: false } });
    await caller.owner.menuItems.remove({ menuItemId: "item-a" });

    expect(dbMocks.createMenuItem).toHaveBeenCalledWith(
      expect.objectContaining({ restaurantId: "restaurant-a", categoryId: "category-a", title: "Garden saffron rice", price: "31.00" }),
    );
    expect(dbMocks.updateMenuItemForOwner).toHaveBeenCalledWith("item-a", 1, { price: "28.00", isAvailable: false });
    expect(dbMocks.removeMenuItemForOwner).toHaveBeenCalledWith("item-a", 1);
  });

  it("rejects a menu item category that belongs to another restaurant", async () => {
    dbMocks.getCategoryForOwner.mockResolvedValue({ ...ownedCategory, category: { ...ownedCategory.category, restaurantId: "restaurant-b" } });

    await expect(
      restaurantRouter.createCaller(ownerContext()).owner.menuItems.create({
        restaurantId: "restaurant-a",
        data: { categoryId: "category-a", title: "Incorrect category", price: 12 },
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns the published public menu payload without requiring owner authentication", async () => {
    const publicMenu = { restaurant: { ...ownedRestaurant, isPublished: true }, categories: [], menuItems: [] };
    dbMocks.getPublicRestaurantBySlug.mockResolvedValue(publicMenu);

    const result = await restaurantRouter.createCaller(ownerContext()).public.getBySlug({ slug: "luma-table-abc123" });

    expect(result).toEqual(publicMenu);
    expect(dbMocks.getPublicRestaurantBySlug).toHaveBeenCalledWith("luma-table-abc123");
  });
});
