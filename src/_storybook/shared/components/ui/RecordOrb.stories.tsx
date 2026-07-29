import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RecordOrb } from "@/shared/components/ui/RecordOrb";

const meta = {
  title: "shared/components/ui/RecordOrb",
  component: RecordOrb,
  globals: {
    backgrounds: { value: "session" },
  },
  argTypes: {
    state: { control: "select", options: ["idle", "recording", "analyzing"] },
  },
  args: {
    state: "idle",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecordOrb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Recording: Story = {
  args: { state: "recording" },
};

export const Analyzing: Story = {
  args: { state: "analyzing" },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-6">
      <RecordOrb {...args} state="idle" />
      <RecordOrb {...args} state="recording" />
      <RecordOrb {...args} state="analyzing" />
    </div>
  ),
};
