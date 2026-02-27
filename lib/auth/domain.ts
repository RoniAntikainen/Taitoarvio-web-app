export type Role = "student" | "coach";

export type User = {
  id: string;
  name: string;
  role: Role;
};

export function normalizeRole(role: unknown): Role {
  return role === "coach" ? "coach" : "student";
}
