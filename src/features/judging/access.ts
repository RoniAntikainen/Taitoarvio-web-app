import { Role } from "@/src/domain/models";

export const featureFlags = {
  allowStudentComments: true,
  allowCoachWorkspaceManagement: true,
  enableQuickMode: true,
  enableDeepMode: true,
};

export function canCreateSession(role: Role): boolean {
  return role === "coach" && featureFlags.allowCoachWorkspaceManagement;
}

export function canManageWorkspace(role: Role): boolean {
  return role === "coach";
}

export function canComment(role: Role): boolean {
  return role === "student" || role === "coach";
}
