import figma from "@figma/code-connect";

import { EmptyState } from "@/shared/components/ui/EmptyState";

/**
 * Figma: Echo Design System › EmptyState
 * Figma 의 액션 버튼은 슬롯이라 코드에서 조합합니다.
 */
figma.connect(EmptyState, "<ECHO_DS>?node-id=34-2", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Description"),
  },
  example: ({ title, description }) => <EmptyState title={title} description={description} />,
});
