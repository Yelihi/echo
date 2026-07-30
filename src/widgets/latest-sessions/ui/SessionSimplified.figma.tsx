import figma from "@figma/code-connect";

import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";

/**
 * Figma: Echo Design System › RecentSessionCard
 *
 * 이슈 #31 은 이 역할을 RecentSessionCard 라 부르지만, 구현은 이 위젯을 정본으로 씁니다.
 * 날짜는 Date 를 받아 위젯 내부에서 포맷합니다(Figma 의 Meta 텍스트에 대응하는
 * 단일 prop 이 없는 이유입니다).
 */
figma.connect(SessionSimplified, "<ECHO_DS>?node-id=31-123", {
  props: {
    title: figma.string("Title"),
    sessionType: figma.enum("Kind", {
      roleplay: "role-playing",
      memo: "memorization",
    }),
    sessionState: figma.enum("Status", {
      done: "completed",
      partial: "failed",
      analyzing: "inProgress",
    }),
  },
  example: ({ title, sessionType, sessionState }) => (
    <SessionSimplified
      title={title}
      sessionDate={new Date()}
      description="문장 8개"
      sessionType={sessionType}
      sessionState={sessionState}
    />
  ),
});
