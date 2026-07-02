import Link from "next/link";
import { Pluse } from "@/shared/components";

import { NavigationMenuItem } from "@/widgets/navigation/ui/NavigationMenuItem";
import { Profile } from "@/widgets/navigation/ui/Profile";
import { NAVIGATION_MENU } from "@/widgets/navigation/config/const";

export const NavigationContainer = () => {
  return (
    <nav className="bg-white-secondary flex justify-center items-center w-full h-full p-[15px] border-b border-gray-border">
      <div className="w-full max-w-[1280px] flex justify-between items-center">
        <div className="flex justify-start items-center gap-[20px]">
          <Link className="flex justify-center items-center gap-[10px]" href="/home">
            <div className="size-[32px] rounded-[10px] bg-blue-primary flex justify-center items-center">
              <Pluse className="size-[20px] text-white" />
            </div>
            <p className="text-heading-sm font-extrabold text-black-primary">Echo</p>
          </Link>
          <div className="flex justify-start items-center w-full gap-[10px]">
            {NAVIGATION_MENU.map((menu) => {
              return <NavigationMenuItem {...menu} key={menu.link} />;
            })}
          </div>
        </div>
        <div className="size-fit">
          <Profile />
        </div>
      </div>
    </nav>
  );
};
