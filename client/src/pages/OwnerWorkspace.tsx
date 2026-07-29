import { api, type Restaurant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChefHat, CirclePlus, LogOut, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import CreateRestaurant from "@/components/owner/CreateRestaurant";
import RestaurantDashboard from "@/components/owner/RestaurantDashboard";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

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
      const firstId = result.restaurants[0]?._id || "new";
      setRestaurantId(firstId);
      if (firstId !== "new") {
        const res = await api.myRestaurant(firstId);
        setRestaurant(res);
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
              onClick={async () => {
                setRestaurantId(record._id);
                const res = await api.myRestaurant(record._id);
                setRestaurant(res);
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
