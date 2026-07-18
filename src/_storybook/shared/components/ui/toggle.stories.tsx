import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bold } from "lucide-react";

import { Toggle } from "@/shared/components/ui/toggle";

const meta = {
  title: "shared/components/ui/Toggle",
  component: Toggle,
  argTypes: {
    theme: {
      control: "select",
      options: ["blue", "black"],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
  args: {
    theme: "blue",
    size: "default",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Toggle",
  },
};

export const Black: Story = {
  args: {
    theme: "black",
    children: "Toggle",
  },
};

export const Pressed: Story = {
  args: {
    pressed: true,
    children: "Toggle",
  },
};

export const WithIcon: Story = {
  render: (args) => (
    <Toggle {...args} aria-label="Toggle bold">
      <Bold />
    </Toggle>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Toggle",
  },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Toggle {...args} size="sm">
        SM
      </Toggle>
      <Toggle {...args} size="default">
        Default
      </Toggle>
      <Toggle {...args} size="lg">
        LG
      </Toggle>
    </div>
  ),
};
