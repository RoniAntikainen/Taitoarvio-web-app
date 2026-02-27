"use client";

import type { Role } from "@/lib/auth/domain";
import { useUser } from "@/components/auth/AuthContext";

export default function RequireRole({
  role,
  children,
  fallback = null,
}: {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useUser();
  if (!user || user.role !== role) return <>{fallback}</>;
  return <>{children}</>;
}
