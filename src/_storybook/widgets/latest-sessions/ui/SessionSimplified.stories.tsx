import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SESSION_SIMPLIFIED_SKELETON_COUNT,
  SessionSimplified,
  SessionSimplifiedSkeleton,
} from "@/widgets/latest-sessions/ui/SessionSimplified";

const meta = {
  title: "widgets/latest-sessions/ui/SessionSimplified",
  component: SessionSimplified,
  decorators: [
    (Story) => (
      <div className="w-[1020px] p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionSimplified>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RolePlaying: Story = {
  args: {
    title: "카페에서 주문하기",
    sessionDate: new Date(),
    description: "역할극 연습",
    sessionType: "role-playing",
    sessionState: "completed",
    href: "/roleplay-sessions/11111111-1111-4111-8111-111111111111/result",
  },
};

export const Memorization: Story = {
  args: {
    title: "비즈니스 표현 암기",
    sessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    description: "문장 암기",
    sessionType: "memorization",
    sessionState: "failed",
    href: "/memorization-sessions/33333333-3333-4333-8333-333333333333/result",
  },
};

export const Disabled: Story = {
  args: {
    title: "TED 발췌 · 습관의 힘",
    sessionDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    description: "분석 대기",
    sessionType: "memorization",
    sessionState: "pending",
    disabled: true,
  },
};

export const Skeleton: StoryObj = {
  render: () => <SessionSimplifiedSkeleton />,
};

export const SkeletonList: StoryObj = {
  render: () => (
    <div className="flex w-full flex-col gap-2.5">
      {Array.from({ length: SESSION_SIMPLIFIED_SKELETON_COUNT }, (_, index) => (
        <SessionSimplifiedSkeleton key={index} />
      ))}
    </div>
  ),
};
