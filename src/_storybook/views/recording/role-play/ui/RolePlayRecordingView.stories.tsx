import type { Meta, StoryObj } from "@storybook/nextjs-vite";

// views
import type { RoleplayReadyMaterial } from "@/views/role-play/models/interface";
import { RolePlayRecordingView } from "@/views/recording/role-play/ui/RolePlayRecordingView";

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
};

const meta = {
  title: "views/recording/role-play/ui/RolePlayRecordingView",
  component: RolePlayRecordingView,
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
