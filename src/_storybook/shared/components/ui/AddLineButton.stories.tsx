import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AddLineButton } from "@/shared/components/ui/AddLineButton";

const meta = {
  title: "shared/components/ui/AddLineButton",
  component: AddLineButton,
  argTypes: {
    speaker: { control: "select", options: ["partner", "me"] },
  },
  args: {
    speaker: "partner",
    children: "상대방 대사",
  },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AddLineButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Partner: Story = {};

export const Me: Story = {
  args: { speaker: "me", children: "내 대사" },
};

/** 실제 에디터에서는 두 개가 나란히 놓입니다. hover 하면 강조 색이 들어옵니다. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex justify-center gap-2.5">
      <AddLineButton speaker="partner">상대방 대사</AddLineButton>
      <AddLineButton speaker="me">내 대사</AddLineButton>
    </div>
  ),
};
