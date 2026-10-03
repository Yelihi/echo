"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/utils/cn";
import type { NavigationMenuItemProps } from "@/widgets/navigation/models/interface";

export const NavigationMenuItem = ({ icon: Icon, link, label }: NavigationMenuItemProps) => {
  const pathname = usePathname();
  const isCurrentHref =
    pathname === link ||
    (link !== "/home" && pathname.startsWith(`${link}/`)) ||
    (link === "/sessions" && /^\/(roleplay-sessions|memorization-sessions)\//.test(pathname));

  return (
    <Link
      href={link}
      aria-current={isCurrentHref ? "page" : undefined}
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-control border-l-2 px-3 text-body-3 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        isCurrentHref
          ? "border-brand bg-brand/5 text-brand-hover font-medium"
          : "border-transparent text-gray-text hover:bg-gray-background hover:text-black-primary",
      )}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
};
