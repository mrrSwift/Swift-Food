export type StorefrontRestaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  bannerImageUrl: string | null;
  address: string;
  phone: string;
  hours: string;
  socialLinks: string;
};

export type StorefrontCategory = {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
};

export type StorefrontMenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  title: string;
  description: string;
  ingredients: string;
  price: string | number;
  rating: string | number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
};

export type StorefrontData = {
  restaurant: StorefrontRestaurant;
  categories: StorefrontCategory[];
  menuItems: StorefrontMenuItem[];
};

export const RESTAURANT_IMAGES = {
  hero: "/manus-storage/plated-dish_06666b00.jpg",
  wraps: "/manus-storage/wraps_9f77a933.jpg",
  fish: "/manus-storage/fish-dish_7ddeaec5.jpg",
  paella: "/manus-storage/paella_7c5e514a.jpg",
};

export const previewRestaurant: StorefrontData = {
  restaurant: {
    id: "preview-luma",
    slug: "luma-preview",
    name: "Luma Table",
    description: "A sunlit neighborhood table for bright, ingredient-led plates and slow evenings.",
    bannerImageUrl: RESTAURANT_IMAGES.hero,
    address: "14 Garden Lane, Riverside",
    phone: "+1 555 018 2018",
    hours: "Tue–Sun · 12:00–22:30",
    socialLinks: JSON.stringify({ instagram: "https://www.instagram.com/" }),
  },
  categories: [
    { id: "preview-small", restaurantId: "preview-luma", name: "Small plates", sortOrder: 0 },
    { id: "preview-mains", restaurantId: "preview-luma", name: "Mains", sortOrder: 1 },
    { id: "preview-share", restaurantId: "preview-luma", name: "To share", sortOrder: 2 },
  ],
  menuItems: [
    {
      id: "preview-tahini-wrap",
      restaurantId: "preview-luma",
      categoryId: "preview-small",
      title: "Charred aubergine wrap",
      description: "Smoky aubergine, herb tahini, pickled onion, and summer herbs in warm flatbread.",
      ingredients: "Aubergine, tahini, flatbread, red onion, mint, dill, lemon",
      price: 14,
      rating: null,
      imageUrl: RESTAURANT_IMAGES.wraps,
      isAvailable: true,
      sortOrder: 0,
    },
    {
      id: "preview-citrus-fish",
      restaurantId: "preview-luma",
      categoryId: "preview-mains",
      title: "Citrus market fish",
      description: "Roasted seasonal fish with silky potato, bitter leaves, and a bright citrus glaze.",
      ingredients: "Seasonal fish, potato, greens, citrus, olive oil, herbs",
      price: 26,
      rating: null,
      imageUrl: RESTAURANT_IMAGES.fish,
      isAvailable: true,
      sortOrder: 1,
    },
    {
      id: "preview-saffron-rice",
      restaurantId: "preview-luma",
      categoryId: "preview-share",
      title: "Garden saffron rice",
      description: "A generous pan of saffron rice, market vegetables, herbs, and a lemony broth.",
      ingredients: "Rice, saffron, seasonal vegetables, vegetable broth, parsley, lemon",
      price: 31,
      rating: null,
      imageUrl: RESTAURANT_IMAGES.paella,
      isAvailable: true,
      sortOrder: 2,
    },
  ],
};
