import type { Role } from "@/lib/auth/domain";

export type Mode = "mobile" | "tablet" | "desktop";

export type IconName =
  | "home"
  | "library"
  | "bell"
  | "chart"
  | "users"
  | "calendar"
  | "settings"
  | "shield"
  | "file"
  | "clipboard"
  | "star"
  | "search"
  | "plus"
  | "activity"
  | "database"
  | "help";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  showOn?: Partial<Record<Mode, boolean>>;
  roles?: Role[];
};

export const APP_NAV: NavItem[] = [
  { id: "home", label: "Koti", href: "/app/dashboard", icon: "home" },
  { id: "exercises", label: "Harjoitteet", href: "/app/harjoitteet", icon: "library" },
  {
    id: "sessions",
    label: "Sessiot",
    href: "/app/sessions",
    icon: "calendar",
    showOn: { mobile: false, tablet: true, desktop: true },
    roles: ["coach"],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/app/settings",
    icon: "settings",
    showOn: { mobile: false, tablet: true, desktop: true },
  },
];
