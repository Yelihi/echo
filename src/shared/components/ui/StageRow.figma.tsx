import figma from "@figma/code-connect";

import { StageRow } from "@/shared/components/ui/StageRow";

/**
 * Figma: Echo Design System › StageRow
 * 분석 진행 단계 한 줄. 세션 다크 스테이지 위에서 쓰입니다.
 */
figma.connect(StageRow, "<ECHO_DS>?node-id=36-54", {
  props: {
    label: figma.string("Label"),
    state: figma.enum("State", {
      pending: "pending",
      active: "active",
      done: "done",
    }),
  },
  example: ({ label, state }) => <StageRow state={state}>{label}</StageRow>,
});
