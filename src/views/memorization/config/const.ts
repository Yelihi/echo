import { Pencil, Trash2 } from "lucide-react";

import type { InnerMenuItemProps } from "@/widgets/source-card/models/interface";

export const MEMORIZATION_ALL_TAG = "전체";

export const MEMORIZATION_LIST_PAGE_SIZE = 8;

export const MEMORIZATION_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME = "min-h-64";

export const MEMORIZATION_SOURCE_CARDS_GRID_CLASSNAME = `grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3 ${MEMORIZATION_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME}`;

export { MEMORIZATION_READY_MODE_OPTIONS } from "@/features/memorization-sessions/config/ready";
export const MEMORIZATION_INNER_MENU_ITEMS: Array<Omit<InnerMenuItemProps, "onClick">> = [
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
