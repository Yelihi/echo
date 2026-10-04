import { LogOut } from "lucide-react";
import type { ProfileMenuItem, ProfileMenuKey } from "../models/profile";

export const PROFILE_MENU: ProfileMenuItem[] = [
  {
    key: "logout",
    icon: LogOut,
    label: "계정 전환",
  },
];

export type { ProfileMenuKey };
