import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";

const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";




// ---------- Restaurants Management ----------
export default function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

  const fetchRestaurants = async () => {
    try {
      const res = await api.admin.getRestaurants();
      setRestaurants(res.restaurants || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.admin.updateRestaurantStatus(id, !current);
      toast.success("Status updated");
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.restaurant.deleteConfirm"))) return;
    try {
      await api.admin.deleteRestaurant(id);
      toast.success(t("admin.restaurant.deleteOk"));
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading restaurants…</div>;

  return (
    <section className={`${glass} mt-5 p-6`}>
      <h2 className="font-display text-2xl font-semibold">{t("admin.restaurant.title")}</h2>
      <div className="mt-5 space-y-4">
        {restaurants.map(r => (
          <div
            key={r._id}
            className="flex items-center justify-between rounded-2xl bg-white/70 p-4"
          >
            <div>
              <p className="font-semibold">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  r.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              >
                {r.isActive ? t("admin.restaurant.active") : t("admin.restaurant.inactive")}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleActive(r._id, r.isActive)}
              >
                {r.isActive ? t("admin.restaurant.deactivate") : t("admin.restaurant.deactivete")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => handleDelete(r._id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {restaurants.length === 0 && (
          <p className="text-muted-foreground text-center">
            No restaurants found.
          </p>
        )}
      </div>
    </section>
  );
}