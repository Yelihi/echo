import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "@/shared/components/atomics/input/Input";

const meta = {
  title: "shared/components/atomics/input/Input",
  component: Input,
  argTypes: {
    state: {
      control: "select",
      options: ["default", "error"],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    state: "default",
    placeholder: "내용을 입력하세요",
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: "카페에서 주문하기" },
};

/** state="error" 를 주면 aria-invalid 가 함께 설정됩니다. */
export const Error: Story = {
  args: { state: "error", defaultValue: "잘못된 입력" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "사용할 수 없음" },
};

export const AllStates: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} placeholder="default" />
      <Input {...args} state="error" defaultValue="error" />
      <Input {...args} disabled defaultValue="disabled" />
    </div>
  ),
};
