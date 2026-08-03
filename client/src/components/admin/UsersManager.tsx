import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";

const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";



  // ---------- Users Management ----------
  export default function UsersManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLocale();

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
      if (!confirm(t("admin.users.deleteConfirm"))) return;
      try {
        await api.admin.deleteUser(id);
        toast.success(t("admin.users.deleteOk"));
        fetchUsers();
      } catch (err: any) {
        toast.error(err.message);
      }
    };
  
    if (loading) return <div className="p-8 text-center">Loading users…</div>;
  
    return (
      <section className={`${glass} mt-5 p-6`}>
        <h2 className="font-display text-2xl font-semibold">{t("admin.users.title")}</h2>
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
  