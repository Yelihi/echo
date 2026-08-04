import { Pencil, Trash2 } from "lucide-react";

import type { InnerMenuItemProps } from "@/widgets/source-card/models/interface";
import type {
  RoleplayReadyEvaluationMode,
  RoleplayReadyRole,
  RoleplayReadyVoice,
} from "@/views/role-play/models/ready";

export const ROLE_PLAY_READY_ROLE_OPTIONS: Array<{
  value: RoleplayReadyRole;
  title: string;
  description: string;
}> = [
  {
    value: "learner",
    title: "내가 손님 역할",
    description: "상대방 말을 듣고 내가 응답합니다.",
  },
  {
    value: "partner",
    title: "내가 상대 역할",
    description: "대화 흐름을 바꿔 반대 역할로 연습합니다.",
  },
];

export const ROLE_PLAY_READY_EVALUATION_MODES: Array<{
  value: RoleplayReadyEvaluationMode;
  title: string;
  description: string;
}> = [
  {
    value: "exact",
    title: "정확도 중심",
    description: "스크립트와 얼마나 일치하는지 비교합니다.",
  },
  {
    value: "context",
    title: "맥락 중심",
    description: "의미가 자연스럽게 전달됐는지 봅니다.",
  },
];

export const ROLE_PLAY_READY_VOICE_OPTIONS: Array<{
  value: RoleplayReadyVoice;
  label: string;
  sub: string;
}> = [
  { value: "soft", label: "Soft", sub: "차분한 톤" },
  { value: "bright", label: "Bright", sub: "밝은 톤" },
  { value: "calm", label: "Calm", sub: "느린 톤" },
];

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
