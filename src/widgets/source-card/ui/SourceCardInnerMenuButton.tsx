"use client";

import { useId, useState } from "react";
import { EllipsisVertical } from "lucide-react";

// shared
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { cn } from "@/shared/utils/cn";

// widgets
import {
  type InnerMenuContainerProps,
  type InnerMenuItemProps,
  type SourceCardInnerMenuButtonProps,
} from "@/widgets/source-card/models/interface";

const InnerMenuContainer = ({ children, isOpen }: InnerMenuContainerProps) => {
  return (
    isOpen && (
      <div className="absolute right-0 top-full z-20 mt-2 min-w-44 rounded-panel border border-card-line bg-card-surface p-2 shadow-strong">
        {children}
      </div>
    )
  );
};

const InnerMenuItem = ({ value, text, icon: Icon, theme, onClick }: InnerMenuItemProps) => {
  return (
    <button
      type="button"
      className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-control px-3 py-2 transition-colors outline-none hover:bg-gray-background focus-visible:ring-2 focus-visible:ring-brand"
      onClick={(event) => {
        event.stopPropagation();
        onClick(value);
      }}
    >
      <div className="flex justify-center items-center">
        <Icon
          className={cn(
            "size-[16px]",
            theme === "destructive" ? "text-danger-ink" : "text-black-primary",
          )}
        />
      </div>
      <p
        className={cn(
          "text-body-3 font-semibold",
          theme === "destructive" ? "text-danger-ink" : "text-black-primary",
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
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const innerMenuRef = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const toggleInnerMenu = () => {
    setOpen((prev) => !prev);
  };

  const handleMenuClick = (value: string) => () => {
    onMenuAction(value, id);
    setOpen(false);
  };

  return (
    <div
      ref={innerMenuRef}
      className="relative shrink-0"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          event.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        className="flex size-9 cursor-pointer items-center justify-center rounded-pill border border-card-line transition-colors outline-none hover:bg-gray-background focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        onClick={toggleInnerMenu}
        aria-expanded={open}
        aria-label="자료 메뉴"
        aria-controls={menuId}
      >
        <EllipsisVertical className="size-[16px] text-black-secondary" />
      </button>
      <InnerMenuContainer isOpen={open}>
        <div id={menuId}>
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
        </div>
      </InnerMenuContainer>
    </div>
  );
};
