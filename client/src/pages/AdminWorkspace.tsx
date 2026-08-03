// apps/web/src/pages/AdminWorkspace.tsx
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ChefHat,
  LayoutDashboard,
  LogOut,
  Users,
  Store,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardOverview from "@/components/admin/DashboardOverview";
import UsersManager from "@/components/admin/UsersManager";
import RestaurantsManager from "@/components/admin/RestaurantsManager";
import OwnerRequestsManager from "@/components/admin/OwnerRequestsManager";
import { useLocale } from "@/contexts/LocaleContext";

// ---------- Admin Workspace (Main) ----------
export default function AdminWorkspace() {
  const [, navigate] = useLocation();
    const { t } = useLocale();

  // Check authentication (admin role guard)

  useEffect(() => {
    if (!localStorage.getItem("restaurant-token")) {
      navigate("/owner/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("restaurant-token");
    localStorage.removeItem("restaurant-user");
    navigate("/");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5fb] p-4 sm:p-7">
      <div className="pointer-events-none fixed -left-40 top-0 size-[30rem] rounded-full bg-indigo-200/45 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 size-[34rem] rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <ChefHat className="size-5" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-indigo-500">
                {t("admin.controlRoom")}
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                {t("admin.panel")}
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl bg-white/70"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 size-4" /> {t("admin.signOut")}
          </Button>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-7">
          <TabsList className="h-auto rounded-2xl bg-white/70 p-1.5">
            <TabsTrigger value="overview" className="rounded-xl px-4">
              <LayoutDashboard />
              {t("admin.tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-4">
              <Users />
              {t("admin.tabs.users")}
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="rounded-xl px-4">
              <Store />
              {t("admin.tabs.rastaurant")}
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl px-4">
              <ClipboardList />
              {t("admin.tabs.requests")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>
          <TabsContent value="users">
            <UsersManager />
          </TabsContent>
          <TabsContent value="restaurants">
            <RestaurantsManager />
          </TabsContent>
          <TabsContent value="requests">
            <OwnerRequestsManager />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
