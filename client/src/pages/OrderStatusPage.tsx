import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  XCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-700", icon: Clock },
  accepted:   { label: "Accepted",   color: "bg-blue-100 text-blue-700",   icon: CheckCircle },
  preparing:  { label: "Preparing",  color: "bg-orange-100 text-orange-700", icon: ChefHat },
  ready:      { label: "Ready",      color: "bg-green-100 text-green-700",  icon: Truck },
  completed:  { label: "Completed",  color: "bg-slate-100 text-slate-700", icon: CheckCircle },
  cancelled:  { label: "Cancelled",  color: "bg-red-100 text-red-700",     icon: XCircle },
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

export default function OrderStatusPage() {
  const [, params] = useRoute("/order/:orderId");
  const orderId = params?.orderId;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useLocale();

  useEffect(() => {
    if (!orderId) return;
    api.getOrderPublic(orderId)
      .then((res) => {
         setOrder(res);
        
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full text-center">
          <XCircle className="size-12 mx-auto text-red-500" />
          <h2 className="text-2xl font-bold mt-4">{t('notFound.pageNotFound')}</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Link href="/">
            <Button className="mt-6" variant="outline">
              <ArrowLeft className="size-4 mr-2" /> {t('common.backToMenu')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const paymentMethod = order.payment?.method;
  const paymentStatus = order.payment?.status;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4 mr-1" /> {t('common.backToMenu')}
        </Link>

        <div className="glass-card p-8 rounded-3xl">
          <div className="text-center mb-8">
            <ShoppingBag className="size-12 mx-auto text-indigo-500 mb-3" />
            <h1 className="text-3xl font-bold">{t("common.order")} #{order._id.slice(-6)}</h1>
            <p className="text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Status badges */}
          <div className="flex justify-center gap-3 mb-6">
            <Badge className={`flex items-center gap-1 px-3 py-1.5 ${status.color}`}>
              <StatusIcon className="size-4" />
              {status.label}
            </Badge>
            {order.deliveryOption === 'delivery' && (
              <Badge variant="outline" className="px-3 py-1.5">
                {t('restaurant.delivery')}
              </Badge>
            )}
          </div>

          {/* Items list */}
          <div className="space-y-2 mb-6">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                </div>
                <span className="text-muted-foreground">
                  {(item.price * item.quantity).toLocaleString()} {t('common.currency')}
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between text-lg font-bold mb-6 pt-4 border-t">
            <span>{t('restaurant.total')}</span>
            <span>{order.total.toLocaleString()} {t('common.currency')}</span>
          </div>

          {/* Payment info */}
          {paymentMethod && (
            <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {paymentMethod === 'zarinpal' ? 'زرین‌پال' : 'Stripe'}
                </span>
                <Badge className={paymentStatus === t("common.paid") ? 'bg-green-100 text-green-700' : paymentStatus === t("common.failed") ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                  {paymentStatusLabels[paymentStatus] || paymentStatus}
                </Badge>
              </div>
            </div>
          )}

          {/* Delivery address (if applicable) */}
          {order.deliveryOption === 'delivery' && order.deliveryAddress && (
            <div className="text-sm text-muted-foreground mb-4">
              <strong>{t('restaurant.delivery')}</strong> {order.deliveryAddress}
            </div>
          )}

          <div className="text-center mt-6">
            <Link href={`/r/${order.restaurant}`}>
              <Button variant="outline">{t('restaurant.backToRest')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}