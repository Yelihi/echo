import figma from "@figma/code-connect";

import { TitleField } from "@/shared/components/atomics/title-field/TitleField";

/**
 * Figma: Echo Design System › TitleField
 * 에디터 상단 제목 입력. 일반 폼에는 Input 을 쓰세요.
 */
figma.connect(TitleField, "<ECHO_DS>?node-id=69-5", {
  props: {
    placeholder: figma.string("Value"),
  },
  example: ({ placeholder }) => <TitleField placeholder={placeholder} />,
});
