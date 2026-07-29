import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Spinner } from "@/shared/components/atomics/spinner/Spinner";

const meta = {
  title: "shared/components/atomics/spinner/Spinner",
  component: Spinner,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
  args: {
    size: "default",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: "sm" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <Spinner {...args} size="sm" />
      <Spinner {...args} size="default" />
      <Spinner {...args} size="lg" />
    </div>
  ),
};
