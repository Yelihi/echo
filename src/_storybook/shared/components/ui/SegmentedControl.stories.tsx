import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { SegmentedControl, SegmentedControlItem } from "@/shared/components/ui/SegmentedControl";

type SegmentedControlStoryArgs = {
  size: "sm" | "default" | "lg";
  disabled: boolean;
  options: string[];
};

const meta = {
  title: "shared/components/ui/SegmentedControl",
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    size: "default",
    disabled: false,
    options: ["롤플레이", "암기"],
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<SegmentedControlStoryArgs>;

export default meta;

type Story = StoryObj<SegmentedControlStoryArgs>;

/**
 * Radix single 토글 그룹은 같은 항목을 다시 누르면 빈 문자열을 보냅니다.
 * 세그먼트는 해제가 없어야 하므로 호출자 쪽에서 막습니다 — 컴포넌트에 로직을 넣지 않습니다.
 */
function SegmentedControlDemo({ size, disabled, options }: SegmentedControlStoryArgs) {
  const [value, setValue] = React.useState(options[0]);

  return (
    <SegmentedControl
      size={size}
      disabled={disabled}
      value={value}
      onValueChange={(next) => next && setValue(next)}
    >
      {options.map((option) => (
        <SegmentedControlItem key={option} value={option}>
          {option}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

export const Default: Story = {
  render: (args) => <SegmentedControlDemo {...args} />,
};

export const ThreeOptions: Story = {
  args: { options: ["전체", "롤플레이", "암기"] },
  render: (args) => <SegmentedControlDemo {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <SegmentedControlDemo {...args} />,
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControlDemo {...args} size="sm" />
      <SegmentedControlDemo {...args} size="default" />
      <SegmentedControlDemo {...args} size="lg" />
    </div>
  ),
};
