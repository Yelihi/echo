import figma from "@figma/code-connect";

import { Badge } from "@/shared/components/atomics/badge/Badge";

/**
 * Figma: Echo Design System › Badge
 * 읽기 전용 카테고리 / 상태 라벨. theme × size.
 */
figma.connect(Badge, "<ECHO_DS>?node-id=27-32", {
  props: {
    value: figma.string("Label"),
    theme: figma.enum("Theme", {
      blue: "blue",
      red: "red",
      green: "green",
      yellow: "yellow",
      black: "black",
    }),
    size: figma.enum("Size", {
      small: "small",
      medium: "medium",
      large: "large",
    }),
  },
  example: ({ value, theme, size }) => <Badge value={value} theme={theme} size={size} />,
});
