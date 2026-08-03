import figma from "@figma/code-connect";
import { MessageCircle } from "lucide-react";

import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";

/**
 * Figma: Echo Design System › StatItem
 * 아이콘은 슬롯이라 코드에서 조합합니다.
 */
figma.connect(StatItem, "<ECHO_DS>?node-id=97-8", {
  props: {
    value: figma.string("Value"),
    label: figma.string("Label"),
  },
  example: ({ value, label }) => <StatItem icon={<MessageCircle />} value={value} label={label} />,
});
