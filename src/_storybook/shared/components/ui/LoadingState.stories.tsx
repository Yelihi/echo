import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoadingState } from "@/shared/components/ui/LoadingState";

const meta = {
  title: "shared/components/ui/LoadingState",
  component: LoadingState,
  args: {
    title: "불러오는 중이에요",
    description: "잠시만 기다려 주세요.",
  },
  decorators: [
    (Story) => (
      <div className="w-110 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  args: { description: undefined },
};

export const Analyzing: Story = {
  args: {
    title: "녹음을 분석하고 있어요",
    description: "문장 수에 따라 최대 1분 정도 걸릴 수 있어요.",
  },
};
