import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LatestSessionsView } from "@/views/latest-sessions";

const meta = {
  title: "views/latest-sessions/ui/LatestSessionsView",
  component: LatestSessionsView,
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
