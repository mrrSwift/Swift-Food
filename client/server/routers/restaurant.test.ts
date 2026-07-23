import { describe, expect, it } from "vitest";
import {
  canCreateRestaurant,
  MAX_RESTAURANTS_PER_OWNER,
  normalizeSocialLinks,
  slugify,
} from "./restaurant";

describe("restaurant owner rules", () => {
  it("limits each owner to two restaurants", () => {
    expect(MAX_RESTAURANTS_PER_OWNER).toBe(2);
    expect(canCreateRestaurant(0)).toBe(true);
    expect(canCreateRestaurant(1)).toBe(true);
    expect(canCreateRestaurant(2)).toBe(false);
  });

  it("creates compact URL-safe slugs from restaurant names", () => {
    expect(slugify("  Luma & Table!  ")).toBe("luma-table");
    expect(slugify("Élan de Nuit")).toBe("lan-de-nuit");
  });

  it("persists only populated social links", () => {
    expect(normalizeSocialLinks({ instagram: "https://instagram.com/luma", facebook: "", website: undefined })).toBe(
      JSON.stringify({ instagram: "https://instagram.com/luma" }),
    );
  });
});
