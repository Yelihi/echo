import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Clock, MessageCircle, Mic } from "lucide-react";

import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";

const meta = {
  title: "shared/components/atomics/stat-item/StatItem",
  component: StatItem,
  globals: {
    backgrounds: { value: "session" },
  },
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
  },
  args: {
    icon: <MessageCircle />,
    value: 6,
    label: "총 대사",
  },
  decorators: [
    (Story) => (
      <div className="rounded-2xl bg-blue-primary p-6 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** 세션 준비 화면 히어로에 실제로 나란히 놓이는 3칸 조합 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-6.5">
      <StatItem icon={<MessageCircle />} value={6} label="총 대사" />
      <StatItem icon={<Mic />} value={3} label="내 차례" />
      <StatItem icon={<Clock />} value="~5분" label="예상 시간" />
    </div>
  ),
};
