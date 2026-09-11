import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import type { MemorizationReadyMaterial } from "@/features/memorization-sessions/models/ready";
import { MemorizationRecordingView } from "@/views/recording/ui/memorization/MemorizationRecordingView";

const material: MemorizationReadyMaterial = {
  id: "11111111-1111-4111-8111-111111111111",
  tags: ["Speech", "Daily"],
  title: "Daily Speaking",
  description: "English is a daily habit.",
  paragraphCount: 2,
  wordCount: 10,
  estimatedMinutes: 1,
  difficulty: "Daily",
  previewLines: [
    { label: "문단 1", text: "English is a daily habit. I practice every morning." },
    { label: "문단 2", text: "Small steps make a difference. I keep learning every day." },
  ],
};

const meta = {
  title: "views/recording/memorization/ui/MemorizationRecordingView",
  component: MemorizationRecordingView,
  globals: {
    backgrounds: { value: "session" },
  },
  args: {
    material,
  },
} satisfies Meta<typeof MemorizationRecordingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const Preview: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "단락 미리 보기" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await waitFor(() => expect(within(dialog).getByText("문단 2", { exact: false })).toBeVisible());
  },
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
