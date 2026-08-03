import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";

const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

// ---------- Owner Requests ----------
export default function OwnerRequestsManager() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

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
    if (!confirm(t("admin.requests.acceptConfirm"))) return;
    try {
      await api.admin.acceptOwnerRequest(id);
      toast.success(t("admin.requests.acceptOk"));
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDecline = async (id: string) => {
    if (!confirm(t("admin.requests.declineConfirm"))) return;
    try {
      await api.admin.declineOwnerRequest(id);
      toast.success(t("admin.requests.declineOk"));
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests…</div>;

  return (
    <section className={`${glass} mt-5 p-6`}>
      <h2 className="font-display text-2xl font-semibold">
        {t("admin.requests.title")}
      </h2>
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
                    <CheckCircle className="size-4 mr-1" />{" "}
                    {t("admin.requests.accepted")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleDecline(req._id)}
                  >
                    <XCircle className="size-4 mr-1" />{" "}
                    {t("admin.requests.declined")}
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
