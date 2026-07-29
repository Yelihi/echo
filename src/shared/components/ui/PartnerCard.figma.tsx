import figma from "@figma/code-connect";

import { PartnerCard } from "@/shared/components/ui/PartnerCard";

/**
 * Figma: Echo Design System › PartnerCard
 * 세션 화면에서 상대방 대사를 보여주는 글래스 카드.
 */
figma.connect(PartnerCard, "<ECHO_DS>?node-id=36-55", {
  props: {
    role: figma.string("Role"),
    line: figma.string("Line"),
  },
  example: ({ role, line }) => <PartnerCard role={role}>{line}</PartnerCard>,
});
