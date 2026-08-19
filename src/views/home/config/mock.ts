import type { SessionSimplifiedProps } from "@/widgets/latest-sessions/models";

export const HOME_RECENT_SESSIONS: SessionSimplifiedProps[] = [
  {
    title: "카페에서 주문하기",
    sessionDate: new Date("2026-07-31T09:00:00+09:00"),
    description: "문장 8개",
    sessionType: "role-playing",
    sessionState: "completed",
    href: "/roleplay-sessions/11111111-1111-4111-8111-111111111111/result",
  },
  {
    title: "비즈니스 이메일 표현",
    sessionDate: new Date("2026-07-30T09:00:00+09:00"),
    description: "문장 12개",
    sessionType: "memorization",
    sessionState: "inProgress",
    href: "/sentence-memorization/1/session",
  },
  {
    title: "공항 체크인 대화",
    sessionDate: new Date("2026-07-28T09:00:00+09:00"),
    description: "문장 6개",
    sessionType: "role-playing",
    sessionState: "failed",
    href: "/roleplay-sessions/22222222-2222-4222-8222-222222222222/result",
  },
  {
    title: "TED 발췌 · 습관의 힘",
    sessionDate: new Date("2026-07-26T09:00:00+09:00"),
    description: "문장 10개",
    sessionType: "memorization",
    sessionState: "pending",
    disabled: true,
  },
];
