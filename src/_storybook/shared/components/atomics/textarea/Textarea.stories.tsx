import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "@/shared/components/atomics/textarea/Textarea";

const meta = {
  title: "shared/components/atomics/textarea/Textarea",
  component: Textarea,
  argTypes: {
    state: { control: "select", options: ["default", "error"] },
    disabled: { control: "boolean" },
  },
  args: {
    state: "default",
    placeholder: "외우고 싶은 영어 본문을 붙여넣거나 입력하세요.",
    rows: 6,
    disabled: false,
  },
  decorators: [
    (Story) => (
      <div className="w-105 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue:
      "Hi everyone, my name is Jihoon and I work as a front-end developer. I've been learning English for a while.",
  },
};

export const Error: Story = {
  args: { state: "error", defaultValue: "본문이 너무 짧습니다." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "사용할 수 없음" },
};

export const AllStates: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Textarea {...args} rows={3} />
      <Textarea {...args} rows={3} state="error" defaultValue="error" />
      <Textarea {...args} rows={3} disabled defaultValue="disabled" />
    </div>
  ),
};
