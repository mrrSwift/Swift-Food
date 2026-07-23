import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  countCategoriesForRestaurant,
  countMenuItemsForRestaurant,
  countRestaurantsForOwner,
  createCategory,
  createMenuItem,
  createRestaurantForOwner,
  getCategoryForOwner,
  getMenuItemForOwner,
  getPublicMenuItem,
  getPublicRestaurantBySlug,
  getRestaurantBySlug,
  getRestaurantForOwner,
  getRestaurantOverview,
  listCategoriesForRestaurant,
  listMenuItemsForRestaurant,
  listRestaurantsForOwner,
  removeCategoryForOwner,
  removeMenuItemForOwner,
  reorderCategoriesForOwner,
  updateCategoryForOwner,
  updateMenuItemForOwner,
  updateRestaurantForOwner,
} from "../db";
import { storagePut } from "../storage";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const MAX_RESTAURANTS_PER_OWNER = 2;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const imageContentTypes = ["image/jpeg", "image/png", "image/webp"] as const;

const restaurantFieldsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1200).optional().default(""),
  bannerImageKey: z.string().max(512).nullable().optional(),
  bannerImageUrl: z.string().max(1024).nullable().optional(),
  address: z.string().trim().max(500).optional().default(""),
  phone: z.string().trim().max(64).optional().default(""),
  hours: z.string().trim().max(600).optional().default(""),
  socialLinks: z
    .object({
      instagram: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
    })
    .optional()
    .default({}),
  isPublished: z.boolean().optional().default(false),
});

const restaurantUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(1200).optional(),
  bannerImageKey: z.string().max(512).nullable().optional(),
  bannerImageUrl: z.string().max(1024).nullable().optional(),
  address: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(64).optional(),
  hours: z.string().trim().max(600).optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional().or(z.literal("")),
      facebook: z.string().url().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  isPublished: z.boolean().optional(),
});

const categoryFieldsSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

const menuItemFieldsSchema = z.object({
  categoryId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1400).optional().default(""),
  ingredients: z.string().trim().max(1400).optional().default(""),
  price: z.number().finite().nonnegative().max(99999.99),
  rating: z.number().finite().min(0).max(5).nullable().optional(),
  imageKey: z.string().max(512).nullable().optional(),
  imageUrl: z.string().max(1024).nullable().optional(),
  isAvailable: z.boolean().optional().default(true),
});

const menuItemUpdateSchema = z.object({
  categoryId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1400).optional(),
  ingredients: z.string().trim().max(1400).optional(),
  price: z.number().finite().nonnegative().max(99999.99).optional(),
  rating: z.number().finite().min(0).max(5).nullable().optional(),
  imageKey: z.string().max(512).nullable().optional(),
  imageUrl: z.string().max(1024).nullable().optional(),
  isAvailable: z.boolean().optional(),
});

export function canCreateRestaurant(existingCount: number) {
  return existingCount < MAX_RESTAURANTS_PER_OWNER;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function normalizeSocialLinks(value: Record<string, string | undefined>) {
  const entries = Object.entries(value).filter(([, link]) => Boolean(link));
  return JSON.stringify(Object.fromEntries(entries));
}

function decimalValue(value: number | null | undefined) {
  return value === null || value === undefined ? null : value.toFixed(2);
}

function imageExtension(contentType: (typeof imageContentTypes)[number]) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

function getImageBuffer(dataUrl: string, contentType: (typeof imageContentTypes)[number]) {
  const match = dataUrl.match(/^data:(image\/jpeg|image\/png|image\/webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[1] !== contentType) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The uploaded image data is invalid." });
  }

  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Images must be 5 MB or smaller." });
  }

  return buffer;
}

function assertOwned<T>(record: T | undefined, entityName: string): asserts record is T {
  if (!record) {
    throw new TRPCError({ code: "NOT_FOUND", message: `${entityName} was not found.` });
  }
}

export const restaurantRouter = router({
  public: router({
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1).max(100) }))
      .query(async ({ input }) => getPublicRestaurantBySlug(input.slug)),
    getMenuItem: publicProcedure
      .input(z.object({ restaurantSlug: z.string().min(1).max(100), menuItemId: z.string().min(1) }))
      .query(async ({ input }) => getPublicMenuItem(input.restaurantSlug, input.menuItemId)),
  }),
  owner: router({
    restaurants: router({
      list: protectedProcedure.query(async ({ ctx }) => listRestaurantsForOwner(ctx.user.id)),
      create: protectedProcedure.input(restaurantFieldsSchema).mutation(async ({ ctx, input }) => {
        const existingCount = await countRestaurantsForOwner(ctx.user.id);
        if (!canCreateRestaurant(existingCount)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Each owner can manage a maximum of two restaurants.",
          });
        }

        const baseSlug = slugify(input.name) || "restaurant";
        const slug = `${baseSlug}-${nanoid(6).toLowerCase()}`;
        const collision = await getRestaurantBySlug(slug);
        if (collision) {
          throw new TRPCError({ code: "CONFLICT", message: "Please choose a different restaurant name." });
        }

        return createRestaurantForOwner({
          id: nanoid(),
          ownerId: ctx.user.id,
          slug,
          name: input.name,
          description: input.description,
          bannerImageKey: input.bannerImageKey ?? null,
          bannerImageUrl: input.bannerImageUrl ?? null,
          address: input.address,
          phone: input.phone,
          hours: input.hours,
          socialLinks: normalizeSocialLinks(input.socialLinks),
          isPublished: input.isPublished,
        });
      }),
      get: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1) }))
        .query(async ({ ctx, input }) => getRestaurantForOwner(input.restaurantId, ctx.user.id)),
      update: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1), data: restaurantUpdateSchema }))
        .mutation(async ({ ctx, input }) => {
          assertOwned(await getRestaurantForOwner(input.restaurantId, ctx.user.id), "Restaurant");
          const data = input.data;
          return updateRestaurantForOwner(input.restaurantId, ctx.user.id, {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.description !== undefined ? { description: data.description } : {}),
            ...(data.bannerImageKey !== undefined ? { bannerImageKey: data.bannerImageKey } : {}),
            ...(data.bannerImageUrl !== undefined ? { bannerImageUrl: data.bannerImageUrl } : {}),
            ...(data.address !== undefined ? { address: data.address } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
            ...(data.hours !== undefined ? { hours: data.hours } : {}),
            ...(data.socialLinks !== undefined ? { socialLinks: normalizeSocialLinks(data.socialLinks) } : {}),
            ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
          });
        }),
      overview: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
          assertOwned(await getRestaurantForOwner(input.restaurantId, ctx.user.id), "Restaurant");
          const [summary, restaurant] = await Promise.all([
            getRestaurantOverview(input.restaurantId),
            getRestaurantForOwner(input.restaurantId, ctx.user.id),
          ]);
          return {
            restaurant,
            ...summary,
            ordersPlaceholder: {
              label: "Orders are not enabled yet",
              detail: "This space is reserved for future order activity.",
            },
          };
        }),
    }),
    categories: router({
      list: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
          assertOwned(await getRestaurantForOwner(input.restaurantId, ctx.user.id), "Restaurant");
          return listCategoriesForRestaurant(input.restaurantId);
        }),
      create: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1), data: categoryFieldsSchema }))
        .mutation(async ({ ctx, input }) => {
          assertOwned(await getRestaurantForOwner(input.restaurantId, ctx.user.id), "Restaurant");
          const count = await countCategoriesForRestaurant(input.restaurantId);
          return createCategory({
            id: nanoid(),
            restaurantId: input.restaurantId,
            name: input.data.name,
            sortOrder: count,
          });
        }),
      update: protectedProcedure
        .input(z.object({ categoryId: z.string().min(1), data: categoryFieldsSchema }))
        .mutation(async ({ ctx, input }) => {
          assertOwned(await getCategoryForOwner(input.categoryId, ctx.user.id), "Category");
          return updateCategoryForOwner(input.categoryId, ctx.user.id, { name: input.data.name });
        }),
      remove: protectedProcedure
        .input(z.object({ categoryId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
          assertOwned(await getCategoryForOwner(input.categoryId, ctx.user.id), "Category");
          return removeCategoryForOwner(input.categoryId, ctx.user.id);
        }),
      reorder: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1), categoryIds: z.array(z.string().min(1)).min(1) }))
        .mutation(async ({ ctx, input }) => {
          const completed = await reorderCategoriesForOwner(input.restaurantId, ctx.user.id, input.categoryIds);
          if (!completed) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "The category order could not be saved." });
          }
          return { success: true };
        }),
    }),
    menuItems: router({
      list: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
          assertOwned(await getRestaurantForOwner(input.restaurantId, ctx.user.id), "Restaurant");
          return listMenuItemsForRestaurant(input.restaurantId);
        }),
      create: protectedProcedure
        .input(z.object({ restaurantId: z.string().min(1), data: menuItemFieldsSchema }))
        .mutation(async ({ ctx, input }) => {
          assertOwned(await getRestaurantForOwner(input.restaurantId, ctx.user.id), "Restaurant");
          if (input.data.categoryId) {
            const category = await getCategoryForOwner(input.data.categoryId, ctx.user.id);
            if (!category || category.category.restaurantId !== input.restaurantId) {
              throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a category from this restaurant." });
            }
          }
          const count = await countMenuItemsForRestaurant(input.restaurantId);
          return createMenuItem({
            id: nanoid(),
            restaurantId: input.restaurantId,
            categoryId: input.data.categoryId ?? null,
            title: input.data.title,
            description: input.data.description,
            ingredients: input.data.ingredients,
            price: decimalValue(input.data.price)!,
            rating: decimalValue(input.data.rating),
            imageKey: input.data.imageKey ?? null,
            imageUrl: input.data.imageUrl ?? null,
            isAvailable: input.data.isAvailable,
            sortOrder: count,
          });
        }),
      update: protectedProcedure
        .input(z.object({ menuItemId: z.string().min(1), data: menuItemUpdateSchema }))
        .mutation(async ({ ctx, input }) => {
          const ownedItem = await getMenuItemForOwner(input.menuItemId, ctx.user.id);
          assertOwned(ownedItem, "Menu item");
          if (input.data.categoryId) {
            const category = await getCategoryForOwner(input.data.categoryId, ctx.user.id);
            if (!category || category.category.restaurantId !== ownedItem.menuItem.restaurantId) {
              throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a category from this restaurant." });
            }
          }

          const data = input.data;
          return updateMenuItemForOwner(input.menuItemId, ctx.user.id, {
            ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.description !== undefined ? { description: data.description } : {}),
            ...(data.ingredients !== undefined ? { ingredients: data.ingredients } : {}),
            ...(data.price !== undefined ? { price: decimalValue(data.price)! } : {}),
            ...(data.rating !== undefined ? { rating: decimalValue(data.rating) } : {}),
            ...(data.imageKey !== undefined ? { imageKey: data.imageKey } : {}),
            ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
            ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
          });
        }),
      remove: protectedProcedure
        .input(z.object({ menuItemId: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
          assertOwned(await getMenuItemForOwner(input.menuItemId, ctx.user.id), "Menu item");
          return removeMenuItemForOwner(input.menuItemId, ctx.user.id);
        }),
    }),
    assets: router({
      uploadImage: protectedProcedure
        .input(
          z.object({
            restaurantId: z.string().min(1),
            fileName: z.string().trim().min(1).max(128),
            contentType: z.enum(imageContentTypes),
            dataUrl: z.string().max(7_100_000),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          assertOwned(await getRestaurantForOwner(input.restaurantId, ctx.user.id), "Restaurant");
          const buffer = getImageBuffer(input.dataUrl, input.contentType);
          const extension = imageExtension(input.contentType);
          const safeName = input.fileName.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 48) || "image";
          return storagePut(
            `restaurants/${input.restaurantId}/${safeName}-${nanoid(8)}.${extension}`,
            buffer,
            input.contentType,
          );
        }),
    }),
  }),
});
