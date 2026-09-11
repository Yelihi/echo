import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HistoryEmptyState } from "@/views/latest-sessions/ui/HistoryEmptyState";

const meta = {
  title: "views/latest-sessions/ui/HistoryEmptyState",
  component: HistoryEmptyState,
  args: { filtered: false },
} satisfies Meta<typeof HistoryEmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const NoHistory: Story = {};
export const NoMatches: Story = { args: { filtered: true } };
