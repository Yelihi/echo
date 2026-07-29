import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Layers } from "lucide-react";

import { EditorPanelHeader } from "@/shared/components/ui/EditorPanelHeader";

const meta = {
  title: "shared/components/ui/EditorPanelHeader",
  component: EditorPanelHeader,
  args: {
    title: "새 대화",
    meta: "2개 대사",
  },
  decorators: [
    (Story) => (
      <div className="w-130 overflow-hidden rounded-panel border border-card-line p-0">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditorPanelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: { title: "카페에서 음료 주문하기", meta: "8개 대사" },
};

export const WithoutMeta: Story = {
  args: { meta: undefined },
};

export const MemoIcon: Story = {
  args: { icon: <Layers />, title: "모임 자기소개", meta: "5개 문단" },
};
