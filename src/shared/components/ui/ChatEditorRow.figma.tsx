import figma from "@figma/code-connect";

import { ChatBubbleInput } from "@/shared/components/ui/ChatBubbleInput";
import { ChatEditorRow } from "@/shared/components/ui/ChatEditorRow";

/**
 * Figma: Echo Design System › ChatEditorRow
 *
 * 말풍선은 children 슬롯이라 코드에서 조합합니다.
 * 화자 라벨 문구도 props 이므로 Figma 축과 함께 넘겨줍니다.
 */
figma.connect(ChatEditorRow, "<ECHO_DS>?node-id=70-29", {
  props: {
    speaker: figma.enum("Speaker", {
      partner: "partner",
      me: "me",
    }),
    speakerLabel: figma.enum("Speaker", {
      partner: "상대방",
      me: "나",
    }),
  },
  example: ({ speaker, speakerLabel }) => (
    <ChatEditorRow speaker={speaker} speakerLabel={speakerLabel}>
      <ChatBubbleInput speaker={speaker} />
    </ChatEditorRow>
  ),
});
