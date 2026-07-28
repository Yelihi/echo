import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus, Search } from "lucide-react";

import { Button } from "@/shared/components/atomics/button/Button";
import { EmptyState } from "@/shared/components/ui/EmptyState";

const meta = {
  title: "shared/components/ui/EmptyState",
  component: EmptyState,
  args: {
    title: "아직 학습 자료가 없어요",
    description: "첫 롤플레이 대본이나 암기 지문을 만들어 연습을 시작해 보세요.",
  },
  decorators: [
    (Story) => (
      <div className="w-110 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 액션은 슬롯이라 버튼 종류와 문구를 호출자가 정합니다. */
export const WithAction: Story = {
  args: {
    action: (
      <Button size="lg">
        <Plus />
        자료 만들기
      </Button>
    ),
  },
};

export const WithoutDescription: Story = {
  args: { description: undefined },
};

export const CustomIcon: Story = {
  args: {
    icon: <Search />,
    title: "검색 결과가 없어요",
    description: "다른 키워드로 다시 찾아보세요.",
  },
};
