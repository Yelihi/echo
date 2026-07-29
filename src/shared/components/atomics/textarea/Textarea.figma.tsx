import figma from "@figma/code-connect";

import { Textarea } from "@/shared/components/atomics/textarea/Textarea";

/**
 * Figma: Echo Design System › Textarea
 * 높이는 호출자가 rows 나 className 으로 정합니다.
 */
figma.connect(Textarea, "<ECHO_DS>?node-id=69-3", {
  props: {
    placeholder: figma.string("Value"),
  },
  example: ({ placeholder }) => <Textarea placeholder={placeholder} rows={6} />,
});
