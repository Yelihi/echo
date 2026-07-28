import figma from "@figma/code-connect";

import { SessionStateBadge } from "@/shared/components/ui/SessionStateBadge";

/**
 * Figma: Echo Design System › SessionStateBadge
 * 라벨이 state에 종속되어 있어 텍스트 프로퍼티가 없습니다.
 */
figma.connect(SessionStateBadge, "<ECHO_DS>?node-id=27-39", {
  props: {
    state: figma.enum("State", {
      completed: "completed",
      failed: "failed",
      inProgress: "inProgress",
    }),
  },
  example: ({ state }) => <SessionStateBadge state={state} />,
});
