import figma from "@figma/code-connect";

import { ProgressTrack } from "@/shared/components/atomics/progress-track/ProgressTrack";

/**
 * Figma: Echo Design System › ProgressTrack
 * Figma 의 Progress variant(0/40/100)는 예시 값이며, 코드는 0–100 연속값을 받습니다.
 */
figma.connect(ProgressTrack, "<ECHO_DS>?node-id=33-45", {
  props: {
    value: figma.enum("Progress", {
      "0": 0,
      "40": 40,
      "100": 100,
    }),
  },
  example: ({ value }) => <ProgressTrack value={value} />,
});
