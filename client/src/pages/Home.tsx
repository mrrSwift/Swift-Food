import { api, type Restaurant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChefHat, MapPin, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .restaurants(search)
      .then(data => setRestaurants(data.restaurants))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <main className="min-h-screen bg-[#f4f4fa] p-5 sm:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-white">
              <ChefHat />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold text-slate-900">
                Restaurant Finder
              </h1>
              <p className="text-sm text-slate-500">Explore local menus</p>
            </div>
          </div>
          <Link href="/owner/login">
            <Button className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">
              Owner login
            </Button>
          </Link>
        </header>
        <div className="mt-10 rounded-[28px] bg-white/75 p-6 shadow-sm sm:p-9">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-900">
            Find your next table
          </h2>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4">
            <Search className="size-5 text-slate-400" />
            <input
              value={search}
              onChange={event => {
                setLoading(true);
                setSearch(event.target.value);
              }}
              placeholder="Search restaurants or cuisines"
              className="h-13 w-full bg-transparent outline-none"
            />
          </div>
        </div>
        {error && (
          <p className="mt-6 rounded-xl bg-rose-50 p-4 text-rose-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-8 text-slate-500">Loading restaurants…</p>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map(restaurant => (
              <Link key={restaurant._id} href={`/r/${restaurant._id}`}>
                <article className="group h-full rounded-[26px] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="grid aspect-[1.4/1] place-items-center rounded-[18px] bg-gradient-to-br from-emerald-100 to-indigo-100 text-slate-500">
                    {restaurant.logo ? (
                      <img
                        src={"http://127.0.0.1:3000"+restaurant.logo}
                        className="size-full rounded-[18px] object-cover"
                      />
                    ) : (
                      <ChefHat className="size-11" />
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-slate-900">
                    {restaurant.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {restaurant.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" /> {restaurant.address}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-4 fill-amber-400 text-amber-400" />{" "}
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}
        {!loading && !restaurants.length && (
          <p className="mt-8 text-center text-slate-500">
            No active restaurants found.
          </p>
        )}
      </div>
    </main>
  );
}
