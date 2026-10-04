import type { MyPageMaterialItem } from "@/views/my-page/models/interface";
import type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";
export const roleplay: MyPageMaterialItem[] = [
  {
    id: "cafe",
    title: "Ordering at a Cafe",
    description: "카페에서 주문하기",
    date: new Date("2026-10-03T03:00:00Z"),
    href: "/role-playing/cafe/ready",
  },
  {
    id: "weekend",
    title: "A Weekend Plan",
    description: "주말 계획 이야기하기",
    date: new Date("2026-10-01T03:00:00Z"),
    href: "/role-playing/weekend/ready",
  },
];
export const memorization: MyPageMaterialItem[] = [
  {
    id: "habit",
    title: "A Small Daily Habit",
    description: "작은 습관이 만드는 변화",
    date: new Date("2026-10-02T03:00:00Z"),
    href: "/sentence-memorization/habit/ready",
  },
  {
    id: "practice",
    title: "The Value of Practice",
    description: "연습의 가치",
    date: new Date("2026-09-30T03:00:00Z"),
    href: "/sentence-memorization/practice/ready",
  },
];
export const sessions: GetLatestStudySession[] = [
  {
    id: "cafe-result",
    title: "Ordering at a Cafe",
    sessionDate: new Date("2026-10-03T03:00:00Z"),
    description: "롤플레잉",
    sessionType: "role-playing",
    sessionState: "completed",
    href: "/roleplay-sessions/cafe-result/result",
    actionLabel: "결과 보기",
  },
  {
    id: "habit-session",
    title: "A Small Daily Habit",
    sessionDate: new Date("2026-10-02T03:00:00Z"),
    description: "문단 암기",
    sessionType: "memorization",
    sessionState: "practicing",
    href: "/sentence-memorization/habit/session/habit-session",
    actionLabel: "이어서 연습",
  },
];
