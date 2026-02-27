import { Role } from "@/lib/domain/judging/types";

export const permissionsByRole: Record<Role, string[]> = {
  student: ["session.read", "session.practice", "comment.write"],
  coach: [
    "session.read",
    "session.practice",
    "comment.write",
    "workspace.manage",
    "session.create",
    "session.lock",
    "coach.invite",
  ],
};

export function can(role: Role, permission: string) {
  return permissionsByRole[role].includes(permission);
}
