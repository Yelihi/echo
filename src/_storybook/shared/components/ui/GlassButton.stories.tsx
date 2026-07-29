import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RotateCcw, SkipForward } from "lucide-react";

import { GlassButton } from "@/shared/components/ui/GlassButton";

const meta = {
  title: "shared/components/ui/GlassButton",
  component: GlassButton,
  globals: {
    backgrounds: { value: "session" },
  },
  argTypes: {
    emphasis: { control: "select", options: ["secondary", "primary"] },
    disabled: { control: "boolean" },
  },
  args: {
    emphasis: "secondary",
    disabled: false,
    children: "다시 듣기",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GlassButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};

export const Primary: Story = {
  args: { emphasis: "primary", children: "시작하기" },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <RotateCcw />
        다시 듣기
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2.5">
      <GlassButton emphasis="secondary">
        <RotateCcw />
        다시 듣기
      </GlassButton>
      <GlassButton emphasis="secondary">
        <SkipForward />
        건너뛰기
      </GlassButton>
      <GlassButton emphasis="primary">시작하기</GlassButton>
    </div>
  ),
};
