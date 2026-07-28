import figma from "@figma/code-connect";

import { Toggle } from "@/shared/components/ui/toggle";

/**
 * Figma: Echo Design System › Toggle
 * radix Toggle 기반. theme × size × state.
 * Figma의 State는 radix의 pressed 상태에 대응합니다.
 */
figma.connect(Toggle, "<ECHO_DS>?node-id=30-26", {
  props: {
    label: figma.string("Label"),
    theme: figma.enum("Theme", {
      blue: "blue",
      black: "black",
    }),
    size: figma.enum("Size", {
      sm: "sm",
      default: "default",
      lg: "lg",
    }),
    pressed: figma.enum("State", {
      on: true,
      off: false,
    }),
  },
  example: ({ label, theme, size, pressed }) => (
    <Toggle theme={theme} size={size} pressed={pressed}>
      {label}
    </Toggle>
  ),
});
