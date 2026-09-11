import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HistoryFilterControls } from "@/views/latest-sessions/ui/HistoryFilters";

const meta = {
  title: "views/latest-sessions/ui/HistoryFilters",
  component: HistoryFilterControls,
  args: { query: { page: 1, status: "all", sort: "newest" }, onChange: () => {} },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HistoryFilterControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: function Interactive(args) {
    const [query, setQuery] = useState(args.query);
    return (
      <HistoryFilterControls
        {...args}
        query={query}
        onChange={(change) => setQuery({ ...query, ...change, page: 1 })}
      />
    );
  },
};
export const Filtered: Story = { args: { query: { page: 1, status: "partial", sort: "oldest" } } };
export const Loading: Story = { args: { pending: true } };
export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-[320px]">
        <Story />
      </div>
    ),
  ],
};
