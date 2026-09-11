"use client";

import Link from "next/link";
import { Pluse } from "@/shared/components";

import { NavigationMenuItem } from "@/widgets/navigation/ui/NavigationMenuItem";
import { Profile } from "@/widgets/navigation/ui/Profile";
import { NAVIGATION_MENU } from "@/widgets/navigation/config/const";

export const NavigationContainer = () => {
  return (
    <nav aria-label="주요 메뉴" className="w-full border-b border-card-line bg-card-surface">
      <div className="mx-auto grid w-full max-w-page grid-cols-[1fr_auto] items-center gap-x-6 gap-y-4 px-page-gutter py-4 lg:grid-cols-[auto_1fr_auto] lg:py-6">
        <Link
          className="flex w-fit items-center gap-2 rounded-pill outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
          href="/home"
        >
          <span aria-hidden>
            <Pluse className="size-6 text-brand" />
          </span>
          <span className="text-heading-md font-extrabold tracking-tight text-brand">Echo</span>
        </Link>
        <div className="col-span-2 row-start-2 flex min-w-0 gap-1 overflow-x-auto p-1 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-center">
          {NAVIGATION_MENU.map((menu) => (
            <NavigationMenuItem {...menu} key={menu.link} />
          ))}
        </div>
        <div className="col-start-2 row-start-1 justify-self-end lg:col-start-3">
          <Profile />
        </div>
      </div>
    </nav>
  );
};
