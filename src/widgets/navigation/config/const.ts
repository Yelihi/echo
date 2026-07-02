import { Home, MessageSquare, Layers, FolderOpenDot, Settings, LogOut } from "lucide-react";

import type {
  NavigationMenuItemProps,
  ProfileMenuItem,
  ProfileMenuKey,
} from "@/widgets/navigation/models/interface";

export const NAVIGATION_MENU: NavigationMenuItemProps[] = [
  {
    icon: Home,
    link: "/home",
    label: "홈",
  },
  {
    icon: MessageSquare,
    link: "/role-playing",
    label: "롤플레잉",
  },
  {
    icon: Layers,
    link: "/sentence-memorization",
    label: "문장 암기",
  },
  {
    icon: FolderOpenDot,
    link: "/recording-management",
    label: "녹음 관리",
  },
];

export const PROFILE_MENU: ProfileMenuItem[] = [
  {
    key: "settings",
    icon: Settings,
    label: "개인 설정",
  },
  {
    key: "logout",
    icon: LogOut,
    label: "계정 전환",
  },
];

export type { ProfileMenuKey };
