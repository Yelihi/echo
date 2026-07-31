import figma from "@figma/code-connect";

import { TagChip } from "@/shared/components/atomics/tag-chip/TagChip";

/**
 * Figma: Echo Design System › TagChip
 * 선택 상태는 호출자가 소유합니다.
 */
figma.connect(TagChip, "<ECHO_DS>?node-id=28-23", {
  props: {
    label: figma.string("Label"),
    selected: figma.enum("Selected", {
      true: true,
      false: false,
    }),
  },
  example: ({ label, selected }) => <TagChip selected={selected}>{label}</TagChip>,
});
