// apps/web/src/components/owner/OrdersManager.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  XCircle,
  RefreshCw,
  ShoppingBag,
  BellOff,
  Bell,
} from "lucide-react";
import { format } from "date-fns"; // or use your own date formatting
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";

const statusConfig = {
  pending: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: CheckCircle,
  },
  preparing: {
    label: "Preparing",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: ChefHat,
  },
  ready: {
    label: "Ready",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: Truck,
  },
  completed: {
    label: "Completed",
    color:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

const nextStatusMap: Record<string, string[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
};

interface Order {
  _id: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  customerName?: string;
  tableNumber?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface OrdersManagerProps {
  restaurantId: string;
}

export function OrdersManager({ restaurantId }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationEnabled(true);
      } else if (Notification.permission === "denied") {
        setPermissionDenied(true);
      }
    }
  }, []);

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error(t("owner.orders.toast.errNotSupport"));
      return;
    }
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        setNotificationEnabled(true);
        setPermissionDenied(false);
        toast.success(t("owner.orders.toast.notifEnabled"));
      } else {
        setPermissionDenied(true);
        toast.error(t("owner.orders.toast.notifDenied"));
      }
    } catch (err) {
      toast.error(t("owner.orders.toast.couldNotReq"));
    }
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.getOrders(restaurantId, {
        status: statusFilter || undefined,
      });
      console.log(res);

      setOrders(res.orders);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, statusFilter]);

  // Fetch on mount and filter change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Connect to Socket.IO and join restaurant room
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      path: "/socket/",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.emit("join-restaurant", { restaurantId });

    socket.on(
      "newOrder",
      (data: {
        orderId: string;
        total: number;
        itemsCount: number;
        createdAt: string;
      }) => {
        toast.success(
          t("owner.orders.toast.newOrder", {
            itemsCount: data.itemsCount,
            total: data.total,
          })
        );
        // Mark as new to highlight
        setNewOrderIds(prev => new Set(prev).add(data.orderId));
        // Refresh the order list
        fetchOrders();

        // Desktop notification
        if (notificationEnabled) {
          new Notification("📦 New Order Received", {
            body: `${data.itemsCount} items · ${data.total.toLocaleString()} Toman\nJust now`,
            icon: "/logo.png", // optional: add your app icon
            tag: `order-${data.orderId}`, // prevents duplicates
            requireInteraction: false,
          });
        }
      }
    );

    socket.on(
      "orderStatusUpdate",
      (data: { orderId: string; status: string }) => {
        toast(t('owner.orders.toast.orderChanged', {orderId: data.orderId, status: data.status}));
        fetchOrders();
      }
    );

    return () => {
      socket.emit("leave-restaurant", { restaurantId });
      socket.disconnect();
    };
  }, [restaurantId, fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success(t('owner.orders.toast.orderUpdated', {newStatus}));
      // Immediate local update
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getNextActions = (status: string) => nextStatusMap[status] || [];

  if (loading)
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t('owner.orders.loading')}
      </div>
    );

  return (
    <div className={`glass mt-5 p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Orders</h2>
        {/* Toggle notification button */}
        {!notificationEnabled && !permissionDenied && (
          <Button
            variant="ghost"
            size="sm"
            onClick={enableNotifications}
            className="text-xs ml-1"
          >
            <BellOff className="size-4 mr-1" />
            {t('owner.orders.enableAlerts')}
          </Button>
        )}
        {notificationEnabled && (
          <span className="text-xs text-green-600 flex items-center gap-1 ml-1">
            <Bell className="size-3" /> {t('owner.orders.alertsActive')}
          </span>
        )}
        {permissionDenied && (
          <span className="text-xs text-red-500 flex items-center gap-1 ml-2">
            <BellOff className="size-3" /> {t('owner.orders.alertsBlocked')}
          </span>
        )}
        <div className="flex gap-2">
          {[
            "all",
            "pending",
            "accepted",
            "preparing",
            "ready",
            "completed",
            "cancelled",
          ].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-slate-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "bg-white/70 text-slate-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700"
              }`}
            >
              {t('owner.orders.' + s.toLowerCase()) }
            </button>
          ))}
          <Button variant="ghost" size="icon" onClick={fetchOrders}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <ShoppingBag className="size-10 mx-auto mb-3 opacity-50" />
          <p>{t('owner.orders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map(order => {
              const config =
                statusConfig[order.status as keyof typeof statusConfig] ||
                statusConfig.pending;
              const StatusIcon = config.icon;
              const isNew = newOrderIds.has(order._id);

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`rounded-2xl bg-white/70 dark:bg-gray-900 p-4 border dark:border-gray-800 transition-all ${isNew ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""}`}
                  onAnimationEnd={() => {
                    if (isNew) {
                      setNewOrderIds(prev => {
                        const next = new Set(prev);
                        next.delete(order._id);
                        return next;
                      });
                    }
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`flex items-center gap-1 ${config.color}`}
                      >
                        <StatusIcon className="size-3" />
                        {t('owner.orders.'+ config.label.toLowerCase())}
                      </Badge>
                      {order.tableNumber && (
                        <span className="text-xs text-muted-foreground">
                          {t('owner.orders.table')}{order.tableNumber}
                        </span>
                      )}
                      {order.customerName && (
                        <span className="text-xs text-muted-foreground">
                          {order.customerName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, HH:mm")}
                    </span>
                  </div>

                  <ul className="space-y-1 mb-3">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          {(item.price * item.quantity).toLocaleString()} {t("common.currency")}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.notes && (
                    <p className="text-xs text-muted-foreground mb-3 italic">
                      {t('owner.orders.note')} {order.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <strong className="text-lg">
                      {t('owner.orders.total')} {order.total.toLocaleString()} {t("common.currency")}
                    </strong>

                    <div className="flex gap-2">
                      {getNextActions(order.status).map(status => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            status === "cancelled" ? "destructive" : "outline"
                          }
                          onClick={() => handleStatusChange(order._id, status)}
                        >
                          {t('owner.orders.' + status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
