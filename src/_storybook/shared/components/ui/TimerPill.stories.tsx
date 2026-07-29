import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TimerPill } from "@/shared/components/ui/TimerPill";

const meta = {
  title: "shared/components/ui/TimerPill",
  component: TimerPill,
  parameters: {
    backgrounds: { value: "session" },
  },
  argTypes: {
    recording: { control: "boolean" },
  },
  args: {
    recording: true,
    children: "00:12",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimerPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recording: Story = {};

export const Paused: Story = {
  args: { recording: false, children: "01:47" },
};

/** 이미 포맷된 문자열을 받습니다 — 시간 계산·포맷은 호출자 몫입니다. */
export const LongDuration: Story = {
  args: { children: "12:05" },
};
