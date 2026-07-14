import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/shared/components/atomics/badge/Badge";

const meta = {
  title: "shared/components/atomics/badge/Badge",
  component: Badge,
  argTypes: {
    theme: {
      control: "select",
      options: ["blue", "red", "green", "yellow"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
  },
  args: {
    value: "badge",
    children: "Badge",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blue: Story = {
  args: {
    theme: "blue",
    size: "small",
  },
};

export const Red: Story = {
  args: {
    theme: "red",
    size: "small",
  },
};

export const Green: Story = {
  args: {
    theme: "green",
    size: "small",
  },
};

export const Yellow: Story = {
  args: {
    theme: "yellow",
    size: "small",
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Badge {...args} size="small">
        Small
      </Badge>
      <Badge {...args} size="medium">
        Medium
      </Badge>
      <Badge {...args} size="large">
        Large
      </Badge>
    </div>
  ),
};

export const AllThemes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Badge {...args} theme="blue">
        Blue
      </Badge>
      <Badge {...args} theme="red">
        Red
      </Badge>
      <Badge {...args} theme="green">
        Green
      </Badge>
      <Badge {...args} theme="yellow">
        Yellow
      </Badge>
    </div>
  ),
};
