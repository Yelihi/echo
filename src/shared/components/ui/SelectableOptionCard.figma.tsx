import figma from "@figma/code-connect";
import { Target } from "lucide-react";

import { SelectableOptionCard } from "@/shared/components/ui/SelectableOptionCard";

/**
 * Figma: Echo Design System › SelectableOptionCard
 * 순번 배지·추가 콘텐츠는 슬롯이라 Figma 축이 아닙니다.
 */
figma.connect(SelectableOptionCard, "<ECHO_DS>?node-id=97-880", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Description"),
    selected: figma.enum("Selected", {
      true: true,
      false: false,
    }),
  },
  example: ({ title, description, selected }) => (
    <SelectableOptionCard
      icon={<Target />}
      title={title}
      description={description}
      selected={selected}
    />
  ),
});
