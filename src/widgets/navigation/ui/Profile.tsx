"use client";

import React, { useState } from "react";
import { User } from "lucide-react";

import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { useLogout } from "@/features/logout/services/service/useLogout";
import type { ProfileMenuItemProps } from "@/widgets/navigation/models/interface";
import { PROFILE_MENU, ProfileMenuKey } from "@/widgets/navigation/config/const";

export const ProfileMenuItem = ({ icon: Icon, label, onClick }: ProfileMenuItemProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <button
      className="flex justify-between items-center w-full h-fit p-[2px] group cursor-pointer hover:bg-blue-secondary bg-white-secondary border-b border-gray-text-secondary last:border-none first:rounded-t-md last:rounded-b-md"
      onClick={handleClick}
    >
      <div className="flex justify-start items-center gap-[5px]">
        <div className="flex justify-center items-center size-10 text-black-primary group-hover:text-blue-primary">
          <Icon className="size-6" />
        </div>
        <span className="text-body-3 font-medium text-black-primary group-hover:text-blue-primary">
          {label}
        </span>
      </div>
    </button>
  );
};

export const Profile = () => {
  const [isActive, setIsActive] = useState(false);
  const profileRef = useClickOutside<HTMLDivElement>(() => setIsActive(false));
  const { requestLogout } = useLogout();

  const actions = {
    settings: () => {
      setIsActive(false);
    },
    logout: () => {
      requestLogout();
      setIsActive(false);
    },
  } satisfies Record<ProfileMenuKey, () => void>;

  const toggleProfileMenu = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <div ref={profileRef} className="relative size-[34px] z-10">
      <button
        className="size-full rounded-full border border-blue-primary p-[1px] cursor-pointer hover:shadow-lg transition-all duration-100 active:scale-95"
        onClick={toggleProfileMenu}
      >
        <div className="bg-blue-primary rounded-full flex justify-center items-center size-full">
          <User className="size-[18px] text-white" />
        </div>
      </button>
      {isActive && (
        <div className="absolute top-full right-0 translate-y-[5px] min-[1400px]:right-auto min-[1400px]:left-1/2 min-[1400px]:-translate-x-1/2 w-[150px] h-fit bg-white-secondary rounded-md shadow-md">
          {PROFILE_MENU.map((menu) => (
            <ProfileMenuItem {...menu} key={menu.key} onClick={actions[menu.key]} />
          ))}
        </div>
      )}
    </div>
  );
};
