"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/utils/cn";
import type { NavigationMenuItemProps } from "@/widgets/navigation/models/interface";

export const NavigationMenuItem = ({ icon: Icon, link, label }: NavigationMenuItemProps) => {
  const pathname = usePathname();
  const isCurrentHref = link === "/home" ? pathname === link : pathname.startsWith(link);

  return (
    <Link
      href={link}
      aria-current={isCurrentHref ? "page" : undefined}
      className={cn(
        "flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill border px-4 text-body-2 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        isCurrentHref
          ? "border-brand bg-brand text-on-brand hover:bg-brand-hover"
          : "border-control-line bg-card-surface text-gray-text hover:border-brand hover:text-brand",
      )}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
};
