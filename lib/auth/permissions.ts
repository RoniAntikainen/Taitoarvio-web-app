import type { Role, User } from "@/lib/auth/domain";

export function hasRole(user: User | null | undefined, role: Role) {
  if (!user) return false;
  return user.role === role;
}

export function canCreateSession(user: User | null | undefined) {
  return hasRole(user, "coach");
}

export function canManageWorkspace(user: User | null | undefined) {
  return hasRole(user, "coach");
}
