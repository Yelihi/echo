import figma from "@figma/code-connect";

import { Radio, RadioGroup } from "@/shared/components/atomics/radio/Radio";

/**
 * Figma: Echo Design System › Radio
 *
 * Figma 노드는 점 하나지만, Radix 규약상 Radio 는 RadioGroup 없이 존재할 수 없습니다.
 * 그래서 예시는 그룹까지 함께 보여줍니다. 선택 여부는 개별 항목 prop 이 아니라
 * 그룹의 value 로 결정되므로 State 축을 defaultValue 로 매핑합니다.
 */
figma.connect(Radio, "<ECHO_DS>?node-id=30-38", {
  props: {
    defaultValue: figma.enum("State", {
      on: "option",
    }),
  },
  example: ({ defaultValue }) => (
    <RadioGroup defaultValue={defaultValue}>
      <Radio value="option" />
    </RadioGroup>
  ),
});
