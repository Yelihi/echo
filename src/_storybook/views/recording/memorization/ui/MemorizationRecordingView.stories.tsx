import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getMemorizationReadyMockMaterial } from "@/views/memorization/config/readyMock";
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";
import { MemorizationRecordingView } from "@/views/recording/memorization/ui/MemorizationRecordingView";

const material = getMemorizationReadyMockMaterial("memo-1") as MemorizationReadyMaterial;

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
