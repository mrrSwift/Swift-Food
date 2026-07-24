import { api, type MenuItem, type Restaurant } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChefHat,
  Clock3,
  MapPin,
  Phone,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";

function price(item: MenuItem) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(item.discountPrice ?? item.price);
}

export default function RestaurantStorefront() {
  const [, params] = useRoute("/r/:restaurantId");
  const id = params?.restaurantId;
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [menu, setMenu] = useState<
    {
      category: { id: string; name: string; description?: string };
      items: MenuItem[];
    }[]
  >([]);
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
  if (error)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f4fa] p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <UtensilsCrossed className="mx-auto size-10 text-slate-400" />
          <h1 className="mt-4 text-xl font-semibold">Restaurant unavailable</h1>
          <p className="mt-2 text-slate-500">{error}</p>
          <Link href="/">
            <Button className="mt-5">
              <ArrowLeft className="mr-2 size-4" /> Back to restaurants
            </Button>
          </Link>
        </div>
      </main>
    );
  if (!restaurant)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f4fa] text-slate-500">
        Loading menu…
      </main>
    );
  return (
    <main className="min-h-screen bg-[#f4f4fa] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> All restaurants
        </Link>
        <section className="mt-4 overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="grid min-h-72 place-items-center bg-gradient-to-br from-emerald-100 via-amber-50 to-indigo-100">
            {restaurant.coverImage ? (
              <img
                src={restaurant.coverImage}
                className="size-full object-cover"
              />
            ) : (
              <ChefHat className="size-16 text-slate-500" />
            )}
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900">
                  {restaurant.name}
                </h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  {restaurant.description}
                </p>
              </div>
              <Badge className="bg-slate-900 px-3 py-1.5 text-white">
                <Star className="mr-1 size-3.5 fill-current" />{" "}
                {restaurant.rating.toFixed(1)}
              </Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" /> {restaurant.address}
              </span>
              <a
                className="inline-flex items-center gap-2 hover:text-slate-900"
                href={`tel:${restaurant.phone}`}
              >
                <Phone className="size-4" /> {restaurant.phone}
              </a>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="size-4" />{" "}
                {restaurant.openingHours
                  .map(
                    hour => `${hour.day.slice(0, 3)} ${hour.open}–${hour.close}`
                  )
                  .join(" · ")}
              </span>
            </div>
          </div>
        </section>
        <section className="mt-9 space-y-10">
          {menu.map(group => (
            <div key={group.category.id}>
              <h2 className="font-display text-3xl font-semibold text-slate-900">
                {group.category.name}
              </h2>
              {group.category.description && (
                <p className="mt-1 text-slate-500">
                  {group.category.description}
                </p>
              )}
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map(item => (
                  <article
                    key={item._id}
                    className="rounded-[24px] bg-white p-4 shadow-sm"
                  >
                    <div className="grid aspect-[1.35/1] place-items-center overflow-hidden rounded-[17px] bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          className="size-full object-cover"
                        />
                      ) : (
                        <UtensilsCrossed className="size-8 text-slate-400" />
                      )}
                    </div>
                    <div className="mt-4 flex justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold text-slate-900">
                        {item.name}
                      </h3>
                      <strong>{price(item)}</strong>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.isVegetarian && (
                        <Badge variant="secondary">Vegetarian</Badge>
                      )}
                      {item.isVegan && <Badge variant="secondary">Vegan</Badge>}
                      {item.isGlutenFree && (
                        <Badge variant="secondary">Gluten free</Badge>
                      )}
                      {item.preparationTime && (
                        <Badge variant="secondary">
                          {item.preparationTime} min
                        </Badge>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              {!group.items.length && (
                <p className="mt-3 text-slate-500">No available items.</p>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
