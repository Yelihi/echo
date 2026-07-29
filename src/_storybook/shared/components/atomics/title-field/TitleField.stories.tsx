import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TitleField } from "@/shared/components/atomics/title-field/TitleField";

const meta = {
  title: "shared/components/atomics/title-field/TitleField",
  component: TitleField,
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: {
    placeholder: "제목 (예: 카페에서 주문하기)",
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-105 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TitleField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: "카페에서 음료 주문하기" },
};

export const MemoPlaceholder: Story = {
  args: { placeholder: "제목 (예: 모임 자기소개)" },
};
