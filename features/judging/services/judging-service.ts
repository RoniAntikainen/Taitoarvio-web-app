import type { AppRole, Evaluation, Membership } from "@/domain/models";
import { canCreate } from "@/features/auth/roles";

export function assertCanCreate(role: AppRole) {
  if (!canCreate(role)) throw new Error("Pro-ominaisuus: luonti vaatii valmentajan roolin.");
}

export function inviteCoach(memberships: Membership[], folderId: string, inviterId: string, inviteeId: string) {
  const inviter = memberships.find((m) => m.folderId === folderId && m.userId === inviterId);
  if (!inviter || !["owner", "admin"].includes(inviter.role)) {
    throw new Error("Vain owner/admin voi kutsua valmentajan.");
  }

  return [...memberships, { folderId, userId: inviteeId, role: "coach", invitedBy: inviterId }];
}

export function createEvaluation(role: AppRole, evaluation: Evaluation) {
  assertCanCreate(role);
  return { ...evaluation };
}
