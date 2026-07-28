import figma from "@figma/code-connect";

import { Feedback } from "@/shared/components/ui/Feedback";

/**
 * Figma: Echo Design System › Feedback
 * 본문은 children 으로 받습니다.
 */
figma.connect(Feedback, "<ECHO_DS>?node-id=33-34", {
  props: {
    body: figma.string("Body"),
  },
  example: ({ body }) => <Feedback>{body}</Feedback>,
});
