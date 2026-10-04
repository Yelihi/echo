import type { LucideIcon } from "lucide-react";

export type ProfileMenuKey = "settings" | "logout";

export interface ProfileMenuItem {
  key: ProfileMenuKey;
  icon: LucideIcon;
  label: string;
}

export interface ProfileMenuItemProps extends ProfileMenuItem {
  onClick: () => void;
}
