import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProgressTrack } from "@/shared/components/atomics/progress-track/ProgressTrack";

const meta = {
  title: "shared/components/atomics/progress-track/ProgressTrack",
  component: ProgressTrack,
  argTypes: {
    value: {
      control: { type: "number", min: 0, max: 100, step: 5 },
    },
    size: {
      control: "select",
      options: ["sm", "default"],
    },
  },
  args: {
    value: 40,
    size: "default",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressTrack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: 0 },
};

export const Complete: Story = {
  args: { value: 100 },
};

/** 범위를 벗어난 값은 컴포넌트가 렌더 시점에 clamp 합니다. */
export const OutOfRange: Story = {
  args: { value: 140 },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-5">
      <ProgressTrack {...args} value={0} />
      <ProgressTrack {...args} value={40} />
      <ProgressTrack {...args} value={100} />
      <ProgressTrack {...args} value={40} size="sm" />
    </div>
  ),
};
