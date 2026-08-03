import * as React from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SliderField, type SliderFieldProps } from "@/shared/components/ui/SliderField";

type SliderFieldStoryArgs = Pick<
  SliderFieldProps,
  "min" | "max" | "step" | "minLabel" | "midLabel" | "maxLabel"
> & {
  defaultValue: number;
};

const meta = {
  title: "shared/components/ui/SliderField",
  argTypes: {
    defaultValue: { control: { type: "range", min: 0.5, max: 1.25, step: 0.05 } },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
  args: {
    defaultValue: 1,
    min: 0.5,
    max: 1.25,
    step: 0.05,
    minLabel: "천천히",
    midLabel: "보통",
    maxLabel: "빠르게",
  },
  decorators: [
    (Story) => (
      <div className="w-100 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<SliderFieldStoryArgs>;

export default meta;
type Story = StoryObj<SliderFieldStoryArgs>;

/**
 * args 로 초기값을 바꿀 수 있도록 key 로 remount 합니다.
 * (props 를 state 로 복제해 effect 로 동기화하지 않습니다)
 */
function SliderFieldDemo({
  defaultValue,
  min,
  max,
  step,
  minLabel,
  midLabel,
  maxLabel,
}: SliderFieldStoryArgs) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <SliderField
      key={defaultValue}
      label="말하기 속도"
      valueLabel={`${value.toFixed(2)}x`}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={setValue}
      minLabel={minLabel}
      midLabel={midLabel}
      maxLabel={maxLabel}
    />
  );
}

export const Default: Story = {
  render: (args) => <SliderFieldDemo {...args} />,
};
