import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bold } from "lucide-react";

import { Toggle } from "@/shared/components/ui/toggle";

const meta = {
  title: "shared/components/ui/Toggle",
  component: Toggle,
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Toggle variant="default" size="default">
      Toggle
    </Toggle>
  ),
};

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" size="default">
      Toggle
    </Toggle>
  ),
};

export const Pressed: Story = {
  render: () => (
    <Toggle variant="default" size="default" pressed>
      Toggle
    </Toggle>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Toggle variant="outline" size="default" aria-label="Toggle bold">
      <Bold />
    </Toggle>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Toggle variant="default" size="default" disabled>
      Toggle
    </Toggle>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle variant="outline" size="sm">
        SM
      </Toggle>
      <Toggle variant="outline" size="default">
        Default
      </Toggle>
      <Toggle variant="outline" size="lg">
        LG
      </Toggle>
    </div>
  ),
};
