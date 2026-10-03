import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LatestSessionsView } from "@/views/latest-sessions";

const meta = {
  title: "views/latest-sessions/ui/LatestSessionsView",
  component: LatestSessionsView,
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: "/sessions" } } },
  args: {
    sessions: [
      {
        id: "1",
        title: "카페에서 주문하기",
        sessionDate: new Date("2026-09-10"),
        description: "문장 10개",
        sessionType: "role-playing",
        sessionState: "failed",
        href: "/roleplay-sessions/1/result",
      },
      {
        id: "2",
        title: "여행 이야기",
        sessionDate: new Date("2026-09-10"),
        description: "문단 3개",
        sessionType: "memorization",
        sessionState: "inProgress",
        href: "/memorization-sessions/2/result",
      },
    ],
  },
  decorators: [
    (Story) => (
      <main className="mx-auto max-w-320 px-6 py-10">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof LatestSessionsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { sessions: [] } };
export const Paginated: Story = {
  args: {
    query: { page: 2, status: "all", sort: "newest" },
    totalCount: 25,
    totalPages: 3,
    sessions: Array.from({ length: 10 }, (_, index) => ({
      id: String(index),
      title:
        index === 0
          ? "카페에서 처음 만난 동료와 주말 여행 계획에 대해 길게 대화하기"
          : `연습 기록 ${index + 1}`,
      sessionDate: new Date("2026-09-10"),
      description: "문장 10개",
      sessionType: index % 2 ? ("memorization" as const) : ("role-playing" as const),
      sessionState: index % 2 ? ("partial" as const) : ("completed" as const),
      href: `/roleplay-sessions/${index}/result`,
    })),
  },
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/sessions", query: { page: "2" } } },
  },
};
export const FilteredEmpty: Story = {
  args: { sessions: [], query: { page: 1, status: "failed", sort: "newest" } },
};

export const ResumePractice: Story = {
  args: {
    sessions: [
      {
        ...meta.args.sessions[0],
        sessionState: "practicing",
        description: "2/5문장 저장",
        href: "/role-playing/material/session/session",
      },
      ...meta.args.sessions,
    ],
  },
};
