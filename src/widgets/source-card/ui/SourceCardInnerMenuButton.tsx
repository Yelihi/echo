"use client";

import { useState } from "react";
import { EllipsisVertical } from "lucide-react";

import { cn } from "@/shared/utils/cn";
import { useClickOutside } from "@/shared/hooks/useClickOutside";

import {
  type InnerMenuContainerProps,
  type InnerMenuItemProps,
  type SourceCardInnerMenuButtonProps,
} from "@/widgets/source-card/models/interface";

const InnerMenuContainer = ({ children, isOpen }: InnerMenuContainerProps) => {
  return (
    isOpen && (
      <div className="absolute top-9 right-1 bg-white shadow-md rounded-[20px] w-full min-w-[150px] h-fit p-[6px] z-10">
        {children}
      </div>
    )
  );
};

const InnerMenuItem = ({ value, text, icon: Icon, theme, onClick }: InnerMenuItemProps) => {
  return (
    <button
      className="w-full h-fit min-h-[36px] flex justify-start items-center py-[9px] px-[11px] gap-[10px] hover:shadow-md transition-all duration-300 cursor-pointer rounded-[9px]"
      onClick={() => onClick(value)}
    >
      <div className="flex justify-center items-center">
        <Icon
          className={cn(
            "size-[16px]",
            theme === "destructive" ? "text-red-primary" : "text-black-primary",
          )}
        />
      </div>
      <p
        className={cn(
          "text-body-3 font-semibold",
          theme === "destructive" ? "text-red-primary" : "text-black-primary",
        )}
      >
        {text}
      </p>
    </button>
  );
};

export const SourceCardInnerMenuButton = ({
  id,
  onMenuAction,
  innerMenuItems,
}: SourceCardInnerMenuButtonProps) => {
  const [open, setOpen] = useState(false);
  const innerMenuRef = useClickOutside<HTMLButtonElement>(() => setOpen(false));

  const toggleInnerMenu = () => {
    setOpen((prev) => !prev);
  };

  const handleMenuClick = (value: string) => () => {
    onMenuAction(value, id);
    setOpen(false);
  };

  return (
    <button
      ref={innerMenuRef}
      className="relative size-[32px] flex justify-center items-center rounded-[11px] hover:bg-gray-background cursor-pointer transition-all duration-300"
      onClick={toggleInnerMenu}
    >
      <EllipsisVertical className="size-[16px] text-black-secondary" />
      <InnerMenuContainer isOpen={open}>
        {innerMenuItems.map((item) => (
          <InnerMenuItem
            key={item.value}
            value={item.value}
            text={item.text}
            icon={item.icon}
            theme={item.theme}
            onClick={handleMenuClick(item.value)}
          />
        ))}
      </InnerMenuContainer>
    </button>
  );
};
