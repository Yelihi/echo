import figma from "@figma/code-connect";

import { TagInput } from "@/shared/components/ui/TagInput";

/**
 * Figma: Echo Design System › TagInput
 *
 * 태그 목록과 추가/삭제 규칙은 호출자가 소유하므로 Figma 축은 테마뿐입니다.
 */
figma.connect(TagInput, "<ECHO_DS>?node-id=69-27", {
  props: {
    theme: figma.enum("Theme", {
      roleplay: "roleplay",
      memo: "memo",
    }),
  },
  example: ({ theme }) => (
    <TagInput theme={theme} tags={["일상", "초급"]} placeholder="태그 입력 후 Enter" />
  ),
});
