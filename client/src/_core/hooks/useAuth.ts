import { api, type User } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("restaurant-user") ?? "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("restaurant-token"))
  );
  const refresh = useCallback(async () => {
    if (!localStorage.getItem("restaurant-token")) {
      setLoading(false);
      return null;
    }
    try {
      const result = await api.me();
      setUser(result.user);
      localStorage.setItem("restaurant-user", JSON.stringify(result.user));
      return result.user;
    } catch {
      localStorage.removeItem("restaurant-token");
      localStorage.removeItem("restaurant-user");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const logout = useCallback(() => {
    localStorage.removeItem("restaurant-token");
    localStorage.removeItem("restaurant-user");
    setUser(null);
  }, []);
  return {
    user,
    loading,
    error: null,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };
}
