import figma from "@figma/code-connect";

import { ChatBubble } from "@/shared/components/ui/ChatBubble";

/**
 * Figma: Echo Design System › ChatBubble
 * 결과 화면의 읽기 전용 말풍선. 편집용은 ChatBubbleInput 입니다.
 */
figma.connect(ChatBubble, "<ECHO_DS>?node-id=36-73", {
  props: {
    message: figma.string("Message"),
    speaker: figma.enum("Speaker", {
      partner: "partner",
      me: "me",
    }),
  },
  example: ({ message, speaker }) => <ChatBubble speaker={speaker}>{message}</ChatBubble>,
});
