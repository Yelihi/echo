import figma from "@figma/code-connect";

import { SliderField } from "@/shared/components/ui/SliderField";

/**
 * Figma: Echo Design System › SliderField
 * range 조작은 코드에서만 가능해 Figma 는 트랙의 정적 모습만 보여줍니다.
 */
figma.connect(SliderField, "<ECHO_DS>?node-id=97-820", {
  props: {
    label: figma.string("Label"),
    valueLabel: figma.string("Value"),
  },
  example: ({ label, valueLabel }) => (
    <SliderField
      label={label}
      valueLabel={valueLabel}
      min={0.5}
      max={1.25}
      step={0.05}
      value={1}
      onChange={() => {}}
      minLabel="천천히"
      midLabel="보통"
      maxLabel="빠르게"
    />
  ),
});
