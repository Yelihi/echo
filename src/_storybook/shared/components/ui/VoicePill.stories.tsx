import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Volume2 } from "lucide-react";

import { VoicePill } from "@/shared/components/ui/VoicePill";

const meta = {
  title: "shared/components/ui/VoicePill",
  component: VoicePill,
  globals: {
    backgrounds: { value: "app" },
  },
  argTypes: {
    selected: { control: "boolean" },
    label: { control: "text" },
    sub: { control: "text" },
  },
  args: {
    icon: <Volume2 />,
    label: "Emma",
    sub: "여성 · 차분함",
    selected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-40 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VoicePill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

/** 상대방 음성 선택에 실제로 나란히 놓이는 3개 조합 */
export const AllVariants: Story = {
  decorators: [
    (Story) => (
      <div className="flex w-120 gap-2.5 p-4">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <>
      <VoicePill icon={<Volume2 />} label="Emma" sub="여성 · 차분함" selected />
      <VoicePill icon={<Volume2 />} label="James" sub="남성 · 또렷함" />
      <VoicePill icon={<Volume2 />} label="Sofia" sub="여성 · 발랄함" />
    </>
  ),
};
