// apps/web/src/components/admin/UsersManager.tsx
import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Trash2, UserPlus } from "lucide-react";

const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

export function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [resetUser, setResetUser] = useState<any | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [tempPassword, setTempPassword] = useState("");

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

  // Create user
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createUser(addForm);
      toast.success("User created");
      setShowAdd(false);
      setAddForm({ name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Edit user
  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.admin.updateUser(editingUser._id, editForm);
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Reset password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    try {
      await api.admin.resetUserPassword(resetUser._id, tempPassword);
      toast.success("Password reset");
      setResetUser(null);
      setTempPassword("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Delete user
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

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading users…
      </div>
    );
  }

  return (
    <section className={`${glass} mt-5 p-10`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-semibold">
          Registered Users
        </h2>
        <Button onClick={() => setShowAdd(true)}>
          <UserPlus className="size-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <div className="space-y-4">
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
            <div className="flex items-center gap-2">
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
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingUser(user);
                  setEditForm({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                  });
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setResetUser(user);
                  setTempPassword("");
                }}
              >
                Reset
              </Button>
              <Button
                size="icon"
                variant="ghost"
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

      {/* Add User Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Admin"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            placeholder="Name"
            value={addForm.name}
            onChange={e => setAddForm({ ...addForm, name: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={addForm.email}
            onChange={e => setAddForm({ ...addForm, email: e.target.value })}
            required
          />
          <Input
            placeholder="Password"
            type="password"
            value={addForm.password}
            onChange={e => setAddForm({ ...addForm, password: e.target.value })}
            required
          />
          <select
            value={addForm.role}
            onChange={e => setAddForm({ ...addForm, role: e.target.value })}
            className="h-10 rounded-xl border bg-white/50 px-3 w-full"
          >
            <option value="admin">Admin</option>
            <option value="r_owner">Owner</option>
          </select>
          <Button type="submit" className="w-full">
            Create User
          </Button>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            placeholder="Name"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={editForm.email}
            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
          <select
            value={editForm.role}
            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
            className="h-10 rounded-xl border bg-white/50 px-3 w-full"
          >
            <option value="admin">Admin</option>
            <option value="r_owner">Owner</option>
          </select>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetUser}
        onClose={() => setResetUser(null)}
        title="Reset Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set a temporary password for <strong>{resetUser?.name}</strong>.
            They will be forced to change it on next login.
          </p>
          <Input
            type="password"
            placeholder="Temporary password"
            value={tempPassword}
            onChange={e => setTempPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </Modal>
    </section>
  );
}
