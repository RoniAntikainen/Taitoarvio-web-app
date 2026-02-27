import { redirect } from "next/navigation";
import type { Role } from "@/lib/auth/domain";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user || user.role !== role) {
    redirect("/app/dashboard");
  }
  return user;
}
