import { auth } from "@/auth";
import type { User } from "@/lib/auth/domain";
import { normalizeRole } from "@/lib/auth/domain";

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.email) return null;

  return {
    id: (session as any).userId ?? sessionUser.email,
    name: sessionUser.name ?? sessionUser.email,
    role: normalizeRole((session as any).role),
  };
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireCoachUser(): Promise<User> {
  const user = await requireCurrentUser();
  if (user.role !== "coach") throw new Error("Coach permissions required");
  return user;
}
