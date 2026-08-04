import { BookOpen, Languages, Pencil, Trash2, Type } from "lucide-react";

import type { InnerMenuItemProps } from "@/widgets/source-card/models/interface";
import type { MemorizationReadyMode } from "@/views/memorization/models/ready";

export const MEMORIZATION_READY_MODE_OPTIONS: Array<{
  value: MemorizationReadyMode;
  title: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    value: "read",
    title: "본문 보고 말하기",
    description: "원문을 보며 전체 문단을 한 번에 녹음합니다.",
    icon: BookOpen,
  },
  {
    value: "translate",
    title: "번역 보고 말하기",
    description: "한국어 힌트를 보고 영어 문장을 회상합니다.",
    icon: Languages,
  },
  {
    value: "title",
    title: "제목만 보고 말하기",
    description: "제목만 보고 전체 흐름을 떠올립니다.",
    icon: Type,
  },
];

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
