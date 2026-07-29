import { useEffect, useState } from "react";
import {
  Users,
  Store,
  ClipboardList,
} from "lucide-react";
import { api } from "@/lib/api";
import Stat from "@/components/Stat";

const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";


  // ---------- Dashboard (Overview) ----------
  export default function DashboardOverview() {
    const [stats, setStats] = useState({
      totalUsers: 0,
      totalRestaurants: 0,
      pendingRequests: 0,
      totalOrders: 0,
    });
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const [usersRes, restaurantsRes, requestsRes] = await Promise.all([
            api.admin.getUsers(),
            api.admin.getRestaurants(),
            api.admin.getOwnerRequests(),
          ]);
          setStats({
            totalUsers: usersRes.users?.length ?? 0,
            totalRestaurants: restaurantsRes.restaurants?.length ?? 0,
            pendingRequests: requestsRes.filter(
              (r: any) => r.status === "pending"
            ).length,
            totalOrders: 0, // you can extend with an orders count endpoint
          });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }, []);
  
    if (loading)
      return (
        <div className="p-8 text-center text-muted-foreground">
          Loading dashboard…
        </div>
      );
  
    return (
      <section className={`${glass} mt-5 p-6 sm:p-8`}>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-500">
          Admin overview
        </p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
          Platform Dashboard
        </h2>
        <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-4">
          <Stat label="Total Users" value={stats.totalUsers} icon={<Users />} />
          <Stat
            label="Restaurants"
            value={stats.totalRestaurants}
            icon={<Store />}
          />
          <Stat
            label="Pending Requests"
            value={stats.pendingRequests}
            icon={<ClipboardList />}
          />
          <Stat
            label="Total Orders"
            value={stats.totalOrders}
            icon={<ClipboardList />}
          />
        </div>
      </section>
    );
  }