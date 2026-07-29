import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Lightbulb } from "lucide-react";

import { Feedback } from "@/shared/components/ui/Feedback";

const meta = {
  title: "shared/components/ui/Feedback",
  component: Feedback,
  args: {
    children: "조금 더 자연스럽게 말할 수 있어요. 문장 끝을 올리지 말고 차분하게 마무리해 보세요.",
  },
  decorators: [
    (Story) => (
      <div className="w-105 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Feedback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Short: Story = {
  args: { children: "좋아요, 발음이 또렷해요." },
};

/** 여러 줄로 늘어날 때 아이콘이 첫 줄에 정렬되는지 확인합니다. */
export const LongText: Story = {
  args: {
    children:
      "문장 전체 흐름은 좋았어요. 다만 'would you like' 부분에서 강세가 뒤로 밀려서 조금 부자연스럽게 들렸습니다. 다음에는 조동사보다 본동사에 강세를 두고 말해 보세요.",
  },
};

export const CustomIcon: Story = {
  args: { icon: <Lightbulb /> },
};
