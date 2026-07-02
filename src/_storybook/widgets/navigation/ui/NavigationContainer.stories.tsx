import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NavigationContainer } from "@/widgets/navigation/ui/NavigationContainer";

const meta = {
  title: "widgets/navigation/ui/NavigationContainer",
  component: NavigationContainer,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[64px] w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavigationContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
