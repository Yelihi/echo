import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SessionStateBadge } from "@/shared/components/ui/SessionStateBadge";

const meta = {
  title: "shared/components/ui/SessionStateBadge",
  component: SessionStateBadge,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionStateBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Completed: Story = {
  args: {
    state: "completed",
  },
};

export const Failed: Story = {
  args: {
    state: "failed",
  },
};

export const InProgress: Story = {
  args: {
    state: "inProgress",
  },
};
