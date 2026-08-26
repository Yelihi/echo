import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";
import { MemorizationRecordingView } from "@/views/recording/memorization/ui/MemorizationRecordingView";

const material: MemorizationReadyMaterial = {
  id: "11111111-1111-4111-8111-111111111111",
  tags: ["Speech", "Daily"],
  title: "Daily Speaking",
  description: "English is a daily habit.",
  paragraphCount: 2,
  wordCount: 10,
  estimatedMinutes: 1,
  difficulty: "Daily",
};

const meta = {
  title: "views/recording/memorization/ui/MemorizationRecordingView",
  component: MemorizationRecordingView,
  globals: {
    backgrounds: { value: "session" },
  },
  args: {
    material,
    autoAdvancePartner: false,
  },
} satisfies Meta<typeof MemorizationRecordingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const UserReady: Story = {
  args: { initialPhase: "user-ready" },
};

export const Recording: Story = {
  args: { initialPhase: "recording" },
};

export const Recorded: Story = {
  args: { initialPhase: "recorded" },
};
