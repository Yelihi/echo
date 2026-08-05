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
  { value: "soft", label: "Emma", sub: "영국 · 여성" },
  { value: "bright", label: "James", sub: "미국 · 남성" },
  { value: "calm", label: "Sofia", sub: "미국 · 여성" },
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
