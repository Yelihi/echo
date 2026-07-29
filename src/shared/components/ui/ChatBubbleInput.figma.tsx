import figma from "@figma/code-connect";

import { ChatBubbleInput } from "@/shared/components/ui/ChatBubbleInput";

/**
 * Figma: Echo Design System › ChatBubbleInput
 * 편집용 말풍선. 결과 화면의 읽기 전용은 ChatBubble 입니다.
 */
figma.connect(ChatBubbleInput, "<ECHO_DS>?node-id=70-6", {
  props: {
    defaultValue: figma.string("Value"),
    speaker: figma.enum("Speaker", {
      partner: "partner",
      me: "me",
    }),
  },
  example: ({ defaultValue, speaker }) => (
    <ChatBubbleInput speaker={speaker} defaultValue={defaultValue} />
  ),
});
