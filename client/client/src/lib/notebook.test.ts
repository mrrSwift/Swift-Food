import { describe, expect, it } from "vitest";
import {
  addNotebookItem,
  deserializeNotebook,
  normalizeNotebook,
  notebookItemCount,
  setNotebookItemQuantity,
} from "./notebook";

describe("Notebook cookie payloads", () => {
  it("rejects malformed payloads instead of exposing invalid Notebook data", () => {
    expect(deserializeNotebook("not-json")).toBeNull();
    expect(normalizeNotebook({ version: 1, restaurantId: "r-1", items: "invalid" })).toBeNull();
  });

  it("keeps Notebook data scoped to one restaurant", () => {
    const first = addNotebookItem(null, "restaurant-a", {
      menuItemId: "item-1",
      title: "A dish",
      price: 12,
    });
    const switched = addNotebookItem(first, "restaurant-b", {
      menuItemId: "item-2",
      title: "Another dish",
      price: 15,
    });

    expect(switched.restaurantId).toBe("restaurant-b");
    expect(switched.items).toHaveLength(1);
    expect(switched.items[0]?.menuItemId).toBe("item-2");
  });

  it("increments quantities and removes an item at zero", () => {
    const notebook = addNotebookItem(null, "restaurant-a", {
      menuItemId: "item-1",
      title: "A dish",
      price: 12,
    });
    const updated = addNotebookItem(notebook, "restaurant-a", {
      menuItemId: "item-1",
      title: "A dish",
      price: 12,
    });

    expect(notebookItemCount(updated)).toBe(2);
    expect(setNotebookItemQuantity(updated, "item-1", 0).items).toEqual([]);
  });
});
