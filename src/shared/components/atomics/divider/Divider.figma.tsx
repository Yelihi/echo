import figma from "@figma/code-connect";

import { Divider } from "@/shared/components/atomics/divider/Divider";

/**
 * Figma: Echo Design System › Divider
 * 1px 구분선. 폭은 부모를 채웁니다.
 */
figma.connect(Divider, "<ECHO_DS>?node-id=28-24", {
  example: () => <Divider />,
});
