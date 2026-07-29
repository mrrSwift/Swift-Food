// apps/web/src/pages/AdminWorkspace.tsx
import { useEffect, useState, FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  ChefHat,
  LayoutDashboard,
  LogOut,
  Users,
  Store,
  ClipboardList,
  CheckCircle,
  XCircle,
  Trash2,
  Mail,
  Phone,
  Building,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

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

// ---------- Dashboard (Overview) ----------
function DashboardOverview() {
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

// ---------- Users Management ----------
function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.admin.getUsers();
      setUsers(res.users || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await api.admin.deleteUser(id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading users…</div>;

  return (
    <section className={`${glass} mt-5 p-6`}>
      <h2 className="font-display text-2xl font-semibold">Registered Users</h2>
      <div className="mt-5 space-y-4">
        {users.map(user => (
          <div
            key={user._id}
            className="flex items-center justify-between rounded-2xl bg-white/70 p-4"
          >
            <div className="flex items-center gap-3">
              <User className="size-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }
              >
                {user.role}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => handleDelete(user._id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-muted-foreground text-center">No users found.</p>
        )}
      </div>
    </section>
  );
}

// ---------- Restaurants Management ----------
function RestaurantsManager() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Delete this restaurant and all its data?")) return;
    try {
      await api.admin.deleteRestaurant(id);
      toast.success("Restaurant deleted");
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading restaurants…</div>;

  return (
    <section className={`${glass} mt-5 p-6`}>
      <h2 className="font-display text-2xl font-semibold">All Restaurants</h2>
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
                {r.isActive ? "Active" : "Inactive"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleActive(r._id, r.isActive)}
              >
                {r.isActive ? "Deactivate" : "Activate"}
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

// ---------- Owner Requests ----------
function OwnerRequestsManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.admin.getOwnerRequests();
      setRequests(res || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    if (
      !confirm(
        "Accept this request? It will create a new owner account and restaurant."
      )
    )
      return;
    try {
      await api.admin.acceptOwnerRequest(id);
      toast.success("Owner account created");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm("Decline this request?")) return;
    try {
      await api.admin.declineOwnerRequest(id);
      toast.success("Request declined");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests…</div>;

  return (
    <section className={`${glass} mt-5 p-6`}>
      <h2 className="font-display text-2xl font-semibold">Owner Requests</h2>
      <div className="mt-5 space-y-4">
        {requests.map(req => (
          <div key={req._id} className="rounded-2xl bg-white/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{req.restaurantName}</h3>
                  <Badge
                    className={
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : req.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {req.description}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Building className="size-3" /> {req.restaurantName}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {req.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" /> {req.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" /> {req.phone}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Requested on {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>
              {req.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() => handleAccept(req._id)}
                  >
                    <CheckCircle className="size-4 mr-1" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleDecline(req._id)}
                  >
                    <XCircle className="size-4 mr-1" /> Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-muted-foreground text-center">No requests yet.</p>
        )}
      </div>
    </section>
  );
}

// ---------- Admin Workspace (Main) ----------
export default function AdminWorkspace() {
  const [, navigate] = useLocation();

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
                Admin control room
              </p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                Admin Panel
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl bg-white/70"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-7">
          <TabsList className="h-auto rounded-2xl bg-white/70 p-1.5">
            <TabsTrigger value="overview" className="rounded-xl px-4">
              <LayoutDashboard />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-4">
              <Users />
              Users
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="rounded-xl px-4">
              <Store />
              Restaurants
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl px-4">
              <ClipboardList />
              Requests
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
