import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Waveform } from "@/shared/components/ui/Waveform";

const meta = {
  title: "shared/components/ui/Waveform",
  component: Waveform,
  parameters: {
    backgrounds: { value: "session" },
  },
  argTypes: {
    tone: { control: "select", options: ["accent", "recording"] },
  },
  args: {
    tone: "accent",
  },
  decorators: [
    (Story) => (
      <div className="w-60 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Waveform>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Recording: Story = {
  args: { tone: "recording" },
};

/** 레벨은 호출자가 계산해 넘깁니다 — 컴포넌트는 오디오에 접근하지 않습니다. */
export const CustomLevels: Story = {
  args: { levels: [10, 30, 90, 45, 70, 20, 55, 85, 35, 60] },
};

export const Quiet: Story = {
  args: { levels: [8, 12, 10, 14, 9, 11, 13, 10, 8, 12] },
};
