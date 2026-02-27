"use client";

import Link from "next/link";
import Icon from "@/components/icon/Icon";
import { APP_NAV } from "@/lib/nav";
import { useUser } from "@/components/auth/AuthContext";

export default function AppNav({ mode }: { mode: "mobile" | "tablet" | "desktop" }) {
  const { user } = useUser();

  return (
    <>
      {APP_NAV.filter((item) => item.showOn?.[mode] !== false)
        .filter((item) => !item.roles || (user ? item.roles.includes(user.role) : false))
        .map((item) => (
          <Link key={item.id} href={item.href} aria-current={false}>
            <Icon name={item.icon} />
            <span className="navLabel">{item.label}</span>
          </Link>
        ))}
    </>
  );
}
