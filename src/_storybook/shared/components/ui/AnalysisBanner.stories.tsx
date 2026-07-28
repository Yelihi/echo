import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/shared/components/atomics/button/Button";
import { AnalysisBanner } from "@/shared/components/ui/AnalysisBanner";

const meta = {
  title: "shared/components/ui/AnalysisBanner",
  component: AnalysisBanner,
  argTypes: {
    state: {
      control: "select",
      options: ["pending", "analyzing", "done", "partial"],
    },
  },
  args: {
    state: "pending",
    title: "분석 대기 중",
    description: "녹음을 분석할 준비가 되었어요.",
  },
  decorators: [
    (Story) => (
      <div className="w-130 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnalysisBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const Analyzing: Story = {
  args: {
    state: "analyzing",
    title: "AI가 녹음을 듣고 있어요",
    description: "방금 말한 문장들을 천천히 살펴보는 중이에요.",
  },
};

export const Done: Story = {
  args: {
    state: "done",
    title: "분석이 끝났어요",
    description: "아래에서 문장별 결과를 확인해 보세요.",
  },
};

export const Partial: Story = {
  args: {
    state: "partial",
    title: "일부 문장을 분석하지 못했어요",
    description: "네트워크 문제로 분석이 멈췄어요. 다시 시도할 수 있어요.",
  },
};

/** 액션은 슬롯이라 버튼 종류·문구·핸들러를 호출자가 정합니다. */
export const WithAction: Story = {
  args: {
    state: "partial",
    title: "일부 문장을 분석하지 못했어요",
    description: "네트워크 문제로 분석이 멈췄어요.",
    action: <Button size="sm">다시 분석</Button>,
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <AnalysisBanner
        {...args}
        state="pending"
        title="분석 대기 중"
        description="녹음을 분석할 준비가 되었어요."
      />
      <AnalysisBanner
        {...args}
        state="analyzing"
        title="AI가 녹음을 듣고 있어요"
        description="천천히 살펴보는 중이에요."
      />
      <AnalysisBanner
        {...args}
        state="done"
        title="분석이 끝났어요"
        description="문장별 결과를 확인해 보세요."
      />
      <AnalysisBanner
        {...args}
        state="partial"
        title="일부 문장을 분석하지 못했어요"
        description="다시 시도할 수 있어요."
      />
    </div>
  ),
};
