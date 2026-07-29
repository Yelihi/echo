import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

import { ChatBubbleInput } from "@/shared/components/ui/ChatBubbleInput";
import { ChatEditorRow } from "@/shared/components/ui/ChatEditorRow";

type ChatEditorRowStoryArgs = {
  speaker: "partner" | "me";
};

const meta = {
  title: "shared/components/ui/ChatEditorRow",
  argTypes: {
    speaker: { control: "select", options: ["partner", "me"] },
  },
  args: {
    speaker: "partner",
  },
  decorators: [
    (Story) => (
      <div className="w-125 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<ChatEditorRowStoryArgs>;

export default meta;
type Story = StoryObj<ChatEditorRowStoryArgs>;

/** 화자 전환·삭제는 호출자가 소유합니다. */
function ChatEditorRowDemo({ speaker: initial }: ChatEditorRowStoryArgs) {
  const [speaker, setSpeaker] = React.useState<"partner" | "me">(initial);

  return (
    <ChatEditorRow
      speaker={speaker}
      speakerLabel={speaker === "me" ? "나" : "상대방"}
      onFlipSpeaker={() => setSpeaker((prev) => (prev === "me" ? "partner" : "me"))}
    >
      <ChatBubbleInput
        speaker={speaker}
        defaultValue={
          speaker === "me" ? "Hi, I'd like to ask about my order." : "Hi! How can I help you today?"
        }
      />
    </ChatEditorRow>
  );
}

export const Partner: Story = {
  render: (args) => <ChatEditorRowDemo {...args} />,
};

export const Me: Story = {
  args: { speaker: "me" },
  render: (args) => <ChatEditorRowDemo {...args} />,
};

/** 삭제 버튼은 행에 hover 했을 때만 나타납니다. */
export const Conversation: Story = {
  render: () => (
    <div className="flex flex-col gap-3.5">
      <ChatEditorRow speaker="partner" speakerLabel="상대방">
        <ChatBubbleInput
          speaker="partner"
          defaultValue="Good morning! Do you have a reservation?"
        />
      </ChatEditorRow>
      <ChatEditorRow speaker="me" speakerLabel="나">
        <ChatBubbleInput speaker="me" defaultValue="Yes, it's under the name Lee." />
      </ChatEditorRow>
      <ChatEditorRow speaker="partner" speakerLabel="상대방">
        <ChatBubbleInput speaker="partner" defaultValue="Great, a table for two by the window?" />
      </ChatEditorRow>
    </div>
  ),
};
