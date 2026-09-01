import { Pencil, Trash2 } from "lucide-react";

// widgets
import type { InnerMenuItemProps } from "@/widgets/source-card/models/interface";

// views
import type {
  RoleplayReadyEvaluationMode,
  RoleplayReadyRole,
  RoleplayReadyVoice,
} from "@/views/role-play/models/interface";

export const ROLE_PLAY_ALL_TAG = "전체";

export const ROLE_PLAY_SPEAKER_ONE_NAME = "상대방";
export const ROLE_PLAY_SPEAKER_TWO_NAME = "나";

export const ROLE_PLAY_LIST_PAGE_SIZE = 8;

/** SourceCard h-[220px], grid gap-[15px], ROLE_PLAY_LIST_PAGE_SIZE=8 */
export const ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME =
  "min-h-[1865px] md:min-h-[925px] lg:min-h-[690px] xl:min-h-[455px]";

export const ROLE_PLAY_SOURCE_CARDS_GRID_CLASSNAME = `grid w-full grid-cols-1 gap-[15px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME}`;

export const ROLE_PLAY_READY_ROLE_OPTIONS: Array<{
  value: RoleplayReadyRole;
  title: string;
  description: string;
}> = [
  {
    value: "partner",
    title: "상대방",
    description: "컴퓨터가 읽어요",
  },
  {
    value: "learner",
    title: "나",
    description: "내가 말해요",
  },
];

export const ROLE_PLAY_READY_EVALUATION_MODES: Array<{
  value: RoleplayReadyEvaluationMode;
  title: string;
  description: string;
}> = [
  {
    value: "exact",
    title: "원문 완전 일치",
    description: "대본과 거의 똑같이. 정확한 표현을 또렷이 익혀요.",
  },
  {
    value: "context",
    title: "스크립트 맥락 일치",
    description: "뜻만 통하면 OK. 자연스러운 표현을 자유롭게 연습해요.",
  },
];

export const ROLE_PLAY_READY_VOICE_OPTIONS: Array<{
  value: RoleplayReadyVoice;
  label: string;
  sub: string;
}> = [
  { value: "emma", label: "Emma", sub: "영국 · 여성" },
  { value: "james", label: "James", sub: "미국 · 남성" },
  { value: "sofia", label: "Sofia", sub: "미국 · 여성" },
];

export const ROLE_PLAY_PARTNER_VOICE_TO_OPENAI = {
  emma: "shimmer",
  james: "onyx",
  sofia: "nova",
} as const;

export const ROLE_PLAY_VOICE_PREVIEW_TEXT = "Hi, nice to meet you.";

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
