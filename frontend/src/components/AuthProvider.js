"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout as logoutRequest, refreshSession } from "@/lib/auth";

const AuthContext = createContext(null);

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const loadUser = useCallback(async () => {
    setAuthError("");

    try {
      const data = await getMe();
      setUser(data.user);
      return data.user;
    } catch (error) {
      if (error.status !== 401) {
        setUser(null);
        setAuthError("We couldn't verify your account. Check your connection and try again.");
        throw error;
      }

      try {
        await refreshSession();
        const data = await getMe();
        setUser(data.user);
        return data.user;
      } catch (refreshError) {
        if (refreshError.status === 401) {
          setUser(null);
          return null;
        }

        setUser(null);
        setAuthError("We couldn't verify your account. Check your connection and try again.");
        throw refreshError;
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      let currentUser;

      try {
        currentUser = await loadUser();
      } catch {
        if (active) {
          setLoading(false);
        }
        return;
      }

      if (!active) {
        return;
      }

      setLoading(false);

      const isPublic = PUBLIC_PATHS.includes(pathname);

      if (!currentUser && pathname.startsWith("/dashboard")) {
        router.replace("/login");
      }

      if (currentUser && (pathname === "/login" || pathname === "/register")) {
        router.replace("/dashboard");
      }

      if (!isPublic && !currentUser && !pathname.startsWith("/dashboard")) {
        return;
      }
    };

    boot();

    return () => {
      active = false;
    };
  }, [loadUser, pathname, router]);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      setUser,
      refreshUser: loadUser,
      logout,
    }),
    [user, loading, authError, loadUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
