import { FolderOpenDot, Home, Layers, ListChecks, MessageSquare } from "lucide-react";

import type { NavigationMenuItemProps } from "@/widgets/navigation/models/interface";

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
    icon: ListChecks,
    link: "/sessions",
    label: "학습 기록",
  },
  {
    icon: FolderOpenDot,
    link: "/recording-management",
    label: "녹음 관리",
  },
];
