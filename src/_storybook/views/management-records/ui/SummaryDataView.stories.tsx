import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SummaryDataView from "@/views/management-records/ui/SummaryDataView";

const meta = {
  title: "views/management-records/ui/SummaryDataView",
  component: SummaryDataView,
  decorators: [
    (Story) => (
      <div className="w-full p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SummaryDataView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    recordsSummary: {
      total: 7,
      connected: 3,
      failDelete: 1,
      orphaned: 3,
    },
  },
};
