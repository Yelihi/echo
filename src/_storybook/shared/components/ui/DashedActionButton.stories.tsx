import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SplitSquareVertical, Upload } from "lucide-react";

import { DashedActionButton } from "@/shared/components/ui/DashedActionButton";

const meta = {
  title: "shared/components/ui/DashedActionButton",
  component: DashedActionButton,
  argTypes: {
    size: { control: "select", options: ["md", "lg"] },
    disabled: { control: "boolean" },
  },
  args: {
    size: "md",
    disabled: false,
    icon: <SplitSquareVertical />,
    children: "AI 문단 분리 제안 받기",
  },
  decorators: [
    (Story) => (
      <div className="w-130 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashedActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 문장암기 에디터의 AI 문단 분리 요청 */
export const Medium: Story = {};

/** 롤플레잉 에디터의 txt 업로드 */
export const Large: Story = {
  args: {
    size: "lg",
    icon: <Upload />,
    children: "txt 파일 업로드 — AI가 화자별로 대사를 나눠 드려요",
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <DashedActionButton {...args} size="md" />
      <DashedActionButton {...args} size="lg" icon={<Upload />}>
        txt 파일 업로드
      </DashedActionButton>
    </div>
  ),
};
