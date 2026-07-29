import figma from "@figma/code-connect";

import { GlassButton } from "@/shared/components/ui/GlassButton";

/**
 * Figma: Echo Design System › GlassButton
 * 세션 다크 스테이지 전용입니다. 일반 화면은 Button 을 쓰세요.
 */
figma.connect(GlassButton, "<ECHO_DS>?node-id=36-68", {
  props: {
    label: figma.string("Label"),
    emphasis: figma.enum("Emphasis", {
      secondary: "secondary",
      primary: "primary",
    }),
  },
  example: ({ label, emphasis }) => <GlassButton emphasis={emphasis}>{label}</GlassButton>,
});
