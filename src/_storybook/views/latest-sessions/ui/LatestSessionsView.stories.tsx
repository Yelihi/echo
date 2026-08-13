import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LatestSessionsView } from "@/views/latest-sessions";

const meta = {
  title: "views/latest-sessions/ui/LatestSessionsView",
  component: LatestSessionsView,
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
