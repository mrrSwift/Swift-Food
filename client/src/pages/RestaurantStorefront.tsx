import { api, type MenuItem, type Restaurant } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");
import {
  ChefHat,
  MapPin,
  Phone,
  Star,
  UtensilsCrossed,
  Search,
  SlidersHorizontal,
  X,
  Leaf,
  Wheat,
  Flame,
  Plus,
  NotebookPen,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRoute } from "wouter";
import { OpeningHours } from "@/components/OpeningHours";
import { CategoryIcon } from "@/components/menu/CategoryIcon";
import {
  addNotebookItem,
  readNotebook,
  writeNotebook,
  notebookItemCount,
} from "@/lib/notebook";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NotebookModal } from "@/components/Notebook/NotebookModal";
import { useMeta } from "@/hooks/useMeta";

function price(price: number) {
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + " Toman"
  );
}

export default function RestaurantStorefront() {
  const [, params] = useRoute("/r/:restaurantId");
  const id = params?.restaurantId;
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [menu, setMenu] = useState<
    {
      category: {
        id: string;
        name: string;
        description?: string;
        icon?: string;
      };
      items: MenuItem[];
    }[]
  >([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    spicy: false,
  });
  const [notebookCount, setNotebookCount] = useState(0);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([api.publicRestaurant(id), api.publicMenu(id)])
      .then(([record, data]) => {
        setRestaurant(record);
        setMenu(data.menu);
      })
      .catch(err => setError(err.message));
  }, [id]);

  useEffect(() => {
    const updateCount = () => {
      const nb = readNotebook();
      setNotebookCount(notebookItemCount(nb));
    };
    updateCount();
    window.addEventListener("focus", updateCount);
    return () => window.removeEventListener("focus", updateCount);
  }, []);

  // Get all unique categories for filter buttons
  const allCategories = useMemo(() => {
    return menu.map(group => ({
      id: group.category.id,
      name: group.category.name,
    }));
  }, [menu]);

  // Filter menu based on selections
  const filteredMenu = useMemo(() => {
    return menu
      .map(group => {
        // Filter by category
        if (
          selectedCategory !== "all" &&
          group.category.id !== selectedCategory
        ) {
          return null;
        }

        // Filter items within category
        const filteredItems = group.items.filter(item => {
          // Search filter
          if (
            searchQuery &&
            !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !item.description.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return false;
          }

          // Dietary filters
          if (dietaryFilters.vegetarian && !item.isVegetarian) return false;
          if (dietaryFilters.vegan && !item.isVegan) return false;
          if (dietaryFilters.glutenFree && !item.isGlutenFree) return false;
          if (dietaryFilters.spicy && !item.spiceLevel) return false;

          return true;
        });

        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter(group => group !== null && group.items.length > 0) as typeof menu;
  }, [menu, selectedCategory, searchQuery, dietaryFilters]);

  // Check if any filters are active
  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery ||
    Object.values(dietaryFilters).some(Boolean);
  useMeta({
    title: restaurant?.name,
    description: restaurant?.description,
  });
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setDietaryFilters({
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      spicy: false,
    });
  };

  if (error)
    return (
      <main className="grid min-h-screen place-items-center bg-background dark:bg-gray-950 p-6">
        <div className="rounded-3xl bg-card dark:bg-gray-900 p-8 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto size-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            Restaurant unavailable
          </h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </main>
    );

  if (!restaurant)
    return (
      <main className="grid min-h-screen place-items-center bg-background dark:bg-gray-950 text-muted-foreground">
        Loading menu…
      </main>
    );

  return (
    <main className="min-h-screen bg-background dark:bg-gray-950 p-4 sm:p-8 transition-colors">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-lg">
              <ChefHat className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-indigo-500 dark:text-indigo-400">
                Swift digital menu
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                {restaurant.name}
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            className="relative text-foreground hover:bg-accent"
            onClick={() => setIsNotebookOpen(true)}
          >
            <NotebookPen className="size-5" />
            {notebookCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notebookCount}
              </span>
            )}
          </Button>
        </header>

        {/* Restaurant Card */}
        <section className="mt-4 overflow-hidden rounded-[32px] bg-card dark:bg-gray-900 shadow-sm border dark:border-gray-800">
          <div className="relative grid min-h-72 place-items-center bg-gradient-to-br from-emerald-100 via-amber-50 to-indigo-100 dark:from-emerald-900/20 dark:via-amber-900/10 dark:to-indigo-900/20">
            {restaurant.coverImage ? (
              <>
                <img
                  src={API_BASE_URL + restaurant.coverImage}
                  className="size-full object-cover"
                  alt={restaurant.name}
                />
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  {restaurant.logo ? (
                    <img
                      src={API_BASE_URL + restaurant.logo}
                      alt={restaurant.name}
                      className="size-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <div className="size-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-500 dark:text-gray-400">
                        {restaurant.name?.charAt(0) || "R"}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <ChefHat className="size-16 text-slate-500 dark:text-gray-400" />
            )}
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground">
                  {restaurant.name}
                </h1>
                <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                  {restaurant.description}
                </p>
              </div>
              <Badge className="bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5">
                <Star className="mr-1 size-3.5 fill-current" />{" "}
                {restaurant.rating.toFixed(1)}
              </Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" /> {restaurant.address}
              </span>
              <a
                className="inline-flex items-center gap-2 hover:text-foreground"
                href={`tel:${restaurant.phone}`}
              >
                <Phone className="size-4" /> {restaurant.phone}
              </a>
              <OpeningHours openingHours={restaurant.openingHours} />
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card dark:bg-gray-900 border dark:border-gray-800 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "bg-card dark:bg-gray-900 text-foreground shadow-sm hover:bg-accent dark:hover:bg-gray-800"
              }`}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 size-5 rounded-full bg-white/20 dark:bg-gray-900/20 text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md"
                  : "bg-card dark:bg-gray-900 text-foreground shadow-sm hover:bg-accent dark:hover:bg-gray-800"
              }`}
            >
              All Items
            </button>
            {allCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md"
                    : "bg-card dark:bg-gray-900 text-foreground shadow-sm hover:bg-accent dark:hover:bg-gray-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dietary Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-4 bg-card dark:bg-gray-900 rounded-2xl shadow-sm">
              <span className="text-xs text-muted-foreground w-full mb-1">
                Dietary Preferences:
              </span>
              <button
                onClick={() =>
                  setDietaryFilters(prev => ({
                    ...prev,
                    vegetarian: !prev.vegetarian,
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  dietaryFilters.vegetarian
                    ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800"
                    : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700"
                }`}
              >
                <Leaf className="size-3" />
                Vegetarian
              </button>
              <button
                onClick={() =>
                  setDietaryFilters(prev => ({ ...prev, vegan: !prev.vegan }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  dietaryFilters.vegan
                    ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800"
                    : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700"
                }`}
              >
                <Leaf className="size-3" />
                Vegan
              </button>
              <button
                onClick={() =>
                  setDietaryFilters(prev => ({
                    ...prev,
                    glutenFree: !prev.glutenFree,
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  dietaryFilters.glutenFree
                    ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800"
                    : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700"
                }`}
              >
                <Wheat className="size-3" />
                Gluten Free
              </button>
              <button
                onClick={() =>
                  setDietaryFilters(prev => ({ ...prev, spicy: !prev.spicy }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  dietaryFilters.spicy
                    ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800"
                    : "bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700"
                }`}
              >
                <Flame className="size-3" />
                Spicy
              </button>
            </div>
          )}
        </section>

        {/* Menu Items */}
        <section className="mt-9 space-y-10">
          {filteredMenu.length === 0 ? (
            <div className="text-center py-16">
              <UtensilsCrossed className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">
                No items found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-primary font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredMenu.map(group => (
              <div key={group.category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-1 rounded-xl bg-slate-100 dark:bg-gray-800">
                    <CategoryIcon
                      animation="float"
                      iconName={group.category.icon}
                      size="lg"
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-3xl font-semibold text-foreground">
                      {group.category.name}
                    </h2>
                    {group.category.description && (
                      <p className="mt-1 text-muted-foreground">
                        {group.category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map(item => (
                    <article
                      key={item._id}
                      className="rounded-[24px] bg-card dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-shadow border dark:border-gray-800"
                    >
                      <div className="grid aspect-[1.35/1] place-items-center overflow-hidden rounded-[17px] bg-slate-100 dark:bg-gray-800">
                        {item.image ? (
                          <img
                            src={API_BASE_URL + item.image}
                            className="size-full object-cover"
                            alt={item.name}
                          />
                        ) : (
                          <UtensilsCrossed className="size-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-4 flex justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <div className="flex flex-col gap-1">
                          {item.discountPrice ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground line-through">
                                  {price(item.price)}
                                </span>
                                <span className="text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                                  {Math.round(
                                    (1 - item.discountPrice / item.price) * 100
                                  )}
                                  % OFF
                                </span>
                              </div>
                              <strong className="text-xl text-foreground">
                                {price(item.discountPrice)}
                              </strong>
                            </>
                          ) : (
                            <strong className="text-xl text-foreground">
                              {price(item.price)}
                            </strong>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.isVegetarian && (
                          <Badge variant="secondary">Vegetarian</Badge>
                        )}
                        {item.isVegan && (
                          <Badge variant="secondary">Vegan</Badge>
                        )}
                        {item.isGlutenFree && (
                          <Badge variant="secondary">Gluten free</Badge>
                        )}
                        {item.preparationTime && (
                          <Badge variant="secondary">
                            {item.preparationTime} min
                          </Badge>
                        )}
                        {item.spiceLevel && (
                          <Badge variant="secondary">{item.spiceLevel}</Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 dark:border-gray-700 hover:bg-accent dark:hover:bg-gray-800"
                          onClick={() => {
                            const notebook = readNotebook();
                            const updated = addNotebookItem(
                              notebook,
                              restaurant._id,
                              {
                                menuItemId: item._id || "",
                                title: item.name,
                                price: item.discountPrice ?? item.price,
                                imageUrl: item.image
                                  ? API_BASE_URL + item.image
                                  : null,
                              }
                            );
                            writeNotebook(updated);
                            toast.success(`${item.name} added to your note`);
                          }}
                        >
                          <Plus className="size-4 mr-1" />
                          Add to Note
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <NotebookModal
        restaurantId={restaurant._id}
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />
    </main>
  );
}
