import figma from "@figma/code-connect";

import { LoadingState } from "@/shared/components/ui/LoadingState";

/**
 * Figma: Echo Design System › LoadingState
 * 일러스트 자리에는 Spinner 가 들어갑니다. 액션은 없습니다.
 */
figma.connect(LoadingState, "<ECHO_DS>?node-id=34-40", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Description"),
  },
  example: ({ title, description }) => <LoadingState title={title} description={description} />,
});
