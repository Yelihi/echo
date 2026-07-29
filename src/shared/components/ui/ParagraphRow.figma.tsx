import figma from "@figma/code-connect";

import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { ParagraphRow } from "@/shared/components/ui/ParagraphRow";

/**
 * Figma: Echo Design System › ParagraphRow
 *
 * 번호는 목록 위치에서 나오는 값이라 Figma 축이 아닙니다.
 * 본문과 액션은 슬롯이므로 코드에서 조합합니다.
 */
figma.connect(ParagraphRow, "<ECHO_DS>?node-id=70-61", {
  props: {
    mode: figma.enum("Mode", {
      edit: "edit",
      confirmed: "confirmed",
    }),
  },
  example: ({ mode }) => (
    <ParagraphRow index={1} mode={mode}>
      <Textarea rows={2} />
    </ParagraphRow>
  ),
});
