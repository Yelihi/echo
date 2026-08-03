import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Clock, MessageCircle, Mic } from "lucide-react";

import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import { SessionReadyHero } from "@/shared/components/ui/SessionReadyHero";

const meta = {
  title: "shared/components/ui/SessionReadyHero",
  component: SessionReadyHero,
  globals: {
    backgrounds: { value: "app" },
  },
  argTypes: {
    theme: { control: "select", options: ["roleplay", "memo"] },
  },
  args: {
    theme: "roleplay",
    tags: ["일상", "초급"],
    title: "Ordering a coffee",
    subtitle: "카페에서 커피 주문하기 연습",
    children: (
      <>
        <StatItem icon={<MessageCircle />} value={6} label="총 대사" />
        <StatItem icon={<Mic />} value={3} label="내 차례" />
        <StatItem icon={<Clock />} value="~5분" label="예상 시간" />
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-150 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionReadyHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Roleplay: Story = {};

export const Memo: Story = {
  args: {
    theme: "memo",
    tags: ["비즈니스", "중급"],
    title: "Self introduction",
    subtitle: "자기소개 문장 암기 연습",
    children: (
      <>
        <StatItem icon={<MessageCircle />} value={5} label="문단" />
        <StatItem icon={<Mic />} value={42} label="단어" />
        <StatItem icon={<Clock />} value="~8분" label="예상 시간" />
      </>
    ),
  },
};
