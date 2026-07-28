import figma from "@figma/code-connect";
import { Layers, MessageSquare } from "lucide-react";

import { ListContainer } from "@/widgets/latest-sources/ui/ListContainer";

/**
 * Figma: Echo Design System › ListContainer
 * 제목 + Divider + SourceItem 목록. children은 SourceItem 인스턴스입니다.
 */
figma.connect(ListContainer, "<ECHO_DS>?node-id=37-251", {
  props: {
    title: figma.string("Title"),
    type: figma.enum("Type", {
      "role-play": "role-play",
      memorization: "memorization",
    }),
    icon: figma.enum("Type", {
      "role-play": MessageSquare,
      memorization: Layers,
    }),
    items: figma.children("*"),
  },
  example: ({ title, type, icon, items }) => (
    <ListContainer type={type} icon={icon} title={title}>
      {items}
    </ListContainer>
  ),
});
