import { api, type Category, type MenuItem, type Restaurant } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");
import {
  ChefHat,
  CirclePlus,
  LayoutDashboard,
  ListPlus,
  LogOut,
  Settings2,
  Store,
  Tags,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { IconPicker } from "@/components/owner/IconPicker";

const week = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";
const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

export default function OwnerWorkspace() {
  const [, navigate] = useLocation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [restaurantId, setRestaurantId] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = async () => {
    try {
      const result = await api.myRestaurants();
      setRestaurants(result.restaurants);
      setRestaurantId(value => value || result.restaurants[0]?._id || "new");
      if (restaurantId) {
        api.myRestaurant(restaurantId).then(res => {
          setRestaurant(res);
        });
      }
    } catch (error) {
      setNotice(errorMessage(error));
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("restaurant-token")) navigate("/owner/login");
    else void refresh();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5fb] p-4 sm:p-7">
      <div className="pointer-events-none fixed -left-40 top-0 size-[30rem] rounded-full bg-indigo-200/45 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 size-[34rem] rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <ChefHat className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-indigo-500">
                Restaurant control room
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                Owner workspace
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl bg-white/70"
            onClick={() => {
              localStorage.removeItem("restaurant-token");
              localStorage.removeItem("restaurant-user");
              navigate("/");
            }}
          >
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </header>
        {notice && (
          <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {notice}
          </p>
        )}
        <div className="mt-7 flex gap-3 overflow-x-auto pb-2">
          {restaurants.map(record => (
            <button
              key={record._id}
              onClick={() => {
                setRestaurantId(record._id);
                api.myRestaurant(restaurantId).then(res => {
                  setRestaurant(res);
                });
              }}
              className={`min-w-48 rounded-2xl px-5 py-4 text-left transition ${restaurantId === record._id ? "bg-slate-900 text-white shadow-lg" : "bg-white/75 text-slate-700 shadow-sm"}`}
            >
              <Store className="size-4" />
              <strong className="mt-2 block">{record.name}</strong>
              <span className="mt-1 block text-xs opacity-70">
                {record.cuisine.join(" · ") || "Restaurant"}
              </span>
            </button>
          ))}
          {restaurants.length < 2 && (
            <button
              onClick={() => setRestaurantId("new")}
              className="min-w-48 rounded-2xl border border-dashed border-slate-300 bg-white/45 px-5 py-4 text-left text-slate-600"
            >
              <CirclePlus className="size-5" />
              <strong className="mt-2 block">Add restaurant</strong>
              <span className="text-xs">{restaurants.length}/2 used</span>
            </button>
          )}
        </div>
        {restaurantId === "new" ? (
          <CreateRestaurant done={refresh} />
        ) : (
          restaurant && (
            <RestaurantDashboard
              restaurant={restaurant}
              refreshRestaurants={refresh}
            />
          )
        )}
      </div>
    </main>
  );
}

function CreateRestaurant({ done }: { done: () => Promise<void> }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    cuisine: "",
  });
  const [error, setError] = useState("");
  const field =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: event.target.value });
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await api.createRestaurant({
        ...form,
        website: form.website || undefined,
        cuisine: form.cuisine
          .split(",")
          .map(value => value.trim())
          .filter(Boolean),
        openingHours: week.map(day => ({ day, open: "11:00", close: "22:00" })),
      });
      await done();
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <form onSubmit={submit} className={`${glass} mt-7 max-w-3xl p-6 sm:p-8`}>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-500">
        New location
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold">
        Create your restaurant
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(
          ["name", "email", "phone", "address", "cuisine", "website"] as const
        ).map(key => (
          <Input
            key={key}
            required={key !== "website"}
            type={key === "email" ? "email" : "text"}
            value={form[key]}
            onChange={field(key)}
            placeholder={
              key === "cuisine"
                ? "Cuisines — Italian, Pizza"
                : key[0].toUpperCase() + key.slice(1)
            }
            className="h-11 rounded-xl bg-white/80"
          />
        ))}
        <Textarea
          required
          value={form.description}
          onChange={field("description")}
          placeholder="A short restaurant description"
          className="min-h-28 rounded-xl bg-white/80 sm:col-span-2"
        />
      </div>
      {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
      <Button className="mt-6 h-11 rounded-xl bg-slate-900 px-6 text-white">
        Create restaurant
      </Button>
    </form>
  );
}

function RestaurantDashboard({
  restaurant,
  refreshRestaurants,
}: {
  restaurant: Restaurant;
  refreshRestaurants: () => Promise<void>;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState("");
  const refresh = async () => {
    try {
      const [categoryData, itemData] = await Promise.all([
        api.categories(restaurant._id),
        api.menuItems(restaurant._id),
      ]);
      setCategories(categoryData);
      setItems(itemData);
    } catch (error) {
      setError(errorMessage(error));
    }
  };
  useEffect(() => {
    void refresh();
  }, [restaurant._id]);
  return (
    <Tabs defaultValue="overview" className="mt-7">
      <TabsList className="h-auto rounded-2xl bg-white/70 p-1.5">
        <TabsTrigger value="overview" className="rounded-xl px-4">
          <LayoutDashboard />
          Overview
        </TabsTrigger>
        <TabsTrigger value="settings" className="rounded-xl px-4">
          <Settings2 />
          Settings
        </TabsTrigger>
        <TabsTrigger value="categories" className="rounded-xl px-4">
          <Tags />
          Categories
        </TabsTrigger>
        <TabsTrigger value="menu" className="rounded-xl px-4">
          <UtensilsCrossed />
          Menu
        </TabsTrigger>
      </TabsList>
      {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
      <TabsContent value="overview">
        <section className={`${glass} mt-5 p-6 sm:p-8`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-500">
                Live overview
              </p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
                {restaurant.name}
              </h2>
              <p className="mt-3 max-w-xl text-slate-500">
                {restaurant.description}
              </p>
            </div>

            <Badge
              className={
                restaurant.isActive
                  ? "rounded-full bg-emerald-600 px-3 py-1"
                  : "rounded-full bg-slate-500 px-3 py-1"
              }
            >
              {restaurant.isActive ? "Active" : "Inactive"}
            </Badge>
            <Link
              href={"/r/" + restaurant._id}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              Restaurant link
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Categories"
              value={categories.length}
              icon={<Tags />}
            />
            <Stat
              label="Menu items"
              value={items.length}
              icon={<UtensilsCrossed />}
            />
            <Stat
              label="Available now"
              value={items.filter(item => item.isAvailable).length}
              icon={<ListPlus />}
            />
          </div>
          <div className="mt-7 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <span>{restaurant.address}</span>
            <span>{restaurant.phone}</span>
            <span>{restaurant.email}</span>
          </div>
        </section>
      </TabsContent>
      <TabsContent value="settings">
        <SettingsForm restaurant={restaurant} done={refreshRestaurants} />
      </TabsContent>
      <TabsContent value="categories">
        <CategoryManager
          restaurantId={restaurant._id}
          categories={categories}
          refresh={refresh}
        />
      </TabsContent>
      <TabsContent value="menu">
        <MenuManager
          restaurantId={restaurant._id}
          categories={categories}
          items={items}
          refresh={refresh}
        />
      </TabsContent>
    </Tabs>
  );
}
function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-4">
      <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {icon}
      </span>
      <strong className="mt-4 block text-3xl">{value}</strong>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}
function SettingsForm({
  restaurant,
  done,
}: {
  restaurant: Restaurant;
  done: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, GIF)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setImageFile(file);
  };
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, GIF)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setLogoFile(file);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const formData = new FormData();
    if (imageFile && logoFile) {
      formData.append("image", imageFile);
      formData.append("kind", "restaurant");
      api.uploadImage(formData).then(url => {
        values.append("coverImage", url.url);
        formData.append("image", logoFile);
        formData.append("kind", "restaurant");
        api.uploadImage(formData).then(async url => {
          values.append("logo", url.url);
          try {
            await api.updateRestaurant(restaurant._id, {
              name: String(values.get("name")),
              email: String(values.get("email")),
              phone: String(values.get("phone")),
              address: String(values.get("address")),
              coverImage: String(values.get("coverImage")),
              logo: String(values.get("logo")),
              website: String(values.get("website")) || undefined,
              description: String(values.get("description")),
              cuisine: String(values.get("cuisine"))
                .split(",")
                .map(value => value.trim())
                .filter(Boolean),
            });
            await done();
          } catch (error) {
            setError(errorMessage(error));
          }
        });
      });
    }
  }
  return (
    <form onSubmit={submit} className={`${glass} mt-5 max-w-3xl p-6`}>
      <h2 className="font-display text-2xl font-semibold">
        Restaurant settings
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Input name="name" placeholder="Name" defaultValue={restaurant.name} />
        <Input
          name="email"
          placeholder="Email"
          defaultValue={restaurant.email}
        />
        <Input
          name="phone"
          placeholder="Phone"
          defaultValue={restaurant.phone}
        />
        <Input
          name="address"
          placeholder="address"
          defaultValue={restaurant.address}
        />
        <Input
          name="cuisine"
          placeholder="Cuisine"
          defaultValue={restaurant.cuisine.join(", ")}
        />
        <Input
          name="website"
          defaultValue={restaurant.website}
          placeholder="Website"
        />
        <div>
          <label className="mb-2"> Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="category-image-input"
            className="rounded-md border p-3 w-80"
            required
          />
        </div>
        <div>
          <label className="mb-2">Logo </label>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            id="category-image-input"
            className="rounded-md border p-3 w-80"
            required
          />
        </div>
        <Textarea
          name="description"
          defaultValue={restaurant.description}
          className="min-h-28 sm:col-span-2"
        />
      </div>
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      <Button className="mt-5 rounded-xl bg-slate-900 text-white">
        Save changes
      </Button>
    </form>
  );
}
function CategoryManager({
  restaurantId,
  categories,
  refresh,
}: {
  restaurantId: string;
  categories: Category[];
  refresh: () => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
const [selectedIcon, setSelectedIcon] = useState("UtensilsCrossed");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, GIF)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setImageFile(file);
  };

  async function add(event: FormEvent) {
    event.preventDefault();
   
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
        formData.append("kind", "category");
        api
          .uploadImage(formData)
          .then(async url => {
            console.log(url);

            await api.createCategory(restaurantId, {
              name,
              description,
              image: url.url,
              icon: selectedIcon,
              order: categories.length,
            });
          })
          .catch(e => {
            console.log(e);
          });
      }
      setName("");
      setDescription("");
      await refresh();
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <section className={`${glass} mt-5 max-w-3xl p-6`}>
      <h2 className="font-display text-2xl font-semibold">Menu categories</h2>
      <form onSubmit={add} className="mt-5 grid grid-cols-2 gap-4">
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="e.g. Hot drink"
          required
        />
        <Input
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="e.g. Hot milk"
          required
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          id="category-image-input"
          className="rounded-md border p-3"
          required
        />

        {/* 🆕 Icon Picker */}
        <div className="col-span-2">
          <IconPicker
            value={selectedIcon}
            onChange={(iconName) => setSelectedIcon(iconName)}
          />
        </div>

        <Button className="p-6">
          <CirclePlus className=" " />
          Add
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      <div className="mt-5 space-y-2 grid grid-cols-2 gap-4">
        {categories.map(category => (
          <div
            className="grid grid-cols-2 gap-4 justify-items-center rounded-2xl bg-white/70 p-4"
            key={category._id}
          >
            <img
              width="100"
              className="col-span-2"
              src={API_BASE_URL + category.image}
              alt="not load"
            />
            <strong>{category.name}</strong>

            <Button
              size="icon"
              variant="ghost"
              onClick={async () => {
                try {
                  if (category?._id) {
                    await api.deleteCategory(restaurantId, category._id);
                    await refresh();
                  }
                } catch (error) {
                  setError(errorMessage(error));
                }
              }}
            >
              <Trash2 className="size-4 text-rose-600" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
function MenuManager({
  restaurantId,
  categories,
  items,
  refresh,
}: {
  restaurantId: string;
  categories: Category[];
  items: MenuItem[];
  refresh: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    discountPrice: "",
    ingredients: "",
    allergens: "",
    isVegetarian: "",
    isVegan: "",
    preparationTime: "",
    isGlutenFree: "",
    spiceLevel: "",
    isAvailable: true,
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, GIF)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setImageFile(file);
  };

  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
        formData.append("kind", "menu");
        api
          .uploadImage(formData)
          .then(async data => {
            await api.createMenuItem(restaurantId, {
              ...form,
              image: data.url,
              price: Number(form.price),
              preparationTime: Number(form.preparationTime),
              order: items.length,
              discountPrice: Number(form.discountPrice),
              isVegetarian: Boolean(form.isVegetarian),
              isVegan: Boolean(form.isVegan),
              isGlutenFree: Boolean(form.isGlutenFree),
            });
          })
          .catch(e => {
            console.log(e);
          });
      }

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        discountPrice: "",
        ingredients: "",
        allergens: "",
        isVegetarian: "",
        isVegan: "",
        isGlutenFree: "",
        preparationTime: "",
        spiceLevel: "",
        isAvailable: true,
      });
      await refresh();
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <section className={`${glass} mt-5 p-6`}>
      <h2 className="font-display text-2xl font-semibold">Menu items</h2>
      <form onSubmit={add} className="mt-5 grid gap-3 md:grid-cols-4">
        <Input
          value={form.name}
          onChange={event => setForm({ ...form, name: event.target.value })}
          placeholder="Item name"
          required
        />
        <Input
          value={form.price}
          onChange={event => setForm({ ...form, price: event.target.value })}
          type="number"
          min="0"
          placeholder="Price"
          required
        />
        <Input
          value={form.discountPrice}
          onChange={event =>
            setForm({ ...form, discountPrice: event.target.value })
          }
          type="number"
          max={form.price}
          min="0"
          placeholder="Discount Price"
          required
        />
        <Input
          value={form.ingredients}
          onChange={event =>
            setForm({ ...form, ingredients: event.target.value })
          }
          placeholder="Ingredients"
          required
        />
        <Input
          value={form.allergens}
          onChange={event =>
            setForm({ ...form, allergens: event.target.value })
          }
          placeholder="Allergens"
          required
        />
        <Input
          value={form.preparationTime}
          onChange={event =>
            setForm({ ...form, preparationTime: event.target.value })
          }
          type="number"
          min="10"
          placeholder="Preparation Time"
          required
        />

        <select
          value={form.spiceLevel}
          onChange={event =>
            setForm({ ...form, spiceLevel: event.target.value })
          }
          className="h-10 rounded-md border bg-white px-3"
          required
        >
          <option value="">Spice level</option>
          <option key="mild1" value="mild">
            Mild
          </option>
          <option key="medium2" value="medium">
            Medium
          </option>
          <option key="hot3" value="hot">
            Hot
          </option>
          <option key="extra_hot4" value="extra_hot">
            Extra hot
          </option>
        </select>

        <select
          value={form.category}
          onChange={event => setForm({ ...form, category: event.target.value })}
          className="h-10 rounded-md border bg-white px-3"
          required
        >
          <option value="">Category</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <div className="flex flex-row items-center">
          <label htmlFor="isGlutenFree">Is Gluten Free:</label>
          <Input
            className="w-7 m-5"
            value={form.isGlutenFree}
            id="isGlutenFree"
            onChange={event =>
              setForm({ ...form, isGlutenFree: event.target.value })
            }
            type="checkbox"

            placeholder="Is Gluten Free"
          />
        </div>
        <div className="flex flex-row items-center">
          <label htmlFor="isVegan">Is Vegan:</label>
          <Input
            className="w-7 m-5"
            value={form.isVegan}
            id="isVegan"
            onChange={event =>
              setForm({ ...form, isVegan: event.target.value })
            }
            type="checkbox"

            placeholder="Is Vegan"
          />
        </div>
        <div className="flex flex-row items-center">
          <label htmlFor="isVegetarian">Is Vegetarian:</label>
          <Input
            className="w-7 m-5"
            value={form.isVegetarian}
            id="isVegetarian"
            onChange={event =>
              setForm({ ...form, isVegetarian: event.target.value })
            }
            type="checkbox"

            placeholder="Is Vegetarian"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          id="category-image-input"
          className="rounded-md border p-3"
          required
        />
        <Button className="col-span-4">
          <CirclePlus className="mr-2 size-4" />
          Add item
        </Button>
        <Textarea
          value={form.description}
          onChange={event =>
            setForm({ ...form, description: event.target.value })
          }
          className="min-h-20 md:col-span-4"
          placeholder="Item description"
          required
        />
      </form>
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <article className="rounded-2xl bg-white/70 p-4" key={item._id}>
            <img
              src={API_BASE_URL + item.image}
              alt="Event cover"
              className="relative rounded-2xl mb-3 z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            />
            <div className="flex gap-3">
              <strong className="flex-1">{item.name}</strong>
              <span>${item.price.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (item._id) {
                    await api.toggleMenuItem(item._id);
                    await refresh();
                  }
                }}
              >
                {item.isAvailable ? "Hide" : "Show"}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={async () => {
                  if (item._id) {
                    await api.deleteMenuItem(restaurantId, item._id);
                    await refresh();
                  }
                }}
              >
                <Trash2 className="size-4 text-rose-600" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
