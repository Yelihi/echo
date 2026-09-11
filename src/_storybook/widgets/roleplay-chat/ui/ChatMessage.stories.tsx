import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ChatMessage } from "@/widgets/roleplay-chat/ui/ChatMessage";
import type { ChatMessageProps } from "@/widgets/roleplay-chat/models/interface";

const meta = {
  title: "widgets/roleplay-chat/ui/ChatMessage",
  component: ChatMessage,
  parameters: { a11y: { test: "error" } },
  args: {
    id: "demo-line" as ChatMessageProps["id"],
    speakerId: "demo-speaker" as ChatMessageProps["speakerId"],
    order: 1,
    text: "Could I have a coffee, please?",
    changeOrder: fn(),
    changeMessage: fn(),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
  render: function Editable(args) {
    const [order, setOrder] = useState(args.order);
    const [text, setText] = useState(args.text);
    return (
      <ChatMessage
        {...args}
        order={order}
        text={text}
        changeOrder={(id, next) => {
          setOrder(next);
          args.changeOrder(id, next);
        }}
        changeMessage={(id, next) => {
          setText(next);
          args.changeMessage(id, next);
        }}
      />
    );
  },
} satisfies Meta<typeof ChatMessage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Editable: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "화자 바꾸기" }));
    await expect(args.changeOrder).toHaveBeenCalledWith(args.id, 2);
    const input = canvas.getByRole("textbox", { name: "내 대사" });
    await userEvent.clear(input);
    await userEvent.type(input, "Thank you!");
    await expect(input).toHaveValue("Thank you!");
    await expect(args.changeMessage).toHaveBeenLastCalledWith(args.id, "Thank you!");
  },
};
