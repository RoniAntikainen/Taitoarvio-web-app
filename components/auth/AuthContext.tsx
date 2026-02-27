"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Role, User } from "@/lib/auth/domain";
import { normalizeRole } from "@/lib/auth/domain";

type AuthContextValue = {
  user: User | null;
  role: Role;
  setRole: (role: Role) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "taitoarvio-dev-role";

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) {
  const [role, setRoleState] = useState<Role>(initialUser?.role ?? "student");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setRoleState(normalizeRole(saved));
  }, []);

  const setRole = (nextRole: Role) => {
    setRoleState(nextRole);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextRole);
    }
  };

  const user = useMemo<User | null>(() => {
    if (!initialUser) return null;
    return { ...initialUser, role };
  }, [initialUser, role]);

  return <AuthContext.Provider value={{ user, role, setRole }}>{children}</AuthContext.Provider>;
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUser must be used inside AuthProvider");
  return ctx;
}
