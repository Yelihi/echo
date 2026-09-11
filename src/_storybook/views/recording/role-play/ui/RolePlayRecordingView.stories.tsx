import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

// views
import type { RoleplayReadyMaterial } from "@/views/role-play/models/interface";
import { RolePlayRecordingView } from "@/views/recording/ui/role-play/RolePlayRecordingView";

const material: RoleplayReadyMaterial = {
  id: "11111111-1111-4111-8111-111111111111",
  tags: ["일상", "초급"],
  title: "Ordering at a Cafe",
  description: "카페에서 주문하기",
  lineCount: 8,
  learnerTurnCount: 4,
  estimatedMinutes: 3,
  partnerRole: "상대방",
  partnerLine: "What can I get started for you today?",
  recordingTurns: [
    {
      learnerLineId: "22222222-2222-4222-8222-222222222222",
      partnerLine: "What can I get started for you today?",
    },
    {
      learnerLineId: "33333333-3333-4333-8333-333333333333",
      partnerLine: "Would you like it hot or iced?",
    },
  ],
  previewLines: [
    { label: "바리스타", text: "What can I get started for you today?" },
    { label: "나", text: "I'd like a latte, please." },
    { label: "바리스타", text: "Would you like it hot or iced?" },
    { label: "나", text: "Iced, please." },
  ],
};

const meta = {
  title: "views/recording/role-play/ui/RolePlayRecordingView",
  component: RolePlayRecordingView,
  parameters: { nextjs: { appDirectory: true } },
  globals: {
    backgrounds: { value: "session" },
  },
  args: {
    material,
    autoAdvancePartner: false,
  },
} satisfies Meta<typeof RolePlayRecordingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const Preview: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "문장 미리 보기" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByText("I'd like a latte, please.")).toBeVisible(),
    );
  },
};

export const PartnerSpeaking: Story = {
  args: { initialPhase: "partner-speaking" },
};

export const UserReady: Story = {
  args: { initialPhase: "user-ready" },
};

export const Recording: Story = {
  args: { initialPhase: "recording" },
};

export const Recorded: Story = {
  args: { initialPhase: "recorded" },
};

export const Failed: Story = {
  args: { initialPhase: "failed" },
};
export const Completed: Story = { args: { initialPhase: "completed" } };
export const LearnerEndsConversation: Story = {
  args: { resume: { phase: "user-ready", step: 2, closingPartner: false } },
};
export const PartnerEndsConversation: Story = {
  args: {
    autoAdvancePartner: true,
    material: {
      ...material,
      recordingTurns: [
        {
          learnerLineId: "22222222-2222-4222-8222-222222222222",
          partnerLine: "What can I get started for you today?",
          closingPartnerLine: "Thank you. Have a lovely day!",
        },
      ],
    },
  },
};
