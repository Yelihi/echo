import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChatBubbleInput } from "@/shared/components/ui/ChatBubbleInput";

const meta = {
  title: "shared/components/ui/ChatBubbleInput",
  component: ChatBubbleInput,
  argTypes: {
    speaker: { control: "select", options: ["partner", "me"] },
  },
  args: {
    speaker: "partner",
    placeholder: "상대방 대사를 입력하세요",
    rows: 1,
  },
  decorators: [
    (Story) => (
      <div className="w-90 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatBubbleInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Partner: Story = {
  args: { defaultValue: "Hi! How can I help you today?" },
};

export const Me: Story = {
  args: {
    speaker: "me",
    placeholder: "내 영어 대사를 입력하세요",
    defaultValue: "Hi, I'd like to ask about my order.",
  },
};

export const Empty: Story = {};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <ChatBubbleInput {...args} speaker="partner" defaultValue="Hi! How can I help you today?" />
      <ChatBubbleInput {...args} speaker="me" defaultValue="Hi, I'd like to ask about my order." />
    </div>
  ),
};
