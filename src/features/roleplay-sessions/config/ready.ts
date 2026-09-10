import type {
  RoleplayReadyRole,
  RoleplayReadyEvaluationMode,
  RoleplayReadyVoice,
} from "../models/ready";
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
