import figma from "@figma/code-connect";

import { Chip } from "@/shared/components/atomics/chip/Chip";

/**
 * Figma: Echo Design System › Chip
 * 읽기 전용 표시. 누를 수 있는 필터는 TagChip 입니다.
 */
figma.connect(Chip, "<ECHO_DS>?node-id=28-18", {
  props: {
    label: figma.string("Label"),
    tone: figma.enum("Tone", {
      neutral: "neutral",
      accent: "accent",
      roleplay: "roleplay",
      memo: "memo",
      positive: "positive",
      warning: "warning",
      negative: "negative",
      outline: "outline",
    }),
  },
  example: ({ label, tone }) => <Chip tone={tone}>{label}</Chip>,
});
