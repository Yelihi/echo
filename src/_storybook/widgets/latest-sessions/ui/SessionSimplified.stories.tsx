import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";

const meta = {
  title: "widgets/latest-sessions/ui/SessionSimplified",
  component: SessionSimplified,
  decorators: [
    (Story) => (
      <div className="w-[1020px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionSimplified>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RolePlaying: Story = {
  args: {
    title: "카페에서 주문하기",
    sessionDate: new Date(),
    description: "역할극 연습",
    sessionType: "role-playing",
    sessionState: "completed",
  },
};

export const Memorization: Story = {
  args: {
    title: "비즈니스 표현 암기",
    sessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    description: "문장 암기",
    sessionType: "memorization",
    sessionState: "failed",
  },
};
