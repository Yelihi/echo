"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/utils/cn";
import type { NavigationMenuItemProps } from "@/widgets/navigation/models/interface";

export const NavigationMenuItem = ({ icon: Icon, link, label }: NavigationMenuItemProps) => {
  const isCurrentHref = link === usePathname();
  return (
    <Link
      href={link}
      aria-current={isCurrentHref ? "page" : undefined}
      className="flex justify-center items-center shrink-0"
    >
      <button
        className={cn(
          "w-fit px-3 h-[33px] rounded-chip group  flex justify-center items-center gap-[10px] hover:bg-blue-secondary active:scale-98 transition-all duration-100 cursor-pointer",
          "whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-primary",
          isCurrentHref ? "bg-blue-secondary" : "bg-white-secondary",
        )}
      >
        <Icon
          className={cn(
            "size-[18px] shrink-0 group-hover:text-blue-primary",
            isCurrentHref ? "text-blue-primary" : "text-gray-text",
          )}
        />
        <span
          className={cn(
            "text-body-2 font-normal group-hover:text-blue-primary",
            isCurrentHref ? "text-blue-primary" : "text-gray-text",
          )}
        >
          {label}
        </span>
      </button>
    </Link>
  );
};
