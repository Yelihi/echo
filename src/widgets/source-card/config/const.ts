import { Pencil, Trash2 } from "lucide-react";

import type { InnerMenuItemProps } from "@/widgets/source-card/models/interface";

export const SOURCE_CARD_INNER_MENU: Omit<InnerMenuItemProps, "onClick">[] = [
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
