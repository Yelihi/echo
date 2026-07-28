import figma from "@figma/code-connect";

import { Input } from "@/shared/components/atomics/input/Input";

/**
 * Figma: Echo Design System › Input
 *
 * Figma 의 State 축(default/focus/error/disabled)은 코드에서 하나로 대응하지 않습니다.
 * error 만 시각 variant 이고, focus 는 :focus-visible, disabled 는 네이티브 속성입니다.
 * 그래서 같은 State 를 두 프로퍼티로 나눠 매핑합니다.
 */
figma.connect(Input, "<ECHO_DS>?node-id=30-35", {
  props: {
    placeholder: figma.string("Value"),
    state: figma.enum("State", {
      error: "error",
    }),
    disabled: figma.enum("State", {
      disabled: true,
    }),
  },
  example: ({ placeholder, state, disabled }) => (
    <Input placeholder={placeholder} state={state} disabled={disabled} />
  ),
});
