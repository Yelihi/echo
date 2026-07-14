import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SessionIntroCard } from "@/widgets/session-intro-card/ui/SessionIntroCard";

const meta = {
  title: "widgets/session-intro-card/ui/SessionIntroCard",
  component: SessionIntroCard,
  decorators: [
    (Story) => (
      <div className="w-[320px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionIntroCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RolePlay: Story = {
  args: {
    type: "role-play",
    currentSessions: 12,
  },
};

export const Memorization: Story = {
  args: {
    type: "memorization",
    currentSessions: 8,
  },
};
