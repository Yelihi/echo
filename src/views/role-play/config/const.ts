import type { RoleplayEditorDraft } from "../models/interface";
import { Pencil, Trash2 } from "lucide-react";

// widgets
import type { InnerMenuItemProps } from "@/widgets/source-card/models/interface";
import type { MaterialLibraryHeaderProps } from "@/widgets/material-library/models/interface";

// views

export const ROLE_PLAY_ALL_TAG = "전체";

export const ROLE_PLAY_SPEAKER_ONE_NAME = "상대방";
export const ROLE_PLAY_SPEAKER_TWO_NAME = "나";

export const ROLE_PLAY_LIST_PAGE_SIZE = 8;

export const ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME = "min-h-64";

export const ROLE_PLAY_SOURCE_CARDS_GRID_CLASSNAME = `grid w-full grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3 ${ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME}`;

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

export const rolePlayLibraryHeader = {
  eyebrow: "ROLEPLAY",
  title: "롤플레잉",
  description: "연습하고 싶은 대화를 고르고, 나의 말로 시작해보세요.",
  createHref: "/role-playing/new",
} satisfies MaterialLibraryHeaderProps;

export const ROLE_PLAY_EDITOR_EMPTY_DRAFT: RoleplayEditorDraft = {
  title: "",
  situation: "",
  tags: [],
  lines: [],
};
