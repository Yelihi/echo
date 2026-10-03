"use client";

import { AnimatedMenu } from "@/shared/components/motion/AnimatedMenu";
import React, { useId, useState } from "react";
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
      className="flex min-h-11 w-full items-center rounded-control px-2 text-left transition-colors outline-none hover:bg-gray-background focus-visible:ring-2 focus-visible:ring-brand"
      onClick={handleClick}
    >
      <div className="flex justify-start items-center gap-[5px]">
        <div className="flex justify-center items-center size-10 text-black-primary group-hover:text-brand">
          <Icon className="size-5" />
        </div>
        <span className="text-body-3 font-medium text-black-primary group-hover:text-brand">
          {label}
        </span>
      </div>
    </button>
  );
};

export const Profile = () => {
  const menuId = useId();
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
    <div
      ref={profileRef}
      className="relative z-10 size-11"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsActive(false);
          event.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-label="프로필 메뉴"
        aria-expanded={isActive}
        aria-controls={menuId}
        className="size-full cursor-pointer rounded-full border border-brand bg-brand text-on-brand transition-colors outline-none hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        onClick={toggleProfileMenu}
      >
        <div className="flex size-full items-center justify-center">
          <User className="size-[18px] text-on-brand" />
        </div>
      </button>
      <AnimatedMenu
        open={isActive}
        id={menuId}
        className="absolute right-0 top-full mt-3 w-44 rounded-panel border border-card-line bg-card-surface p-2 shadow-strong"
      >
        {PROFILE_MENU.map((menu) => (
          <ProfileMenuItem {...menu} key={menu.key} onClick={actions[menu.key]} />
        ))}
      </AnimatedMenu>
    </div>
  );
};
