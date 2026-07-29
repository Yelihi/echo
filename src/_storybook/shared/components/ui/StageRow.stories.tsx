import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StageRow } from "@/shared/components/ui/StageRow";

const meta = {
  title: "shared/components/ui/StageRow",
  component: StageRow,
  globals: {
    backgrounds: { value: "session" },
  },
  argTypes: {
    state: { control: "select", options: ["pending", "active", "done"] },
  },
  args: {
    state: "pending",
    children: "음성을 텍스트로 바꾸는 중",
  },
  decorators: [
    (Story) => (
      <div className="w-90 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StageRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const Active: Story = {
  args: { state: "active" },
};

export const Done: Story = {
  args: { state: "done" },
};

/** 실제 화면에서는 단계 목록으로 쌓입니다. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StageRow state="done">녹음을 불러왔어요</StageRow>
      <StageRow state="active">음성을 텍스트로 바꾸는 중</StageRow>
      <StageRow state="pending">문장별로 비교하는 중</StageRow>
      <StageRow state="pending">피드백을 정리하는 중</StageRow>
    </div>
  ),
};
