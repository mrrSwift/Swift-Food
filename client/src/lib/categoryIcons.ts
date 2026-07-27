// src/lib/categoryIcons.ts
import {
  UtensilsCrossed,
  Soup,
  Pizza,
  Salad,
  Coffee,
  Wine,
  Beer,
  IceCream,
  Croissant,
  Sandwich,
  Beef,
  Fish,
  Cake,
  Cookie,
  Apple,
  Grape,
  ChefHat,
  Flame,
  Leaf,
  Egg,
  Milk,
  GlassWater,
  CupSoda,
  Martini,
  Bird,
  Carrot,
  Cherry,
  Citrus,
  Drumstick,
  Ham,
  Shell,
  Snail,
} from "lucide-react";

export const categoryIcons = [
  { name: "UtensilsCrossed", icon: UtensilsCrossed, label: "Main Course" },
  { name: "Soup", icon: Soup, label: "Soup" },
  { name: "Pizza", icon: Pizza, label: "Pizza" },
  { name: "Salad", icon: Salad, label: "Salad" },
  { name: "Coffee", icon: Coffee, label: "Coffee" },
  { name: "Wine", icon: Wine, label: "Wine" },
  { name: "Beer", icon: Beer, label: "Beer" },
  { name: "IceCream", icon: IceCream, label: "Dessert" },
  { name: "Croissant", icon: Croissant, label: "Bakery" },
  { name: "Sandwich", icon: Sandwich, label: "Sandwich" },
  { name: "Beef", icon: Beef, label: "Meat" },
  { name: "Fish", icon: Fish, label: "Seafood" },
  { name: "Cake", icon: Cake, label: "Cake" },
  { name: "Cookie", icon: Cookie, label: "Snacks" },
  { name: "Apple", icon: Apple, label: "Fruits" },
  { name: "Grape", icon: Grape, label: "Grapes" },
  { name: "ChefHat", icon: ChefHat, label: "Special" },
  { name: "Flame", icon: Flame, label: "Spicy" },
  { name: "Leaf", icon: Leaf, label: "Vegan" },
  { name: "Egg", icon: Egg, label: "Eggs" },
  { name: "Milk", icon: Milk, label: "Dairy" },
  { name: "GlassWater", icon: GlassWater, label: "Water" },
  { name: "CupSoda", icon: CupSoda, label: "Soda" },
  { name: "Martini", icon: Martini, label: "Cocktail" },
  { name: "Bird", icon: Bird, label: "Chicken" },
  { name: "Carrot", icon: Carrot, label: "Vegetables" },
  { name: "Cherry", icon: Cherry, label: "Cherry" },
  { name: "Drumstick", icon: Drumstick, label: "Drumstick" },
  { name: "Ham", icon: Ham, label: "Ham" },
  { name: "Shell", icon: Shell, label: "Shellfish" },
  { name: "Snail", icon: Snail, label: "Snails" },
] as const;

export type IconName = (typeof categoryIcons)[number]["name"];

// Helper to get icon component by name
export function getCategoryIcon(iconName: string) {
  const iconEntry = categoryIcons.find((i) => i.name === iconName);
  return iconEntry?.icon || UtensilsCrossed;
}

// Get all icon names for validation
export const iconNames = categoryIcons.map((i) => i.name);