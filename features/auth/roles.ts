import type { AppRole } from "@/domain/models";

export function getRoleLabel(role: AppRole) {
  return role === "coach" ? "Valmentaja (PRO)" : "Oppilas (FREE)";
}

export function canCreate(role: AppRole) {
  return role === "coach";
}

export function canComment(role: AppRole) {
  return role === "coach" || role === "student";
}

export function roleBadgeTone(role: AppRole) {
  return role === "coach" ? "roleBadge roleBadge--pro" : "roleBadge roleBadge--free";
}
