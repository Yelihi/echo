import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getRoleplayReadyMockMaterial } from "@/views/role-play/config/readyMock";
import type { RoleplayReadyMaterial } from "@/views/role-play/models/ready";
import { RolePlayRecordingView } from "@/views/recording/role-play/ui/RolePlayRecordingView";

const material = getRoleplayReadyMockMaterial("1") as RoleplayReadyMaterial;

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
