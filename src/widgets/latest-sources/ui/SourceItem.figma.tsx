import figma from "@figma/code-connect";
import { Layers, MessageSquare } from "lucide-react";

import { SourceItem } from "@/widgets/latest-sources/ui/SourceItem";

/**
 * Figma: Echo Design System › SourceItem
 * 최근 학습 자료 행. 아이콘은 Figma에서 INSTANCE_SWAP이지만 코드에서는
 * LucideIcon 컴포넌트를 받으므로 type에 따라 매핑합니다.
 */
figma.connect(SourceItem, "<ECHO_DS>?node-id=37-197", {
  props: {
    title: figma.string("Title"),
    subTitle: figma.string("Subtitle"),
    type: figma.enum("Type", {
      "role-play": "role-play",
      memorization: "memorization",
    }),
    icon: figma.enum("Type", {
      "role-play": MessageSquare,
      memorization: Layers,
    }),
  },
  example: ({ title, subTitle, type, icon }) => (
    <SourceItem icon={icon} type={type} title={title} subTitle={subTitle} />
  ),
});
