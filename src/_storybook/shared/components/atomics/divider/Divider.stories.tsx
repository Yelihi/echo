import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Divider } from "@/shared/components/atomics/divider/Divider";

const meta = {
  title: "shared/components/atomics/divider/Divider",
  component: Divider,
  decorators: [
    (Story) => (
      <div className="w-64 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
