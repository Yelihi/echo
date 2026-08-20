import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MessageSquare, BookOpen } from "lucide-react";

import {
  SOURCE_ITEM_SKELETON_COUNT,
  SourceItem,
  SourceItemSkeleton,
} from "@/widgets/latest-sources/ui/SourceItem";

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

export const Skeleton: StoryObj = {
  render: () => <SourceItemSkeleton />,
};

export const SkeletonList: StoryObj = {
  render: () => (
    <div className="flex w-[360px] flex-col gap-[5px]">
      {Array.from({ length: SOURCE_ITEM_SKELETON_COUNT }, (_, index) => (
        <SourceItemSkeleton key={index} />
      ))}
    </div>
  ),
};
