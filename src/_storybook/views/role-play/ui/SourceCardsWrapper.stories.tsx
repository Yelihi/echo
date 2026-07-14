import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SourceCardsWrapper } from "@/views/role-play/ui/SourceCardsWrapper";
import { mockSources } from "@/views/role-play/config/mock";

const meta = {
  title: "views/role-play/ui/SourceCardsWrapper",
  component: SourceCardsWrapper,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SourceCardsWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cards: mockSources,
  },
};
