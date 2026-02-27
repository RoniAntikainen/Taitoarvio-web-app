"use client";

import { useUser } from "@/components/auth/AuthContext";

export default function RoleToggle() {
  const { role, setRole, user } = useUser();
  if (!user) return null;

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      Rooli
      <select
        className="input"
        value={role}
        onChange={(e) => setRole(e.target.value === "coach" ? "coach" : "student")}
      >
        <option value="student">Student (FREE)</option>
        <option value="coach">Coach (PRO)</option>
      </select>
    </label>
  );
}
