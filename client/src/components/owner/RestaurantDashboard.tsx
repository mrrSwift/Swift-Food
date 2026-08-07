import {
  api,
  Overview,
  type Category,
  type MenuItem,
  type Restaurant,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ClipboardList,
  Clock,
  LayoutDashboard,
  ListPlus,
  Palette,
  QrCode,
  Settings2,
  ShoppingBag,
  Tags,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { OrdersManager } from "./OrdersManager";
import { QRCodeCard } from "./QRCodeCard";
import Stat from "../Stat";
import SettingsForm from "./SettingsForm";
import CategoryManager from "./CategoryManager";
import MenuManager from "./MenuManager";
import { ThemeEditor } from "./ThemeEditor";
import { useLocale } from "@/contexts/LocaleContext";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";
const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

export default function RestaurantDashboard({
  restaurant,
  refreshRestaurants,
}: {
  restaurant: Restaurant;
  refreshRestaurants: () => Promise<void>;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [overview, setOverview] = useState<Overview>();
  const [error, setError] = useState("");
  const { t } = useLocale();

  const refresh = async () => {
    try {
      const [categoryData, itemData, overviewData] = await Promise.all([
        api.categories(restaurant._id),
        api.menuItems(restaurant._id),
        api.myRestaurantOverView(restaurant._id),
      ]);
      setCategories(categoryData);
      setItems(itemData);
      setOverview(overviewData);

    } catch (error) {
      setError(errorMessage(error));
    }
  };

 
  useEffect(() => {
    void refresh();
  }, [restaurant]);
  return (
    <Tabs defaultValue="overview" className="mt-7">
      <TabsList className="h-auto rounded-2xl bg-white/70 p-1.5">
        <TabsTrigger value="overview" className="rounded-xl px-4">
          <LayoutDashboard />
          {t("owner.tabs.overview")}
        </TabsTrigger>
        <TabsTrigger value="settings" className="rounded-xl px-4">
          <Settings2 />
          {t("owner.tabs.settings")}
        </TabsTrigger>
        <TabsTrigger value="categories" className="rounded-xl px-4">
          <Tags />
          {t("owner.tabs.categories")}
        </TabsTrigger>
        <TabsTrigger value="menu" className="rounded-xl px-4">
          <UtensilsCrossed />
          {t("owner.tabs.menu")}
        </TabsTrigger>
        <TabsTrigger value="orders" className="rounded-xl px-4">
          <ClipboardList className="size-4 mr-2" />
          {t("owner.tabs.orders")}
        </TabsTrigger>
        <TabsTrigger value="qrcode" className="rounded-xl px-4">
          <QrCode className="size-4 mr-2" />
          {t("owner.tabs.qrcode")}
        </TabsTrigger>
        <TabsTrigger value="theme" className="rounded-xl px-4">
          <Palette className="size-4 mr-2" />
          {t("owner.tabs.theme")}
        </TabsTrigger>
      </TabsList>
      {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
      <TabsContent value="overview">
        <section className={`${glass} mt-5 p-6 sm:p-8`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-500">
                {t("owner.overview.liveOverview")}
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
              {restaurant.isActive ? t("admin.restaurants.active") : t("admin.restaurants.inactive")}
            </Badge>
            <Link
              href={"/r/" + restaurant._id}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              {t("owner.overview.restaurantLink")}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <Stat
              label={t("owner.overview.categories")}
              value={overview?.categories ?? 0}
              icon={<Tags />}
            />
            <Stat
              label={t("owner.overview.menuItems")}
              value={overview?.totalItems ?? 0}
              icon={<UtensilsCrossed />}
            />
            <Stat
              label={t("owner.overview.availableNow")}
              value={overview?.availableItems ?? 0}
              icon={<ListPlus />}
            />
            {/* 🆕 New stats */}
            <Stat
              label={t("owner.overview.totalOrders")}
              value={overview?.totalOrders ?? 0}
              icon={<ShoppingBag />}
            />
            <Stat
              label={t("owner.overview.pendingOrders")}
              value={overview?.pendingOrders ?? 0}
              icon={<Clock />}
            />
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
      <TabsContent value="orders">
        <OrdersManager restaurantId={restaurant._id} />
      </TabsContent>
      <TabsContent value="qrcode">
        <div className="mt-5 max-w-md mx-auto">
          <QRCodeCard
            restaurantId={restaurant._id}
            restaurantName={restaurant.name}
          />
        </div>
      </TabsContent>
      <TabsContent value="theme">
        <div className="mt-5">
          <ThemeEditor
            restaurantId={restaurant._id}
            initialTheme={restaurant.theme}
            onSaved={() => refresh()}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
