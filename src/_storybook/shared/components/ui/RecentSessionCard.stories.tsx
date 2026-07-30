import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SessionStateBadge } from "@/shared/components/ui/SessionStateBadge";
import { RecentSessionCard } from "@/shared/components/ui/RecentSessionCard";

const meta = {
  title: "shared/components/ui/RecentSessionCard",
  component: RecentSessionCard,
  globals: {
    backgrounds: { value: "app" },
  },
  argTypes: {
    kind: { control: "select", options: ["roleplay", "memo"] },
  },
  args: {
    kind: "roleplay",
    title: "카페에서 주문하기",
    meta: "2시간 전 · 문장 8개",
    status: <SessionStateBadge state="completed" />,
  },
  decorators: [
    (Story) => (
      <div className="w-125 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecentSessionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Roleplay: Story = {};

export const Memo: Story = {
  args: {
    kind: "memo",
    title: "비즈니스 이메일 표현",
    meta: "어제 · 문단 5개",
    status: <SessionStateBadge state="inProgress" />,
  },
};

export const WithoutStatus: Story = {
  args: { status: undefined },
};

/** 긴 제목은 한 줄로 잘립니다. */
export const LongTitle: Story = {
  args: { title: "공항 체크인 카운터에서 수하물과 좌석을 요청하는 긴 상황 대화" },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <RecentSessionCard
        {...args}
        kind="roleplay"
        status={<SessionStateBadge state="completed" />}
      />
      <RecentSessionCard
        {...args}
        kind="memo"
        title="비즈니스 이메일 표현"
        meta="어제 · 문단 5개"
        status={<SessionStateBadge state="inProgress" />}
      />
      <RecentSessionCard
        {...args}
        kind="roleplay"
        title="공항 체크인 대화"
        meta="3일 전 · 문장 6개"
        status={<SessionStateBadge state="failed" />}
      />
    </div>
  ),
};
