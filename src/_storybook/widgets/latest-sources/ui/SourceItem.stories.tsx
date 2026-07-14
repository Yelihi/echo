import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MessageSquare, BookOpen } from "lucide-react";

import { SourceItem } from "@/widgets/latest-sources/ui/SourceItem";

const meta = {
  title: "widgets/latest-sources/ui/SourceItem",
  component: SourceItem,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SourceItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RolePlay: Story = {
  args: {
    icon: MessageSquare,
    type: "role-play",
    title: "Role Play",
    subTitle: "2024.01.01",
  },
};

export const Memorization: Story = {
  args: {
    icon: BookOpen,
    type: "memorization",
    title: "Memorization",
    subTitle: "2024.01.01",
  },
};
