import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChatBubble } from "@/shared/components/ui/ChatBubble";

const meta = {
  title: "shared/components/ui/ChatBubble",
  component: ChatBubble,
  argTypes: {
    speaker: { control: "select", options: ["partner", "me"] },
  },
  args: {
    speaker: "partner",
    children: "What size would you like?",
  },
  decorators: [
    (Story) => (
      <div className="w-125 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Partner: Story = {};

export const Me: Story = {
  args: { speaker: "me", children: "I'd like an iced americano, please." },
};

/** 결과 화면의 대화 기록. 편집용은 ChatBubbleInput 입니다. */
export const Transcript: Story = {
  render: () => (
    <div className="flex flex-col gap-2.5">
      <ChatBubble speaker="partner">What can I get started for you today?</ChatBubble>
      <div className="flex justify-end">
        <ChatBubble speaker="me">I&apos;d like an iced americano, please.</ChatBubble>
      </div>
      <ChatBubble speaker="partner">What size would you like?</ChatBubble>
      <div className="flex justify-end">
        <ChatBubble speaker="me">A large one, and could you make it less sweet?</ChatBubble>
      </div>
    </div>
  ),
};
