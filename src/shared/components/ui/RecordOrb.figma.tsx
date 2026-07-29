import figma from "@figma/code-connect";

import { RecordOrb } from "@/shared/components/ui/RecordOrb";

/**
 * Figma: Echo Design System › RecordOrb
 * 녹음 상태는 호출자가 소유합니다.
 */
figma.connect(RecordOrb, "<ECHO_DS>?node-id=36-20", {
  props: {
    state: figma.enum("State", {
      idle: "idle",
      recording: "recording",
      analyzing: "analyzing",
    }),
  },
  example: ({ state }) => <RecordOrb state={state} />,
});
