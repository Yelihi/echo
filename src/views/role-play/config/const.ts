import { Pencil, Trash2 } from "lucide-react";

import { InnerMenuItemProps } from "@/widgets/source-card/models/interface";

export const ROLE_PLAY_INNER_MENU_ITEMS: Array<Omit<InnerMenuItemProps, "onClick">> = [
  {
    value: "edit",
    text: "수정",
    icon: Pencil,
    theme: "default",
  },
  {
    value: "delete",
    text: "삭제",
    icon: Trash2,
    theme: "destructive",
  },
];
