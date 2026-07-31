"use client";

import Link from "next/link";
import { Pluse } from "@/shared/components";

import { NavigationMenuItem } from "@/widgets/navigation/ui/NavigationMenuItem";
import { Profile } from "@/widgets/navigation/ui/Profile";
import { NAVIGATION_MENU } from "@/widgets/navigation/config/const";

export const NavigationContainer = () => {
  return (
    <nav
      aria-label="주요 메뉴"
      className="bg-white-secondary flex justify-center items-center w-full h-full p-[15px] border-b border-gray-border"
    >
      <div className="w-full max-w-[1280px] flex justify-between items-center gap-[10px]">
        {/* min-w-0 이 없으면 좁은 화면에서 메뉴가 Profile 을 밀어냅니다 */}
        <div className="flex justify-start items-center gap-[20px] min-w-0">
          <Link className="flex justify-center items-center gap-[10px] shrink-0" href="/home">
            <div className="size-[32px] rounded-chip bg-blue-primary flex justify-center items-center">
              <Pluse className="size-[20px] text-white" />
            </div>
            <p className="text-heading-sm font-extrabold text-black-primary">Echo</p>
          </Link>
          {/* 줄바꿈 대신 가로 스크롤로 넘깁니다 (스크롤바는 숨김) */}
          <div className="flex justify-start items-center gap-[10px] min-w-0 overflow-x-auto scrollbar-none">
            {NAVIGATION_MENU.map((menu) => {
              return <NavigationMenuItem {...menu} key={menu.link} />;
            })}
          </div>
        </div>
        <div className="size-fit shrink-0">
          <Profile />
        </div>
      </div>
    </nav>
  );
};
