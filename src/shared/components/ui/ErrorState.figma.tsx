import figma from "@figma/code-connect";

import { ErrorState } from "@/shared/components/ui/ErrorState";

/**
 * Figma: Echo Design System › ErrorState
 * 재시도 버튼은 슬롯이라 코드에서 조합합니다 (Figma 기준 outline).
 */
figma.connect(ErrorState, "<ECHO_DS>?node-id=34-22", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Description"),
  },
  example: ({ title, description }) => <ErrorState title={title} description={description} />,
});
