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
};

export const APP_NAV: NavItem[] = [
  { id: "home", label: "Home / Dashboard", href: "/app", icon: "home" },
  { id: "folders", label: "Kansiot", href: "/app/folders", icon: "library" },
  { id: "evaluations", label: "Arvioinnit", href: "/app/evaluations", icon: "clipboard" },
  { id: "judging", label: "Harjoittelu", href: "/app/judging", icon: "chart" },
  {
    id: "settings",
    label: "Asetukset",
    href: "/app/settings",
    icon: "settings",
    showOn: { mobile: false, tablet: true, desktop: true },
  },
];
