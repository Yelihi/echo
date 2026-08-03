import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MessageCircle, Target } from "lucide-react";

import { SelectableOptionCard } from "@/shared/components/ui/SelectableOptionCard";

const meta = {
  title: "shared/components/ui/SelectableOptionCard",
  component: SelectableOptionCard,
  globals: {
    backgrounds: { value: "app" },
  },
  argTypes: {
    selected: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    icon: <Target />,
    title: "목표 기반 평가",
    description: "대화의 목적을 달성했는지로 평가해요",
    selected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-100 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SelectableOptionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

/** 문장 암기 연습 모드처럼 순번 배지가 아이콘 위에 겹치는 경우 */
export const WithBadge: Story = {
  args: {
    icon: <MessageCircle />,
    badge: "①",
    title: "문단 단위로 암기하기",
    description: "문단을 하나씩 순서대로 암기해요",
  },
};

/** 설명 아래에 추가 콘텐츠(예: 번역 준비 중 로딩)를 끼워 넣는 경우 */
export const WithExtra: Story = {
  args: {
    extra: <p className="mt-1.5 text-body-1 text-gray-text-secondary">번역 준비 중…</p>,
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <SelectableOptionCard {...args} selected={false} />
      <SelectableOptionCard {...args} selected={true} />
    </div>
  ),
};
