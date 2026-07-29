import figma from "@figma/code-connect";

import { Spinner } from "@/shared/components/atomics/spinner/Spinner";

/**
 * Figma: Echo Design System › Spinner
 * Figma 는 32px 한 종류만 있고, 코드의 size 축은 재사용을 위한 확장입니다.
 */
figma.connect(Spinner, "<ECHO_DS>?node-id=33-46", {
  example: () => <Spinner />,
});
