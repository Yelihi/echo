import { Pencil, Trash2 } from "lucide-react";

// widgets
import type { InnerMenuItemProps } from "@/widgets/source-card/models/interface";

// views

export const ROLE_PLAY_ALL_TAG = "전체";

export const ROLE_PLAY_SPEAKER_ONE_NAME = "상대방";
export const ROLE_PLAY_SPEAKER_TWO_NAME = "나";

export const ROLE_PLAY_LIST_PAGE_SIZE = 8;

/** SourceCard h-[220px], grid gap-[15px], ROLE_PLAY_LIST_PAGE_SIZE=8 */
export const ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME =
  "min-h-[1865px] md:min-h-[925px] lg:min-h-[690px] xl:min-h-[455px]";

export const ROLE_PLAY_SOURCE_CARDS_GRID_CLASSNAME = `grid w-full grid-cols-1 gap-[15px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME}`;

export {
  ROLE_PLAY_READY_ROLE_OPTIONS,
  ROLE_PLAY_READY_EVALUATION_MODES,
  ROLE_PLAY_READY_VOICE_OPTIONS,
} from "@/features/roleplay-sessions/config/ready";
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
