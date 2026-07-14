import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/shared/components/atomics/button/Button";

const meta = {
  title: "shared/components/atomics/button/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
  args: {
    children: "Button",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "default",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    size: "default",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "default",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "default",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    size: "default",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    size: "default",
  },
};

export const Disabled: Story = {
  args: {
    variant: "default",
    size: "default",
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} variant="default">
        Default
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="destructive">
        Destructive
      </Button>
      <Button {...args} variant="link">
        Link
      </Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button {...args} size="xs">
        XS
      </Button>
      <Button {...args} size="sm">
        SM
      </Button>
      <Button {...args} size="default">
        Default
      </Button>
      <Button {...args} size="lg">
        LG
      </Button>
    </div>
  ),
};
