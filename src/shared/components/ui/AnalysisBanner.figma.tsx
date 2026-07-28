import figma from "@figma/code-connect";

import { AnalysisBanner } from "@/shared/components/ui/AnalysisBanner";

/**
 * Figma: Echo Design System › AnalysisBanner
 * State 축이 그대로 코드 prop 이 됩니다. 문구는 Figma 기본값이 아니라 호출자가 넘깁니다.
 */
figma.connect(AnalysisBanner, "<ECHO_DS>?node-id=33-33", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Description"),
    state: figma.enum("State", {
      pending: "pending",
      analyzing: "analyzing",
      done: "done",
      partial: "partial",
    }),
  },
  example: ({ title, description, state }) => (
    <AnalysisBanner state={state} title={title} description={description} />
  ),
});
