import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HistoryToolbar } from "@/views/latest-sessions/ui/HistoryToolbar";

const meta = {
  title: "views/latest-sessions/ui/HistoryToolbar",
  component: HistoryToolbar,
  parameters: { nextjs: { appDirectory: true, navigation: { pathname: "/sessions" } } },
  args: { query: { page: 1, status: "all", sort: "newest" }, totalCount: 8 },
  decorators: [
    (Story) => (
      <div className="w-full max-w-5xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HistoryToolbar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Filtered: Story = {
  args: { query: { page: 1, status: "partial", sort: "oldest" }, totalCount: 2 },
};
export const Empty: Story = { args: { totalCount: 0 } };
export const LargeCount: Story = { args: { totalCount: 12840 } };
export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[375px]">
        <Story />
      </div>
    ),
  ],
};
